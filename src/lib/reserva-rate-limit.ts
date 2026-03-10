import { createAdminClient } from '@/lib/supabase/admin';

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

// In-memory cache: fast-path for same-instance requests
const localAttempts = new Map<string, number[]>();

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

function getLocalCount(key: string, windowStartMs: number): number {
  const attempts = localAttempts.get(key) ?? [];
  const recent = attempts.filter((ts) => ts >= windowStartMs);
  if (recent.length > 0) {
    localAttempts.set(key, recent);
  } else {
    localAttempts.delete(key);
  }
  return recent.length;
}

function addLocalAttempt(key: string): void {
  const attempts = localAttempts.get(key) ?? [];
  attempts.push(Date.now());
  localAttempts.set(key, attempts);
}

async function getDbCount(
  keyType: 'ip' | 'email',
  keyValue: string,
  windowStartIso: string
): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('reserva_rate_limit_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('key_type', keyType)
    .eq('key_value', keyValue)
    .gte('created_at', windowStartIso);

  if (error) throw error;
  return count ?? 0;
}

async function recordDbAttempt(keyType: 'ip' | 'email', keyValue: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from('reserva_rate_limit_attempts')
    .insert({ key_type: keyType, key_value: keyValue });
}

function getTrustedProxyCount(): number {
  const raw = Number(process.env.TRUSTED_PROXY_COUNT);
  if (!Number.isFinite(raw) || raw < 0) return 1;
  return Math.round(raw);
}

export function getClientIpFromHeaders(headers: HeaderGetter): string | null {
  // x-real-ip is set by infrastructure (Vercel, nginx), not controllable by clients
  const realIp = headers.get('x-real-ip');
  if (realIp) return normalizeText(realIp, 80);

  const forwardedFor = headers.get('x-forwarded-for');
  if (!forwardedFor) return null;

  // Strip rightmost N IPs added by trusted proxies, take the next one
  const ips = forwardedFor.split(',').map((ip) => ip.trim()).filter(Boolean);
  const trustedCount = getTrustedProxyCount();
  const targetIndex = ips.length - 1 - trustedCount;
  const ip = ips[Math.max(targetIndex, 0)];
  return normalizeText(ip ?? null, 80);
}

export async function checkAndConsumeReservaRateLimit(
  input: ReservaRateLimitInput
): Promise<ReservaRateLimitResult> {
  const config = getRateLimitConfig();
  const nowMs = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const windowStartMs = nowMs - windowMs;
  const windowStartIso = new Date(windowStartMs).toISOString();

  const normalizedIp = normalizeText(input.ip, 80)?.toLowerCase() || 'unknown';
  const normalizedEmail = normalizeEmail(input.email);

  const ipKey = `ip:${normalizedIp}`;
  const emailKey = normalizedEmail ? `email:${normalizedEmail}` : null;

  // Count local (same instance)
  const localIp = getLocalCount(ipKey, windowStartMs);
  const localEmail = emailKey ? getLocalCount(emailKey, windowStartMs) : 0;

  // Count from DB (cross-instance coordination), fallback to local on error
  let dbIp = 0;
  let dbEmail = 0;
  try {
    const dbCounts = await Promise.all([
      getDbCount('ip', normalizedIp, windowStartIso),
      normalizedEmail ? getDbCount('email', normalizedEmail, windowStartIso) : Promise.resolve(0),
    ]);
    dbIp = dbCounts[0];
    dbEmail = dbCounts[1];
  } catch {
    // Fallback to local-only if DB is unavailable
  }

  const totalIp = Math.max(localIp, dbIp);
  const totalEmail = Math.max(localEmail, dbEmail);

  const ipBlocked = totalIp >= config.maxAttemptsPerIp;
  const emailBlocked = totalEmail >= config.maxAttemptsPerEmail;

  if (ipBlocked || emailBlocked) {
    const retryAfterSeconds = config.windowSeconds;
    return { allowed: false, retryAfterSeconds, remainingAttempts: 0 };
  }

  // Record attempt
  addLocalAttempt(ipKey);
  if (emailKey) addLocalAttempt(emailKey);

  try {
    await Promise.all([
      recordDbAttempt('ip', normalizedIp),
      normalizedEmail ? recordDbAttempt('email', normalizedEmail) : Promise.resolve(),
    ]);
  } catch {
    // Non-fatal: local record still ensures same-instance protection
  }

  const remainingIp = Math.max(config.maxAttemptsPerIp - (totalIp + 1), 0);
  const remainingEmail = normalizedEmail
    ? Math.max(config.maxAttemptsPerEmail - (totalEmail + 1), 0)
    : remainingIp;

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remainingAttempts: Math.min(remainingIp, remainingEmail),
  };
}
