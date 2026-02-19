import { createHmac, timingSafeEqual } from 'crypto';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const DEFAULT_PAYMENT_METHOD_TYPES: StripePaymentMethodType[] = ['card', 'pix'];
const SUPPORTED_PAYMENT_METHOD_TYPES = new Set<StripePaymentMethodType>(['card', 'pix', 'boleto']);

export type StripePaymentMethodType = 'card' | 'pix' | 'boleto';

export interface StripeCheckoutSession {
  id: string;
  object: 'checkout.session';
  url: string | null;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  payment_intent: string | { id: string } | null;
  payment_method_types: string[];
  status: 'open' | 'complete' | 'expired' | null;
  metadata: Record<string, string> | null;
  client_reference_id: string | null;
}

export interface StripeWebhookEvent<T = unknown> {
  id: string;
  type: string;
  data: {
    object: T;
  };
}

interface StripeApiErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: string;
    param?: string;
  };
}

export interface CreateStripeCheckoutSessionInput {
  reservaId: string;
  quartoNome: string;
  hospedeNome: string;
  hospedeEmail: string;
  valorTotal: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY não configurada.');
  }
  return key;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurada.');
  }
  return secret;
}

export function getStripePaymentMethodTypes(): StripePaymentMethodType[] {
  const raw = process.env.STRIPE_PAYMENT_METHOD_TYPES?.trim();
  const parsed = (raw ? raw.split(',') : DEFAULT_PAYMENT_METHOD_TYPES)
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is StripePaymentMethodType =>
      SUPPORTED_PAYMENT_METHOD_TYPES.has(item as StripePaymentMethodType)
    );

  if (parsed.length === 0) {
    return ['card'];
  }

  return [...new Set(parsed)];
}

function parseJsonSafely<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function buildStripeErrorMessage(
  status: number,
  parsedBody: StripeApiErrorResponse | null
): string {
  const msg = parsedBody?.error?.message?.trim();
  if (msg) return msg;
  return `Erro Stripe (HTTP ${status}).`;
}

async function stripePostForm<T>(path: string, params: URLSearchParams): Promise<T> {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-store',
  });

  const text = await response.text();
  const parsed = parseJsonSafely<T & StripeApiErrorResponse>(text);

  if (!response.ok) {
    throw new Error(buildStripeErrorMessage(response.status, parsed));
  }

  if (!parsed) {
    throw new Error('Resposta inválida da Stripe API.');
  }

  return parsed;
}

function buildCheckoutParams(
  input: CreateStripeCheckoutSessionInput,
  paymentMethods: StripePaymentMethodType[]
): URLSearchParams {
  const valorCentavos = Math.round(input.valorTotal * 100);
  if (valorCentavos <= 0) {
    throw new Error('Valor da reserva inválido para pagamento.');
  }

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('locale', 'pt-BR');
  params.set('success_url', input.successUrl);
  params.set('cancel_url', input.cancelUrl);
  params.set('customer_email', input.hospedeEmail);
  params.set('client_reference_id', input.reservaId);
  params.set('billing_address_collection', 'required');
  params.set('expires_at', String(Math.floor(Date.now() / 1000) + 30 * 60));

  paymentMethods.forEach((method, index) => {
    params.set(`payment_method_types[${index}]`, method);
  });

  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', 'brl');
  params.set('line_items[0][price_data][unit_amount]', String(valorCentavos));
  params.set(
    'line_items[0][price_data][product_data][name]',
    `Reserva - ${input.quartoNome}`
  );
  params.set(
    'line_items[0][price_data][product_data][description]',
    `Reserva ${input.reservaId}`
  );

  params.set('metadata[reserva_id]', input.reservaId);
  params.set('metadata[hospede_nome]', input.hospedeNome);
  params.set('metadata[hospede_email]', input.hospedeEmail);
  params.set('metadata[quarto_nome]', input.quartoNome);
  params.set('payment_intent_data[metadata][reserva_id]', input.reservaId);

  if (input.metadata) {
    Object.entries(input.metadata).forEach(([key, value]) => {
      params.set(`metadata[${key}]`, value);
    });
  }

  return params;
}

function isPaymentMethodConfigurationError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('payment_method_types') ||
    msg.includes('payment method') ||
    msg.includes('pix')
  );
}

async function createCheckoutSessionWithMethods(
  input: CreateStripeCheckoutSessionInput,
  methods: StripePaymentMethodType[]
): Promise<StripeCheckoutSession> {
  const params = buildCheckoutParams(input, methods);
  return stripePostForm<StripeCheckoutSession>('/checkout/sessions', params);
}

export async function createStripeCheckoutSession(
  input: CreateStripeCheckoutSessionInput
): Promise<StripeCheckoutSession> {
  const methods = getStripePaymentMethodTypes();

  try {
    return await createCheckoutSessionWithMethods(input, methods);
  } catch (err) {
    const canFallbackToCard =
      methods.length > 1 &&
      methods.includes('card') &&
      methods.includes('pix') &&
      isPaymentMethodConfigurationError(err);

    if (!canFallbackToCard) {
      throw err;
    }

    return createCheckoutSessionWithMethods(input, ['card']);
  }
}

function parseStripeSignatureHeader(signatureHeader: string): {
  timestamp: number;
  signatures: string[];
} {
  const parts = signatureHeader.split(',').map((item) => item.trim());
  let timestamp = 0;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (!key || !value) continue;
    if (key === 't') timestamp = Number.parseInt(value, 10);
    if (key === 'v1') signatures.push(value);
  }

  return { timestamp, signatures };
}

function safeCompareHex(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, 'hex');
  const bBuffer = Buffer.from(b, 'hex');
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function verifyStripeWebhookSignature<T = unknown>(
  payload: string,
  signatureHeader: string,
  webhookSecret: string = getStripeWebhookSecret()
): StripeWebhookEvent<T> {
  const { timestamp, signatures } = parseStripeSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) {
    throw new Error('Assinatura Stripe inválida.');
  }

  const toleranceSec = Number.parseInt(
    process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS?.trim() ?? '300',
    10
  );
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowInSeconds - timestamp) > toleranceSec) {
    throw new Error('Webhook Stripe fora da janela de tolerância.');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  const hasValidSignature = signatures.some((signature) =>
    safeCompareHex(signature, expectedSignature)
  );

  if (!hasValidSignature) {
    throw new Error('Falha ao validar assinatura do webhook Stripe.');
  }

  const parsed = parseJsonSafely<StripeWebhookEvent<T>>(payload);
  if (!parsed?.id || !parsed?.type || !parsed?.data?.object) {
    throw new Error('Payload de webhook Stripe inválido.');
  }

  return parsed;
}

export function getStripePaymentIntentId(
  paymentIntent: string | { id?: string } | null | undefined
): string | null {
  if (!paymentIntent) return null;
  if (typeof paymentIntent === 'string') return paymentIntent;
  return paymentIntent.id?.trim() || null;
}
