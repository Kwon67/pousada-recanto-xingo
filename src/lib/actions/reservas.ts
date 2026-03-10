'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdminActionSession } from '@/lib/admin-action-guard';
import { enviarEmailConfirmacao, enviarEmailStatus } from '@/lib/email';
import { createReservaPublicToken, verifyReservaPublicToken } from '@/lib/reserva-public-token';
import { checkAndConsumeReservaRateLimit, getClientIpFromHeaders } from '@/lib/reserva-rate-limit';
import { getSiteUrl } from '@/lib/site-url';
import { createAbacatePayBilling } from '@/lib/abacatepay';
import { reservasMock } from '@/data/mock';
import { getExpectedDepositAmount, getReservaPaidAmount } from '@/lib/payment';
import type { Reserva, StatusPagamentoReserva, StatusReserva } from '@/types/reserva';
import { z } from 'zod';

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

const STATUSES_QUE_BLOQUEIAM: StatusReserva[] = ['pendente', 'aguardando_pagamento', 'confirmada'];
const DAY_MS = 1000 * 60 * 60 * 24;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const criarReservaSchema = z.object({
  quarto_id: z.string().trim().min(1, 'Quarto inválido.').max(120, 'Quarto inválido.'),
  quarto_nome: z.string().trim().max(120).optional().default(''),
  hospede_nome: z
    .string()
    .trim()
    .min(2, 'Nome do hóspede inválido.')
    .max(120, 'Nome do hóspede inválido.'),
  hospede_email: z
    .string()
    .trim()
    .toLowerCase()
    .email('E-mail inválido.')
    .max(160, 'E-mail inválido.'),
  hospede_telefone: z
    .string()
    .trim()
    .min(8, 'Telefone inválido.')
    .max(40, 'Telefone inválido.'),
  hospede_cpf: z
    .string()
    .trim()
    .max(32, 'CPF inválido.')
    .refine((value) => value.replace(/\D/g, '').length === 11, 'CPF inválido.'),
  hospede_cidade: z.string().trim().max(120).optional().default(''),
  check_in: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, 'Data de check-in inválida.'),
  check_out: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, 'Data de check-out inválida.'),
  num_hospedes: z
    .number()
    .int('Quantidade de hóspedes inválida.')
    .min(1, 'Quantidade de hóspedes inválida.')
    .max(10, 'Quantidade de hóspedes inválida.'),
  noites: z.number().int().min(1).max(60).optional(),
  valor_total: z.number().min(0).optional(),
  observacoes: z.string().trim().max(2000).optional(),
});

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function startOfUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function calculateNights(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS);
}

function calculateStayTotal(
  checkIn: Date,
  checkOut: Date,
  precoDiaria: number,
  precoFds?: number | null
): number {
  const weekendPrice = Number.isFinite(precoFds) ? Number(precoFds) : precoDiaria;
  let total = 0;

  const current = new Date(checkIn.getTime());
  while (current < checkOut) {
    const day = current.getUTCDay();
    const isWeekend = day === 0 || day === 6;
    total += isWeekend ? weekendPrice : precoDiaria;
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return Math.round(total * 100) / 100;
}

function parseMoneyValue(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function criarReserva(data: CriarReservaData) {
  let reservaCriadaId: string | null = null;

  try {
    const parsedInput = criarReservaSchema.safeParse(data);
    if (!parsedInput.success) {
      return {
        success: false,
        error: parsedInput.error.issues[0]?.message || 'Dados da reserva inválidos.',
      };
    }

    const input = parsedInput.data;
    const supabase = createAdminClient();
    const quartoId = input.quarto_id;
    const hospedeNome = input.hospede_nome;
    const hospedeEmail = input.hospede_email;
    const hospedeTelefone = input.hospede_telefone;
    const hospedeCpf = input.hospede_cpf;
    const hospedeCidade = input.hospede_cidade;
    const observacoes =
      typeof input.observacoes === 'string' && input.observacoes.trim().length > 0
        ? input.observacoes.trim().slice(0, 2000)
        : null;

    const requestHeaders = await headers();
    const clientIp = getClientIpFromHeaders(requestHeaders);
    const rateLimitState = await checkAndConsumeReservaRateLimit({
      ip: clientIp,
      email: hospedeEmail,
    });

    if (!rateLimitState.allowed) {
      return {
        success: false,
        error:
          'Muitas tentativas de reserva em sequência. Aguarde alguns minutos para tentar novamente.',
        retryAfterSeconds: rateLimitState.retryAfterSeconds,
      };
    }

    const checkInDate = parseIsoDate(input.check_in);
    const checkOutDate = parseIsoDate(input.check_out);
    if (!checkInDate || !checkOutDate) {
      return { success: false, error: 'Datas inválidas.' };
    }

    const noites = calculateNights(checkInDate, checkOutDate);
    if (noites <= 0 || noites > 60) {
      return { success: false, error: 'Período de reserva inválido.' };
    }

    if (checkInDate < startOfUtcToday()) {
      return { success: false, error: 'Data de check-in não pode ser no passado.' };
    }

    const { data: quarto, error: quartoError } = await supabase
      .from('quartos')
      .select('id, nome, preco_diaria, preco_fds, capacidade, ativo')
      .eq('id', quartoId)
      .maybeSingle();

    if (quartoError) throw new Error(`Erro ao validar quarto: ${quartoError.message}`);
    if (!quarto || quarto.ativo !== true) {
      return { success: false, error: 'Quarto indisponível para reserva.' };
    }

    if (typeof quarto.capacidade === 'number' && input.num_hospedes > quarto.capacidade) {
      return {
        success: false,
        error: `Este quarto suporta no máximo ${quarto.capacidade} hóspede(s).`,
      };
    }

    const precoDiaria = parseMoneyValue(quarto.preco_diaria);
    const precoFds = parseMoneyValue(quarto.preco_fds);
    if (!precoDiaria || precoDiaria <= 0) {
      return { success: false, error: 'Preço do quarto inválido para reserva.' };
    }

    const valorTotalCalculado = calculateStayTotal(checkInDate, checkOutDate, precoDiaria, precoFds);
    if (!Number.isFinite(valorTotalCalculado) || valorTotalCalculado <= 0) {
      return { success: false, error: 'Não foi possível calcular o valor da reserva.' };
    }

    // 1. Upsert hóspede por email
    const { data: hospede, error: hospedeError } = await supabase
      .from('hospedes')
      .upsert(
        {
          nome: hospedeNome,
          email: hospedeEmail,
          telefone: hospedeTelefone,
          cpf: hospedeCpf,
          cidade: hospedeCidade,
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
      .eq('quarto_id', quartoId)
      .in('status', STATUSES_QUE_BLOQUEIAM)
      .lt('check_in', input.check_out)
      .gt('check_out', input.check_in);

    if (conflitosError) throw new Error(`Erro ao verificar disponibilidade: ${conflitosError.message}`);

    if (conflitos.length > 0) {
      return { success: false, error: 'Este quarto não está mais disponível para as datas selecionadas.' };
    }

    // 3. Inserir reserva pendente de pagamento
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert({
        quarto_id: quartoId,
        hospede_id: hospede.id,
        check_in: input.check_in,
        check_out: input.check_out,
        num_hospedes: input.num_hospedes,
        valor_total: valorTotalCalculado,
        status: 'pendente',
        stripe_payment_status: 'pendente',
        observacoes,
      })
      .select('id')
      .single();

    if (reservaError) throw new Error(`Erro ao criar reserva: ${reservaError.message}`);
    reservaCriadaId = reserva.id;
    const reservaPublicToken = createReservaPublicToken(reserva.id);

    // 4. Criar cobrança no AbacatePay
    const siteUrl = getSiteUrl();
    const completionUrl = `${siteUrl}/reservas/confirmacao?id=${reserva.id}&token=${encodeURIComponent(reservaPublicToken)}`;
    const returnUrl = `${siteUrl}/reservas/confirmacao?id=${reserva.id}&token=${encodeURIComponent(reservaPublicToken)}&payment=cancelado`;

    const billing = await createAbacatePayBilling({
      reservaId: reserva.id,
      quartoNome: quarto.nome,
      hospedeNome,
      hospedeEmail,
      hospedeTelefone,
      hospedeCpf,
      valorTotal: valorTotalCalculado / 2, // 50% DEPÓSITO
      returnUrl,
      completionUrl,
    });

    if (!billing.url) {
      throw new Error('AbacatePay não retornou a URL de pagamento.');
    }

    const { error: paymentRefError } = await supabase
      .from('reservas')
      .update({
        stripe_checkout_session_id: billing.id,
        stripe_payment_intent_id: billing.id,
        stripe_payment_status: billing.status === 'PAID' ? 'pago' : 'pendente',
        stripe_payment_method: null,
        status: billing.status === 'PAID' ? 'confirmada' : 'aguardando_pagamento',
        payment_approved_at: billing.status === 'PAID' ? new Date().toISOString() : null,
        valor_pago: billing.status === 'PAID' ? getExpectedDepositAmount(valorTotalCalculado) : 0,
      })
      .eq('id', reserva.id);

    if (paymentRefError) {
      throw new Error(`Erro ao vincular cobrança AbacatePay à reserva: ${paymentRefError.message}`);
    }

    // 5. Revalidar paths
    revalidatePath('/reservas');
    revalidatePath('/admin/reservas');
    revalidatePath('/admin');

    return {
      success: true,
      reservaId: reserva.id,
      reservaPublicToken,
      valorTotal: valorTotalCalculado,
      noites,
      paymentUrl: billing.url,
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
  await assertAdminActionSession();

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
    return null;
  }
}

export async function getReservaPublicaById(id: string, token: string) {
  const reservaId = id.trim();
  const reservaToken = token.trim();

  if (!reservaId || !reservaToken) {
    return null;
  }

  if (!verifyReservaPublicToken(reservaId, reservaToken)) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        id,
        check_in,
        check_out,
        num_hospedes,
        valor_total,
        valor_pago,
        status,
        stripe_payment_status,
        stripe_payment_method,
        payment_approved_at,
        quarto:quartos(nome, imagem_principal)
      `)
      .eq('id', reservaId)
      .single();

    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function atualizarStatusReserva(id: string, status: StatusReserva) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const { data: reservaAtual, error: reservaAtualError } = await supabase
      .from('reservas')
      .select('stripe_payment_status')
      .eq('id', id)
      .single();

    if (reservaAtualError) throw reservaAtualError;

    const updatePayload: {
      status: StatusReserva;
      stripe_payment_status?: StatusPagamentoReserva;
    } = { status };

    if (
      status === 'cancelada' &&
      reservaAtual.stripe_payment_status !== 'pago' &&
      reservaAtual.stripe_payment_status !== 'reembolsado'
    ) {
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

  const senhaBuffer = Buffer.from(senha.trim());
  const senhaAdminBuffer = Buffer.from(senhaAdmin);
  const senhasIguais =
    senhaBuffer.length === senhaAdminBuffer.length &&
    timingSafeEqual(senhaBuffer, senhaAdminBuffer);
  if (!senhasIguais) {
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
      .select('id, valor_total, valor_pago, stripe_payment_status')
      .gte('created_at', firstOfMonth)
      .lt('created_at', firstOfNextMonth);

    if (mesError) throw mesError;

    // Reservas pendentes (total)
    const { count: pendentes, error: pendentesError } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pendente', 'aguardando_pagamento']);

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
      (acc, r) => acc + getReservaPaidAmount(r),
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
      reservasPendentes: reservasMock.filter(
        (r) => r.status === 'pendente' || r.status === 'aguardando_pagamento'
      ).length,
      receitaMes: reservasEsteMes.reduce((acc, r) => acc + getReservaPaidAmount(r), 0),
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
