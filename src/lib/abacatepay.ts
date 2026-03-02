import { createHmac, timingSafeEqual } from 'crypto';

const ABACATE_API_BASE = 'https://api.abacatepay.com/v1';

export interface AbacatePayBilling {
  id: string;
  url: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  methods: ('PIX' | 'CARD')[];
  frequency: 'ONE_TIME';
  products: Array<{
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
  metadata?: Record<string, string> | null;
}

export interface AbacatePayWebhookEvent {
  event: string;
  data: {
    billing?: AbacatePayBilling;
    [key: string]: unknown;
  };
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
  return abacatePayPost<AbacatePayCustomer>('/customer/create', {
    name: input.nome,
    email: input.email,
    cellphone: input.telefone,
    taxId: input.cpf,
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
  signatureHeader: string | null,
  querySecret: string | null
): boolean {
  const webhookSecret = getAbacatePayWebhookSecret();

  // Layer 1: Query string secret validation
  if (querySecret && querySecret === webhookSecret) {
    return true;
  }

  // Layer 2: HMAC-SHA256 signature validation
  if (signatureHeader) {
    const publicKey = process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY?.trim();
    if (publicKey) {
      const expectedSignature = createHmac('sha256', publicKey)
        .update(rawBody, 'utf8')
        .digest('hex');

      const sigBuffer = Buffer.from(signatureHeader, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (sigBuffer.length === expectedBuffer.length) {
        return timingSafeEqual(sigBuffer, expectedBuffer);
      }
    }
  }

  return false;
}
