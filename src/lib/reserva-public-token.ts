import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 dias
const MIN_TOKEN_TTL_SECONDS = 60 * 60; // 1 hora
const MAX_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 dias
const DEV_FALLBACK_SECRET = randomBytes(32).toString('hex');

function getTokenTtlSeconds(): number {
  const raw = Number(process.env.RESERVA_PUBLIC_TOKEN_TTL_SECONDS);
  if (!Number.isFinite(raw)) return DEFAULT_TOKEN_TTL_SECONDS;
  return Math.min(Math.max(Math.round(raw), MIN_TOKEN_TTL_SECONDS), MAX_TOKEN_TTL_SECONDS);
}

function getTokenSecret(): string {
  const dedicated = process.env.RESERVA_PUBLIC_TOKEN_SECRET?.trim();
  if (dedicated) return dedicated;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('RESERVA_PUBLIC_TOKEN_SECRET não configurada em produção.');
  }

  return DEV_FALLBACK_SECRET;
}

function buildPayload(reservaId: string, exp: number): string {
  return `${reservaId}.${exp}`;
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

function safeCompareHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;

  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export function createReservaPublicToken(reservaId: string): string {
  const normalizedId = reservaId.trim();
  if (!normalizedId) {
    throw new Error('ID da reserva inválido para criar token público.');
  }

  const exp = Math.floor(Date.now() / 1000) + getTokenTtlSeconds();
  const payload = buildPayload(normalizedId, exp);
  const signature = signPayload(payload, getTokenSecret());
  return `${exp}.${signature}`;
}

export function verifyReservaPublicToken(reservaId: string, token: string): boolean {
  const normalizedId = reservaId.trim();
  const normalizedToken = token.trim();
  if (!normalizedId || !normalizedToken) return false;

  const parts = normalizedToken.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

  const [expPart, signature] = parts;
  const exp = Number.parseInt(expPart, 10);
  if (!Number.isFinite(exp)) return false;
  if (exp <= Math.floor(Date.now() / 1000)) return false;

  const payload = buildPayload(normalizedId, exp);
  const expectedSignature = signPayload(payload, getTokenSecret());
  return safeCompareHex(signature, expectedSignature);
}
