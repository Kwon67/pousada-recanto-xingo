import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  enviarEmailConfirmacao,
  enviarEmailPagamentoAprovadoAdmin,
} from '@/lib/email';
import {
  getStripePaymentIntentId,
  type StripeCheckoutSession,
  verifyStripeWebhookSignature,
} from '@/lib/stripe';

export const runtime = 'nodejs';

type ReservaStatus = 'pendente' | 'aguardando_pagamento' | 'confirmada' | 'cancelada' | 'concluida';
type StripePaymentStatus =
  | 'nao_iniciado'
  | 'pendente'
  | 'pago'
  | 'falhou'
  | 'cancelado'
  | 'expirado';

interface ReservaWebhookRow {
  id: string;
  status: ReservaStatus;
  stripe_payment_status: StripePaymentStatus;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  valor_total: number;
  hospede: { nome: string; email: string } | null;
  quarto: { nome: string } | null;
}

function calcularNoites(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1);
}

function getReservaIdFromSession(session: StripeCheckoutSession): string | null {
  return (
    session.metadata?.reserva_id ||
    session.client_reference_id ||
    null
  );
}

async function getReservaFromSession(
  session: StripeCheckoutSession
): Promise<ReservaWebhookRow | null> {
  const reservaId = getReservaIdFromSession(session);
  if (reservaId) {
    return getReservaById(reservaId);
  }
  return getReservaByCheckoutSessionId(session.id);
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
      hospede:hospedes(nome, email)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar reserva para webhook: ${error.message}`);
  }

  if (!data) return null;
  return data as ReservaWebhookRow;
}

async function getReservaByCheckoutSessionId(sessionId: string): Promise<ReservaWebhookRow | null> {
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
      hospede:hospedes(nome, email)
    `)
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar reserva por checkout session: ${error.message}`);
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
    stripe_payment_status: StripePaymentStatus;
    stripe_checkout_session_id: string;
    stripe_payment_intent_id: string | null;
    stripe_payment_method: string | null;
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

async function handlePagamentoPendente(session: StripeCheckoutSession) {
  const reservaAtual = await getReservaFromSession(session);

  if (!reservaAtual) return;
  if (
    reservaAtual.stripe_payment_status === 'pago' ||
    reservaAtual.status === 'confirmada'
  ) {
    return;
  }

  await atualizarReservaPagamento(reservaAtual.id, {
    stripe_payment_status: 'pendente',
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: getStripePaymentIntentId(session.payment_intent),
    stripe_payment_method: session.payment_method_types?.[0] || null,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/reservas');
  revalidatePath('/reservas');
}

async function handlePagamentoAprovado(session: StripeCheckoutSession) {
  const reservaAtual = await getReservaFromSession(session);

  if (!reservaAtual) return;

  const jaPago =
    reservaAtual.status === 'confirmada' || reservaAtual.stripe_payment_status === 'pago';

  await atualizarReservaPagamento(reservaAtual.id, {
    status: 'confirmada',
    stripe_payment_status: 'pago',
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: getStripePaymentIntentId(session.payment_intent),
    stripe_payment_method: session.payment_method_types?.[0] || null,
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
      metodoPagamento: session.payment_method_types?.[0] || undefined,
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
        metodoPagamento: session.payment_method_types?.[0] || null,
      });
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/reservas');
  revalidatePath('/reservas');
  revalidatePath('/quartos', 'layout');
}

async function handlePagamentoComFalha(
  session: StripeCheckoutSession,
  stripeStatus: Extract<StripePaymentStatus, 'falhou' | 'expirado'>
) {
  const reservaAtual = await getReservaFromSession(session);

  if (!reservaAtual) return;
  if (reservaAtual.stripe_payment_status === 'pago') return;

  await atualizarReservaPagamento(reservaAtual.id, {
    status: 'cancelada',
    stripe_payment_status: stripeStatus,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: getStripePaymentIntentId(session.payment_intent),
    stripe_payment_method: session.payment_method_types?.[0] || null,
    payment_approved_at: null,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/reservas');
  revalidatePath('/reservas');
  revalidatePath('/quartos', 'layout');
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { success: false, error: 'Cabeçalho stripe-signature ausente.' },
      { status: 400 }
    );
  }

  try {
    const event = verifyStripeWebhookSignature<StripeCheckoutSession>(
      payload,
      signature
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        if (event.data.object.payment_status === 'paid') {
          await handlePagamentoAprovado(event.data.object);
        } else {
          await handlePagamentoPendente(event.data.object);
        }
        break;
      }
      case 'checkout.session.async_payment_succeeded':
        await handlePagamentoAprovado(event.data.object);
        break;
      case 'checkout.session.async_payment_failed':
        await handlePagamentoComFalha(event.data.object, 'falhou');
        break;
      case 'checkout.session.expired':
        await handlePagamentoComFalha(event.data.object, 'expirado');
        break;
      default:
        break;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no webhook Stripe.';
    console.error('stripe webhook error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
