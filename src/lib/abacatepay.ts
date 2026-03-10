import { createHmac, timingSafeEqual } from 'crypto';
import { normalizePaymentMethod, roundCurrency } from '@/lib/payment';

const ABACATE_API_BASE = 'https://api.abacatepay.com/v1';

export interface AbacatePayBilling {
  id: string;
  url?: string | null;
  amount?: number | null;
  paidAmount?: number | null;
  status?: string | null;
  externalId?: string | null;
  methods?: string[];
  frequency?: string | null;
  paymentMethod?: string | null;
  method?: string | null;
  products?: Array<{
    externalId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  customer?: {
    id: string;
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
  } | null;
  payerInformation?: {
    method?: string | null;
    [key: string]: unknown;
  } | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface AbacatePayWebhookEvent {
  event: string;
  data?: {
    billing?: AbacatePayBilling;
    [key: string]: unknown;
  } | AbacatePayBilling | null;
}

export interface CreateAbacatePayBillingInput {
  reservaId: string;
  quartoNome: string;
  hospedeNome: string;
  hospedeEmail: string;
  hospedeTelefone: string;
  hospedeCpf: string;
  valorTotal: number;
  returnUrl: string;
  completionUrl: string;
}

function getAbacatePayApiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY?.trim();
  if (!key) {
    throw new Error('ABACATEPAY_API_KEY não configurada.');
  }
  return key;
}

export function getAbacatePayWebhookSecret(): string {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error('ABACATEPAY_WEBHOOK_SECRET não configurada.');
  }
  return secret;
}

async function abacatePayPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${ABACATE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAbacatePayApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await response.text();
  let parsed: { data?: T; error?: string } | null = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // ignore
  }

  if (!response.ok) {
    const msg = parsed?.error || `Erro AbacatePay (HTTP ${response.status}).`;
    throw new Error(msg);
  }

  if (!parsed?.data) {
    throw new Error('Resposta inválida da AbacatePay API.');
  }

  return parsed.data;
}

interface AbacatePayCustomer {
  id: string;
  name: string;
  email: string;
  cellphone: string;
  taxId: string;
}

async function createOrUpdateCustomer(input: {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
}): Promise<AbacatePayCustomer> {
  const taxId = input.cpf.replace(/\D/g, '');
  return abacatePayPost<AbacatePayCustomer>('/customer/create', {
    name: input.nome,
    email: input.email,
    cellphone: input.telefone,
    taxId,
  });
}

export async function createAbacatePayBilling(
  input: CreateAbacatePayBillingInput
): Promise<AbacatePayBilling> {
  const valorCentavos = Math.round(input.valorTotal * 100);
  if (valorCentavos <= 0) {
    throw new Error('Valor da reserva inválido para pagamento.');
  }

  // Sempre cria/atualiza o cliente antes de criar a cobrança
  const customer = await createOrUpdateCustomer({
    nome: input.hospedeNome,
    email: input.hospedeEmail,
    telefone: input.hospedeTelefone,
    cpf: input.hospedeCpf,
  });

  const billing = await abacatePayPost<AbacatePayBilling>('/billing/create', {
    frequency: 'ONE_TIME',
    methods: ['PIX', 'CARD'],
    products: [
      {
        externalId: input.reservaId,
        name: `Reserva - ${input.quartoNome}`,
        quantity: 1,
        price: valorCentavos,
      },
    ],
    returnUrl: input.returnUrl,
    completionUrl: input.completionUrl,
    customerId: customer.id,
  });

  return billing;
}

export function verifyAbacatePayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const webhookSecret = getAbacatePayWebhookSecret();

  if (!signatureHeader) {
    return false;
  }

  const normalizedSignature = signatureHeader.trim().replace(/^sha256=/i, '');
  if (!normalizedSignature) {
    return false;
  }

  const hmacKeys = [
    webhookSecret,
    process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY?.trim() || null,
  ].filter((value): value is string => Boolean(value));

  for (const key of hmacKeys) {
    const digest = createHmac('sha256', key).update(rawBody, 'utf8').digest();
    for (const encoding of ['base64', 'hex'] as const) {
      const parsed = decodeSignature(normalizedSignature, encoding);
      if (parsed && parsed.length === digest.length && timingSafeEqual(parsed, digest)) {
        return true;
      }
    }
  }

  return false;
}

function decodeSignature(signature: string, encoding: 'base64' | 'hex'): Buffer | null {
  try {
    const decoded = Buffer.from(signature, encoding);
    if (!decoded.length) return null;

    if (encoding === 'hex' && decoded.toString('hex') !== signature.toLowerCase()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function getBillingFromWebhookEvent(event: AbacatePayWebhookEvent): AbacatePayBilling | null {
  if (!event?.data || typeof event.data !== 'object') {
    return null;
  }

  if ('billing' in event.data && event.data.billing && typeof event.data.billing === 'object') {
    return event.data.billing as AbacatePayBilling;
  }

  return event.data as AbacatePayBilling;
}

export function getAbacatePayBillingExternalId(billing: AbacatePayBilling): string | null {
  const externalId =
    (typeof billing.externalId === 'string' && billing.externalId.trim()) ||
    billing.products?.[0]?.externalId;

  return externalId?.trim() || null;
}

export function getAbacatePayBillingAmount(billing: AbacatePayBilling): number | null {
  const amountCandidate = [billing.paidAmount, billing.amount]
    .map((value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    })
    .find((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);

  if (!amountCandidate) {
    return null;
  }

  return roundCurrency(amountCandidate / 100);
}

export function getAbacatePayBillingPaymentMethod(billing: AbacatePayBilling): string | null {
  const directCandidates = [
    typeof billing.paymentMethod === 'string' ? billing.paymentMethod : null,
    typeof billing.method === 'string' ? billing.method : null,
    typeof billing.payerInformation?.method === 'string' ? billing.payerInformation.method : null,
    typeof billing.metadata?.paymentMethod === 'string' ? billing.metadata.paymentMethod : null,
    typeof billing.metadata?.metodoPagamento === 'string' ? billing.metadata.metodoPagamento : null,
  ];

  for (const candidate of directCandidates) {
    const normalized = normalizePaymentMethod(candidate);
    if (normalized) {
      return normalized;
    }
  }

  if (billing.methods?.length === 1) {
    return normalizePaymentMethod(billing.methods[0]);
  }

  return null;
}
