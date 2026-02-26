interface ReservaRateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remainingAttempts: number;
}

interface ReservaRateLimitInput {
  ip: string | null;
  email: string | null;
}

type HeaderGetter = { get(_name: string): string | null };

const DEFAULT_WINDOW_SECONDS = 15 * 60;
const DEFAULT_MAX_ATTEMPTS_PER_IP = 20;
const DEFAULT_MAX_ATTEMPTS_PER_EMAIL = 8;
const MAX_WINDOW_SECONDS = 24 * 60 * 60;
const MIN_WINDOW_SECONDS = 60;

const rateLimitStore = new Map<string, number[]>();

function getNumberFromEnv(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.round(parsed), min), max);
}

function getRateLimitConfig() {
  return {
    windowSeconds: getNumberFromEnv(
      process.env.RESERVA_RATE_LIMIT_WINDOW_SECONDS,
      DEFAULT_WINDOW_SECONDS,
      MIN_WINDOW_SECONDS,
      MAX_WINDOW_SECONDS
    ),
    maxAttemptsPerIp: getNumberFromEnv(
      process.env.RESERVA_RATE_LIMIT_MAX_ATTEMPTS_IP,
      DEFAULT_MAX_ATTEMPTS_PER_IP,
      3,
      100
    ),
    maxAttemptsPerEmail: getNumberFromEnv(
      process.env.RESERVA_RATE_LIMIT_MAX_ATTEMPTS_EMAIL,
      DEFAULT_MAX_ATTEMPTS_PER_EMAIL,
      2,
      50
    ),
  };
}

function normalizeText(value: string | null, maxLength: number): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function normalizeEmail(value: string | null): string | null {
  const normalized = normalizeText(value, 160);
  return normalized ? normalized.toLowerCase() : null;
}

function buildKey(prefix: 'ip' | 'email', value: string): string {
  return `${prefix}:${value}`;
}

function getRecentAttempts(key: string, windowStartMs: number): number[] {
  const attempts = rateLimitStore.get(key) ?? [];
  const recent = attempts.filter((timestamp) => timestamp >= windowStartMs);

  if (recent.length > 0) {
    rateLimitStore.set(key, recent);
  } else {
    rateLimitStore.delete(key);
  }

  return recent;
}

function consumeAttempt(key: string, nowMs: number): void {
  const attempts = rateLimitStore.get(key) ?? [];
  attempts.push(nowMs);
  rateLimitStore.set(key, attempts);
}

function getRetryAfterSeconds(
  attempts: number[],
  windowMs: number,
  nowMs: number
): number {
  if (attempts.length === 0) return 0;
  const earliest = attempts[0];
  if (!earliest) return 0;
  const retryMs = earliest + windowMs - nowMs;
  return Math.max(Math.ceil(retryMs / 1000), 0);
}

export function getClientIpFromHeaders(headers: HeaderGetter): string | null {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    return normalizeText(firstIp, 80);
  }

  const realIp = headers.get('x-real-ip');
  return normalizeText(realIp, 80);
}

export function checkAndConsumeReservaRateLimit(
  input: ReservaRateLimitInput
): ReservaRateLimitResult {
  const config = getRateLimitConfig();
  const nowMs = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const windowStartMs = nowMs - windowMs;

  const normalizedIp = normalizeText(input.ip, 80) || 'unknown';
  const normalizedEmail = normalizeEmail(input.email);

  const ipKey = buildKey('ip', normalizedIp.toLowerCase());
  const emailKey = normalizedEmail ? buildKey('email', normalizedEmail) : null;

  const ipAttempts = getRecentAttempts(ipKey, windowStartMs);
  const emailAttempts = emailKey ? getRecentAttempts(emailKey, windowStartMs) : [];

  const ipBlocked = ipAttempts.length >= config.maxAttemptsPerIp;
  const emailBlocked = emailAttempts.length >= config.maxAttemptsPerEmail;

  if (ipBlocked || emailBlocked) {
    const ipRetry = ipBlocked ? getRetryAfterSeconds(ipAttempts, windowMs, nowMs) : 0;
    const emailRetry = emailBlocked ? getRetryAfterSeconds(emailAttempts, windowMs, nowMs) : 0;

    return {
      allowed: false,
      retryAfterSeconds: Math.max(ipRetry, emailRetry),
      remainingAttempts: 0,
    };
  }

  consumeAttempt(ipKey, nowMs);
  if (emailKey) consumeAttempt(emailKey, nowMs);

  const remainingIp = Math.max(config.maxAttemptsPerIp - (ipAttempts.length + 1), 0);
  const remainingEmail = emailKey
    ? Math.max(config.maxAttemptsPerEmail - (emailAttempts.length + 1), 0)
    : remainingIp;

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remainingAttempts: Math.min(remainingIp, remainingEmail),
  };
}
