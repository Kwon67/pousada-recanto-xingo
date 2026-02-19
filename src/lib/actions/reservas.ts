'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdminActionSession } from '@/lib/admin-action-guard';
import { enviarEmailConfirmacao, enviarEmailStatus } from '@/lib/email';
import { getSiteUrl } from '@/lib/site-url';
import { createStripeCheckoutSession, getStripePaymentIntentId } from '@/lib/stripe';
import { reservasMock } from '@/data/mock';
import type { Reserva, StatusReserva } from '@/types/reserva';

interface CriarReservaData {
  quarto_id: string;
  quarto_nome: string;
  hospede_nome: string;
  hospede_email: string;
  hospede_telefone: string;
  hospede_cpf: string;
  hospede_cidade: string;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  noites: number;
  valor_total: number;
  observacoes?: string;
}

const STATUSES_QUE_BLOQUEIAM: StatusReserva[] = ['pendente', 'confirmada'];

export async function criarReserva(data: CriarReservaData) {
  let reservaCriadaId: string | null = null;

  try {
    const supabase = createAdminClient();

    // 1. Upsert hóspede por email
    const { data: hospede, error: hospedeError } = await supabase
      .from('hospedes')
      .upsert(
        {
          nome: data.hospede_nome,
          email: data.hospede_email,
          telefone: data.hospede_telefone,
          cpf: data.hospede_cpf,
          cidade: data.hospede_cidade,
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single();

    if (hospedeError) throw new Error(`Erro ao salvar hóspede: ${hospedeError.message}`);

    // 2. Verificar disponibilidade (race condition guard)
    const { data: conflitos, error: conflitosError } = await supabase
      .from('reservas')
      .select('id')
      .eq('quarto_id', data.quarto_id)
      .in('status', STATUSES_QUE_BLOQUEIAM)
      .lt('check_in', data.check_out)
      .gt('check_out', data.check_in);

    if (conflitosError) throw new Error(`Erro ao verificar disponibilidade: ${conflitosError.message}`);

    if (conflitos.length > 0) {
      return { success: false, error: 'Este quarto não está mais disponível para as datas selecionadas.' };
    }

    // 3. Inserir reserva pendente de pagamento
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert({
        quarto_id: data.quarto_id,
        hospede_id: hospede.id,
        check_in: data.check_in,
        check_out: data.check_out,
        num_hospedes: data.num_hospedes,
        valor_total: data.valor_total,
        status: 'pendente',
        stripe_payment_status: 'pendente',
        observacoes: data.observacoes || null,
      })
      .select('id')
      .single();

    if (reservaError) throw new Error(`Erro ao criar reserva: ${reservaError.message}`);
    reservaCriadaId = reserva.id;

    // 4. Criar sessão de checkout no Stripe
    const siteUrl = getSiteUrl();
    const checkoutSession = await createStripeCheckoutSession({
      reservaId: reserva.id,
      quartoNome: data.quarto_nome,
      hospedeNome: data.hospede_nome,
      hospedeEmail: data.hospede_email,
      valorTotal: data.valor_total,
      successUrl: `${siteUrl}/reservas/confirmacao?id=${reserva.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/reservas/confirmacao?id=${reserva.id}&payment=cancelado`,
      metadata: {
        check_in: data.check_in,
        check_out: data.check_out,
      },
    });

    if (!checkoutSession.url) {
      throw new Error('Stripe não retornou a URL de checkout para continuar o pagamento.');
    }

    const paymentIntentId = getStripePaymentIntentId(checkoutSession.payment_intent);
    const { error: stripeRefError } = await supabase
      .from('reservas')
      .update({
        stripe_checkout_session_id: checkoutSession.id,
        stripe_payment_intent_id: paymentIntentId,
        stripe_payment_status:
          checkoutSession.payment_status === 'paid' ? 'pago' : 'pendente',
        stripe_payment_method: checkoutSession.payment_method_types?.[0] || null,
      })
      .eq('id', reserva.id);

    if (stripeRefError) {
      throw new Error(`Erro ao vincular checkout Stripe à reserva: ${stripeRefError.message}`);
    }

    // 5. Revalidar paths
    revalidatePath('/reservas');
    revalidatePath('/admin/reservas');
    revalidatePath('/admin');

    return {
      success: true,
      reservaId: reserva.id,
      checkoutUrl: checkoutSession.url,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar reserva';
    console.error('criarReserva error:', message);

    if (reservaCriadaId) {
      try {
        const supabase = createAdminClient();
        await supabase
          .from('reservas')
          .update({
            status: 'cancelada',
            stripe_payment_status: 'falhou',
          })
          .eq('id', reservaCriadaId)
          .eq('status', 'pendente');
      } catch (rollbackErr) {
        console.error('criarReserva rollback error:', rollbackErr);
      }
    }

    return { success: false, error: message };
  }
}

export async function getReservas(filtro?: { status?: string; busca?: string }): Promise<Reserva[]> {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('reservas')
      .select(`
        *,
        quarto:quartos(nome, imagem_principal, categoria, preco_diaria, preco_fds),
        hospede:hospedes(nome, email, telefone, cpf, cidade)
      `)
      .order('created_at', { ascending: false });

    if (filtro?.status) {
      query = query.eq('status', filtro.status as StatusReserva);
    }

    const { data, error } = await query;
    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let reservas = data as any[];
    if (filtro?.busca) {
      const busca = filtro.busca.toLowerCase();
      reservas = reservas.filter(
        (r) => r.hospede?.nome?.toLowerCase().includes(busca)
      );
    }

    return reservas;
  } catch {
    let reservas = [...reservasMock];
    if (filtro?.status) {
      reservas = reservas.filter((r) => r.status === filtro.status);
    }
    if (filtro?.busca) {
      const busca = filtro.busca.toLowerCase();
      reservas = reservas.filter(
        (r) => r.hospede?.nome?.toLowerCase().includes(busca)
      );
    }
    return reservas;
  }
}

export async function getReservaById(id: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        quarto:quartos(nome, imagem_principal, categoria, preco_diaria, preco_fds),
        hospede:hospedes(nome, email, telefone, cpf, cidade)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch {
    return reservasMock.find((r) => r.id === id) || null;
  }
}

export async function atualizarStatusReserva(id: string, status: StatusReserva) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const updatePayload: {
      status: StatusReserva;
      stripe_payment_status?: 'cancelado';
    } = { status };
    if (status === 'cancelada') {
      updatePayload.stripe_payment_status = 'cancelado';
    }

    const { error } = await supabase.from('reservas').update(updatePayload).eq('id', id);
    if (error) throw error;

    // Enviar email ao confirmar ou cancelar
    if (status === 'confirmada' || status === 'cancelada') {
      const { data: reserva } = await supabase
        .from('reservas')
        .select(`
          id, check_in, check_out,
          quarto:quartos(nome),
          hospede:hospedes(nome, email)
        `)
        .eq('id', id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = reserva as any;
      if (r?.hospede?.email) {
        await enviarEmailStatus({
          reservaId: r.id,
          hospedeNome: r.hospede.nome,
          hospedeEmail: r.hospede.email,
          quartoNome: r.quarto?.nome || 'Quarto',
          checkIn: r.check_in,
          checkOut: r.check_out,
          status,
        });
      }
    }
    revalidatePath('/admin/reservas');
    revalidatePath('/admin');
    revalidatePath('/reservas');
    revalidatePath('/quartos', 'layout');
    return {
      success: true,
      message: `Reserva ${status === 'confirmada' ? 'confirmada' : status === 'cancelada' ? 'cancelada' : 'atualizada'} com sucesso!`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar reserva';
    console.error('atualizarStatusReserva error:', message);
    return { success: false, message };
  }
}

export async function deletarReserva(id: string, senha: string) {
  await assertAdminActionSession();

  const senhaAdmin =
    process.env.ADMIN_DELETE_PASSWORD?.trim() ||
    process.env.ADMIN_PASSWORD?.trim();
  if (!senhaAdmin) {
    return {
      success: false,
      message:
        'Configure ADMIN_DELETE_PASSWORD (ou ADMIN_PASSWORD) no servidor.',
    };
  }

  if (senha.trim() !== senhaAdmin) {
    return { success: false, message: 'Senha incorreta.' };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('reservas').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao apagar reserva';
    console.error('deletarReserva error:', message);
    return { success: false, message };
  }

  revalidatePath('/admin/reservas');
  revalidatePath('/admin');
  revalidatePath('/reservas');
  revalidatePath('/quartos', 'layout');
  return { success: true, message: 'Reserva apagada com sucesso!' };
}

export async function criarReservaManual(data: {
  quarto_id: string;
  hospede_nome: string;
  hospede_email: string;
  hospede_telefone: string;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  valor_total: number;
  observacoes?: string;
}) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();

    // Upsert hóspede
    const { data: hospede, error: hospedeError } = await supabase
      .from('hospedes')
      .upsert(
        {
          nome: data.hospede_nome,
          email: data.hospede_email,
          telefone: data.hospede_telefone,
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single();

    if (hospedeError) throw hospedeError;

    // Insert reserva
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert({
        quarto_id: data.quarto_id,
        hospede_id: hospede.id,
        check_in: data.check_in,
        check_out: data.check_out,
        num_hospedes: data.num_hospedes,
        valor_total: data.valor_total,
        status: 'pendente',
        stripe_payment_status: 'nao_iniciado',
        observacoes: data.observacoes || null,
      })
      .select('id')
      .single();

    if (reservaError) throw reservaError;

    // Buscar nome do quarto para o email
    if (data.hospede_email) {
      const { data: quarto } = await supabase
        .from('quartos')
        .select('nome')
        .eq('id', data.quarto_id)
        .single();

      const checkInDate = new Date(data.check_in + 'T00:00:00');
      const checkOutDate = new Date(data.check_out + 'T00:00:00');
      const noites = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      await enviarEmailConfirmacao({
        reservaId: reserva.id,
        hospedeNome: data.hospede_nome,
        hospedeEmail: data.hospede_email,
        quartoNome: quarto?.nome || 'Quarto',
        checkIn: data.check_in,
        checkOut: data.check_out,
        numHospedes: data.num_hospedes,
        noites,
        valorTotal: data.valor_total,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar reserva';
    console.error('criarReservaManual error:', message);
    return { success: false, message };
  }

  revalidatePath('/admin/reservas');
  revalidatePath('/admin');
  return { success: true, message: 'Reserva criada com sucesso!' };
}

export async function getEstatisticas() {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const now = new Date();
    const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const firstOfNextMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

    // Reservas deste mês
    const { data: reservasMes, error: mesError } = await supabase
      .from('reservas')
      .select('id, valor_total, stripe_payment_status')
      .gte('created_at', firstOfMonth)
      .lt('created_at', firstOfNextMonth);

    if (mesError) throw mesError;

    // Reservas pendentes (total)
    const { count: pendentes, error: pendentesError } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente');

    if (pendentesError) throw pendentesError;

    // Taxa de ocupação: quartos com reserva ativa hoje / quartos ativos
    const today = formatDateISO(now);
    const { data: reservasHoje, error: hojeError } = await supabase
      .from('reservas')
      .select('quarto_id')
      .in('status', STATUSES_QUE_BLOQUEIAM)
      .lte('check_in', today)
      .gt('check_out', today);

    if (hojeError) throw hojeError;

    const { count: totalQuartos, error: quartosError } = await supabase
      .from('quartos')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    if (quartosError) throw quartosError;

    const quartosOcupados = new Set(reservasHoje.map((r) => r.quarto_id)).size;
    const taxaOcupacao = totalQuartos && totalQuartos > 0
      ? Math.round((quartosOcupados / totalQuartos) * 100)
      : 0;

    const receitaRecebidaMes = reservasMes.reduce(
      (acc, r) => (r.stripe_payment_status === 'pago' ? acc + r.valor_total : acc),
      0
    );

    return {
      totalReservas: reservasMes.length,
      reservasPendentes: pendentes ?? 0,
      receitaMes: receitaRecebidaMes,
      taxaOcupacao,
    };
  } catch {
    // Fallback mock
    const now = new Date();
    const reservasEsteMes = reservasMock.filter((r) => {
      const d = new Date(r.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    return {
      totalReservas: reservasEsteMes.length,
      reservasPendentes: reservasMock.filter((r) => r.status === 'pendente').length,
      receitaMes: reservasEsteMes.reduce((acc, r) => {
        if (!r.stripe_payment_status) {
          return r.status === 'confirmada' ? acc + r.valor_total : acc;
        }
        return r.stripe_payment_status === 'pago' ? acc + r.valor_total : acc;
      }, 0),
      taxaOcupacao: 75,
    };
  }
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
