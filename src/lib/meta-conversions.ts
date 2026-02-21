import { createHash } from 'crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const GRAPH_API_VERSION = 'v21.0';

function hashSHA256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Se já começa com 55, mantém; senão, adiciona
  return digits.startsWith('55') ? digits : `55${digits}`;
}

interface ConversionEventParams {
  eventName: string;
  email?: string | null;
  telefone?: string | null;
  valor: number;
  currency?: string;
  reservaId: string;
  contentIds?: string[];
}

/**
 * Envia evento para a Meta Conversions API (server-side).
 * Nunca rejeita — falhas são apenas logadas para não bloquear o fluxo de reservas.
 */
export async function sendConversionEvent(params: ConversionEventParams): Promise<boolean> {
  const {
    eventName,
    email,
    telefone,
    valor,
    currency = 'BRL',
    reservaId,
    contentIds = [],
  } = params;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('[Meta CAPI] PIXEL_ID ou ACCESS_TOKEN não configurados. Evento ignorado.');
    return false;
  }

  const userData: Record<string, string> = {};
  if (email) userData.em = hashSHA256(email);
  if (telefone) userData.ph = hashSHA256(formatPhone(telefone));

  const eventData = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: `${eventName}_${reservaId}_${Date.now()}`,
    action_source: 'website',
    user_data: userData,
    custom_data: {
      value: valor,
      currency,
      content_ids: contentIds,
      content_type: 'product',
      order_id: reservaId,
    },
  };

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [eventData],
        access_token: ACCESS_TOKEN,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[Meta CAPI] Erro ${response.status}: ${body}`);
      return false;
    }

    console.log(`[Meta CAPI] Evento ${eventName} enviado para reserva ${reservaId}`);
    return true;
  } catch (err) {
    console.error('[Meta CAPI] Falha ao enviar evento:', err);
    return false;
  }
}
