import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getAbacatePayBillingAmount,
  getAbacatePayBillingExternalId,
  getAbacatePayBillingPaymentMethod,
  getBillingFromWebhookEvent,
  verifyAbacatePayWebhookSignature,
  type AbacatePayBilling,
  type AbacatePayWebhookEvent,
} from '@/lib/abacatepay';
import {
  enviarEmailConfirmacao,
  enviarEmailPagamentoAprovadoAdmin,
} from '@/lib/email';
import { sendConversionEvent } from '@/lib/meta-conversions';
import { validateCriticalServerEnv } from '@/lib/env-validation';
import { getExpectedDepositAmount } from '@/lib/payment';

export const runtime = 'nodejs';

type ReservaStatus = 'pendente' | 'aguardando_pagamento' | 'confirmada' | 'cancelada' | 'concluida';
type PaymentStatus =
  | 'nao_iniciado'
  | 'pendente'
  | 'pago'
  | 'falhou'
  | 'cancelado'
  | 'expirado'
  | 'reembolsado';

interface ReservaWebhookRow {
  id: string;
  status: ReservaStatus;
  stripe_payment_status: PaymentStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_method: string | null;
  payment_approved_at: string | null;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  valor_total: number;
  valor_pago: number | null;
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

function invalidateReservationViews() {
  revalidatePath('/admin');
  revalidatePath('/admin/reservas');
  revalidatePath('/reservas');
  revalidatePath('/quartos', 'layout');
}

async function getReservaById(id: string): Promise<ReservaWebhookRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      status,
      stripe_payment_status,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      stripe_payment_method,
      payment_approved_at,
      check_in,
      check_out,
      num_hospedes,
      valor_total,
      valor_pago,
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

async function getReservaByBillingId(billingId: string): Promise<ReservaWebhookRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      status,
      stripe_payment_status,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      stripe_payment_method,
      payment_approved_at,
      check_in,
      check_out,
      num_hospedes,
      valor_total,
      valor_pago,
      quarto:quartos(nome),
      hospede:hospedes(nome, email, telefone)
    `)
    .or(
      `stripe_checkout_session_id.eq.${billingId},stripe_payment_intent_id.eq.${billingId},stripe_session_id.eq.${billingId}`
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar reserva por cobrança ${billingId}: ${error.message}`);
  }

  if (!data) return null;
  return data as ReservaWebhookRow;
}

async function findReservaForBilling(billing: AbacatePayBilling): Promise<ReservaWebhookRow | null> {
  const externalId = getAbacatePayBillingExternalId(billing);
  if (externalId) {
    const reserva = await getReservaById(externalId);
    if (reserva) {
      return reserva;
    }
  }

  if (billing.id) {
    return getReservaByBillingId(billing.id);
  }

  return null;
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
    status?: ReservaStatus | null;
    stripe_payment_status: PaymentStatus;
    stripe_checkout_session_id?: string;
    stripe_payment_intent_id?: string | null;
    stripe_payment_method?: string | null;
    payment_approved_at?: string | null;
    valor_pago?: number | null;
  }
) {
  const supabase = createAdminClient();
  const updatePayload: Record<string, string | number | null> = {
    stripe_payment_status: payload.stripe_payment_status,
  };

  if (payload.status) {
    updatePayload.status = payload.status;
  }
  if (payload.stripe_checkout_session_id !== undefined) {
    updatePayload.stripe_checkout_session_id = payload.stripe_checkout_session_id;
  }
  if (payload.stripe_payment_intent_id !== undefined) {
    updatePayload.stripe_payment_intent_id = payload.stripe_payment_intent_id;
  }
  if (payload.stripe_payment_method !== undefined) {
    updatePayload.stripe_payment_method = payload.stripe_payment_method;
  }
  if (payload.payment_approved_at !== undefined) {
    updatePayload.payment_approved_at = payload.payment_approved_at;
  }
  if (payload.valor_pago !== undefined) {
    updatePayload.valor_pago = payload.valor_pago;
  }

  const { error } = await supabase
    .from('reservas')
    .update(updatePayload)
    .eq('id', reservaId);

  if (error) {
    throw new Error(`Erro ao atualizar reserva ${reservaId} no webhook: ${error.message}`);
  }
}

async function handlePagamentoAprovado(billing: AbacatePayBilling) {
  const reservaAtual = await findReservaForBilling(billing);
  if (!reservaAtual) return;

  const jaPago = reservaAtual.stripe_payment_status === 'pago';
  const metodoPagamento =
    getAbacatePayBillingPaymentMethod(billing) || reservaAtual.stripe_payment_method || null;
  const valorPago =
    getAbacatePayBillingAmount(billing) || getExpectedDepositAmount(reservaAtual.valor_total);
  const paymentApprovedAt = reservaAtual.payment_approved_at || new Date().toISOString();

  await atualizarReservaPagamento(reservaAtual.id, {
    status: 'confirmada',
    stripe_payment_status: 'pago',
    stripe_checkout_session_id: billing.id,
    stripe_payment_intent_id: billing.id,
    stripe_payment_method: metodoPagamento,
    payment_approved_at: paymentApprovedAt,
    valor_pago: valorPago,
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
      valorPago,
      metodoPagamento: metodoPagamento || undefined,
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
        valorPago,
        metodoPagamento,
      });
    }
  }

  // Meta Pixel: Purchase via Conversions API (server-side)
  if (!jaPago && !reservaAtual.pixel_disparado) {
    const pixelOk = await sendConversionEvent({
      eventName: 'Purchase',
      email: reservaAtual.hospede?.email,
      telefone: reservaAtual.hospede?.telefone,
      valor: valorPago,
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

  invalidateReservationViews();
}

async function handleBillingCreated(billing: AbacatePayBilling) {
  const reservaAtual = await findReservaForBilling(billing);
  if (!reservaAtual || reservaAtual.stripe_payment_status === 'pago') return;

  await atualizarReservaPagamento(reservaAtual.id, {
    status: reservaAtual.status === 'confirmada' ? 'confirmada' : 'aguardando_pagamento',
    stripe_payment_status: 'pendente',
    stripe_checkout_session_id: billing.id,
    stripe_payment_intent_id: billing.id,
    stripe_payment_method:
      getAbacatePayBillingPaymentMethod(billing) || reservaAtual.stripe_payment_method || null,
    valor_pago: reservaAtual.valor_pago || 0,
  });

  invalidateReservationViews();
}

async function handleBillingFailed(billing: AbacatePayBilling) {
  const reservaAtual = await findReservaForBilling(billing);
  if (!reservaAtual || reservaAtual.stripe_payment_status === 'pago') return;

  await atualizarReservaPagamento(reservaAtual.id, {
    status: reservaAtual.status === 'confirmada' ? 'confirmada' : 'aguardando_pagamento',
    stripe_payment_status: 'falhou',
    stripe_checkout_session_id: billing.id,
    stripe_payment_intent_id: billing.id,
    stripe_payment_method:
      getAbacatePayBillingPaymentMethod(billing) || reservaAtual.stripe_payment_method || null,
    valor_pago: 0,
  });

  invalidateReservationViews();
}

async function handleBillingCancelledOrExpired(
  billing: AbacatePayBilling,
  paymentStatus: 'cancelado' | 'expirado'
) {
  const reservaAtual = await findReservaForBilling(billing);
  if (!reservaAtual || reservaAtual.stripe_payment_status === 'pago') return;

  await atualizarReservaPagamento(reservaAtual.id, {
    status: reservaAtual.status === 'concluida' ? 'concluida' : 'cancelada',
    stripe_payment_status: paymentStatus,
    stripe_checkout_session_id: billing.id,
    stripe_payment_intent_id: billing.id,
    stripe_payment_method:
      getAbacatePayBillingPaymentMethod(billing) || reservaAtual.stripe_payment_method || null,
    valor_pago: 0,
  });

  invalidateReservationViews();
}

async function handleBillingRefunded(billing: AbacatePayBilling) {
  const reservaAtual = await findReservaForBilling(billing);
  if (!reservaAtual) return;

  await atualizarReservaPagamento(reservaAtual.id, {
    status: reservaAtual.status === 'concluida' ? 'concluida' : 'cancelada',
    stripe_payment_status: 'reembolsado',
    stripe_checkout_session_id: billing.id,
    stripe_payment_intent_id: billing.id,
    stripe_payment_method:
      getAbacatePayBillingPaymentMethod(billing) || reservaAtual.stripe_payment_method || null,
    valor_pago: 0,
  });

  invalidateReservationViews();
}

export async function POST(request: NextRequest) {
  validateCriticalServerEnv();

  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-webhook-signature');
  const querySecrets = [
    request.nextUrl.searchParams.get('webhookSecret'),
    request.nextUrl.searchParams.get('secret'),
  ];

  const isValid = verifyAbacatePayWebhookSignature(rawBody, signatureHeader, querySecrets);
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: 'Assinatura do webhook inválida.' },
      { status: 401 }
    );
  }

  try {
    const event = JSON.parse(rawBody) as AbacatePayWebhookEvent;
    const billing = getBillingFromWebhookEvent(event);

    switch (event.event) {
      case 'billing.created': {
        if (billing) {
          await handleBillingCreated(billing);
        }
        break;
      }
      case 'billing.paid': {
        if (billing) {
          await handlePagamentoAprovado(billing);
        }
        break;
      }
      case 'billing.failed': {
        if (billing) {
          await handleBillingFailed(billing);
        }
        break;
      }
      case 'billing.cancelled': {
        if (billing) {
          await handleBillingCancelledOrExpired(billing, 'cancelado');
        }
        break;
      }
      case 'billing.expired': {
        if (billing) {
          await handleBillingCancelledOrExpired(billing, 'expirado');
        }
        break;
      }
      case 'billing.refunded': {
        if (billing) {
          await handleBillingRefunded(billing);
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
