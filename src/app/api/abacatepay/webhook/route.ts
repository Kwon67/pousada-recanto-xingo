import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  enviarEmailConfirmacao,
  enviarEmailPagamentoAprovadoAdmin,
} from '@/lib/email';
import {
  verifyAbacatePayWebhookSignature,
  type AbacatePayBilling,
} from '@/lib/abacatepay';
import { sendConversionEvent } from '@/lib/meta-conversions';
import { validateCriticalServerEnv } from '@/lib/env-validation';

export const runtime = 'nodejs';

type ReservaStatus = 'pendente' | 'aguardando_pagamento' | 'confirmada' | 'cancelada' | 'concluida';
type PaymentStatus =
  | 'nao_iniciado'
  | 'pendente'
  | 'pago'
  | 'falhou'
  | 'cancelado'
  | 'expirado';

interface ReservaWebhookRow {
  id: string;
  status: ReservaStatus;
  stripe_payment_status: PaymentStatus;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  valor_total: number;
  hospede: { nome: string; email: string; telefone?: string | null } | null;
  quarto: { nome: string } | null;
  pixel_disparado?: boolean;
}

function calcularNoites(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1);
}

function getReservaIdFromBilling(billing: AbacatePayBilling): string | null {
  return billing.products?.[0]?.externalId || null;
}

async function getReservaById(id: string): Promise<ReservaWebhookRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      status,
      stripe_payment_status,
      check_in,
      check_out,
      num_hospedes,
      valor_total,
      quarto:quartos(nome),
      hospede:hospedes(nome, email, telefone)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar reserva para webhook: ${error.message}`);
  }

  if (!data) return null;
  return data as ReservaWebhookRow;
}

async function getAdminNotificationEmail(): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('configuracoes')
    .select('email_conta, email, email_notificacoes')
    .limit(1)
    .maybeSingle();

  if (data?.email_notificacoes === false) {
    return null;
  }

  return (
    data?.email_conta?.trim() ||
    data?.email?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    null
  );
}

async function atualizarReservaPagamento(
  reservaId: string,
  payload: {
    status?: ReservaStatus;
    stripe_payment_status: PaymentStatus;
    stripe_checkout_session_id?: string;
    stripe_payment_intent_id?: string | null;
    stripe_payment_method?: string | null;
    payment_approved_at?: string | null;
  }
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('reservas')
    .update(payload)
    .eq('id', reservaId);

  if (error) {
    throw new Error(`Erro ao atualizar reserva ${reservaId} no webhook: ${error.message}`);
  }
}

async function handlePagamentoAprovado(billing: AbacatePayBilling) {
  const reservaId = getReservaIdFromBilling(billing);
  if (!reservaId) return;

  const reservaAtual = await getReservaById(reservaId);
  if (!reservaAtual) return;

  const jaPago =
    reservaAtual.status === 'confirmada' || reservaAtual.stripe_payment_status === 'pago';

  await atualizarReservaPagamento(reservaAtual.id, {
    status: 'confirmada',
    stripe_payment_status: 'pago',
    stripe_checkout_session_id: billing.id,
    stripe_payment_intent_id: billing.id,
    stripe_payment_method: 'pix',
    payment_approved_at: new Date().toISOString(),
  });

  if (!jaPago && reservaAtual.hospede?.email) {
    await enviarEmailConfirmacao({
      reservaId: reservaAtual.id,
      hospedeNome: reservaAtual.hospede.nome,
      hospedeEmail: reservaAtual.hospede.email,
      quartoNome: reservaAtual.quarto?.nome || 'Quarto',
      checkIn: reservaAtual.check_in,
      checkOut: reservaAtual.check_out,
      numHospedes: reservaAtual.num_hospedes,
      noites: calcularNoites(reservaAtual.check_in, reservaAtual.check_out),
      valorTotal: reservaAtual.valor_total,
      metodoPagamento: 'pix',
    });
  }

  if (!jaPago) {
    const adminEmail = await getAdminNotificationEmail();
    if (adminEmail) {
      await enviarEmailPagamentoAprovadoAdmin({
        reservaId: reservaAtual.id,
        destinoEmail: adminEmail,
        hospedeNome: reservaAtual.hospede?.nome || 'Hóspede',
        hospedeEmail: reservaAtual.hospede?.email || 'Não informado',
        quartoNome: reservaAtual.quarto?.nome || 'Quarto',
        checkIn: reservaAtual.check_in,
        checkOut: reservaAtual.check_out,
        valorTotal: reservaAtual.valor_total,
        metodoPagamento: 'pix',
      });
    }
  }

  // Meta Pixel: Purchase via Conversions API (server-side)
  if (!jaPago && !reservaAtual.pixel_disparado) {
    const pixelOk = await sendConversionEvent({
      eventName: 'Purchase',
      email: reservaAtual.hospede?.email,
      telefone: reservaAtual.hospede?.telefone,
      valor: reservaAtual.valor_total,
      currency: 'BRL',
      reservaId: reservaAtual.id,
      contentIds: [reservaAtual.id],
    });

    if (pixelOk) {
      const supabase = createAdminClient();
      await supabase
        .from('reservas')
        .update({ pixel_disparado: true })
        .eq('id', reservaAtual.id);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/reservas');
  revalidatePath('/reservas');
  revalidatePath('/quartos', 'layout');
}

export async function POST(request: NextRequest) {
  validateCriticalServerEnv();

  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-webhook-signature');
  const querySecret = request.nextUrl.searchParams.get('secret');

  const isValid = verifyAbacatePayWebhookSignature(rawBody, signatureHeader, querySecret);
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: 'Assinatura do webhook inválida.' },
      { status: 401 }
    );
  }

  try {
    const event = JSON.parse(rawBody) as { event: string; data: { billing?: AbacatePayBilling } };

    switch (event.event) {
      case 'billing.paid': {
        if (event.data.billing) {
          await handlePagamentoAprovado(event.data.billing);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no webhook AbacatePay.';
    console.error('abacatepay webhook error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
