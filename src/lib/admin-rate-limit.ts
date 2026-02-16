import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_SECONDS = 15 * 60;

type RateLimitKeyType = 'ip' | 'username';

interface RateLimitConfig {
  maxAttempts: number;
  windowSeconds: number;
}

interface LoginRateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

const localFailures = new Map<string, number[]>();

function normalizeText(value: string | null, maxLength: number): string | null {
  if (!value) return null;
  const sanitized = value.trim();
  return sanitized ? sanitized.slice(0, maxLength) : null;
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    return normalizeText(firstIp, 80);
  }

  const realIp = request.headers.get('x-real-ip');
  return normalizeText(realIp, 80);
}

function getConfig(): RateLimitConfig {
  const maxAttemptsEnv = Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS);
  const windowSecondsEnv = Number(process.env.ADMIN_LOGIN_WINDOW_SECONDS);

  const maxAttempts = Number.isFinite(maxAttemptsEnv)
    ? Math.min(Math.max(Math.round(maxAttemptsEnv), 3), 20)
    : DEFAULT_MAX_ATTEMPTS;

  const windowSeconds = Number.isFinite(windowSecondsEnv)
    ? Math.min(Math.max(Math.round(windowSecondsEnv), 60), 24 * 60 * 60)
    : DEFAULT_WINDOW_SECONDS;

  return { maxAttempts, windowSeconds };
}

function cleanupLocalFailures(windowStartMs: number): void {
  for (const [key, timestamps] of localFailures.entries()) {
    const filtered = timestamps.filter((timestamp) => timestamp >= windowStartMs);
    if (filtered.length > 0) {
      localFailures.set(key, filtered);
    } else {
      localFailures.delete(key);
    }
  }
}

function getLocalFailuresCount(key: string, windowStartMs: number): number {
  const timestamps = localFailures.get(key);
  if (!timestamps || timestamps.length === 0) return 0;
  return timestamps.filter((timestamp) => timestamp >= windowStartMs).length;
}

function addLocalFailure(key: string): void {
  const nowMs = Date.now();
  const existing = localFailures.get(key) ?? [];
  existing.push(nowMs);
  localFailures.set(key, existing);
}

function clearLocalFailures(key: string): void {
  localFailures.delete(key);
}

function buildKey(type: RateLimitKeyType, value: string): string {
  return `${type}:${value.toLowerCase()}`;
}

async function getDatabaseFailuresCount(
  type: RateLimitKeyType,
  value: string,
  windowStartIso: string
): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('admin_access_logs')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', 'login_failed')
    .eq(type, value)
    .gte('created_at', windowStartIso);

  if (error) throw error;
  return count ?? 0;
}

export function recordFailedAdminLoginAttempt(request: NextRequest, username: string): void {
  const ip = getClientIp(request) ?? 'unknown';
  const normalizedUser = username.trim().toLowerCase() || 'unknown';

  addLocalFailure(buildKey('ip', ip));
  addLocalFailure(buildKey('username', normalizedUser));
}

export function resetFailedAdminLoginAttempts(request: NextRequest, username: string): void {
  const ip = getClientIp(request) ?? 'unknown';
  const normalizedUser = username.trim().toLowerCase() || 'unknown';

  clearLocalFailures(buildKey('ip', ip));
  clearLocalFailures(buildKey('username', normalizedUser));
}

export async function checkAdminLoginRateLimit(
  request: NextRequest,
  username: string
): Promise<LoginRateLimitStatus> {
  const normalizedUser = username.trim().toLowerCase() || 'unknown';
  const ip = getClientIp(request) ?? 'unknown';
  const config = getConfig();
  const nowMs = Date.now();
  const windowStartMs = nowMs - config.windowSeconds * 1000;
  const windowStartIso = new Date(windowStartMs).toISOString();

  cleanupLocalFailures(windowStartMs);

  const ipKey = buildKey('ip', ip);
  const usernameKey = buildKey('username', normalizedUser);

  const localIpFailures = getLocalFailuresCount(ipKey, windowStartMs);
  const localUserFailures = getLocalFailuresCount(usernameKey, windowStartMs);

  let dbIpFailures = 0;
  let dbUserFailures = 0;
  try {
    [dbIpFailures, dbUserFailures] = await Promise.all([
      getDatabaseFailuresCount('ip', ip, windowStartIso),
      getDatabaseFailuresCount('username', normalizedUser, windowStartIso),
    ]);
  } catch (error) {
    console.warn('checkAdminLoginRateLimit fallback local-only:', error);
  }

  const totalIpFailures = Math.max(localIpFailures, dbIpFailures);
  const totalUserFailures = Math.max(localUserFailures, dbUserFailures);
  const attemptsUsed = Math.max(totalIpFailures, totalUserFailures);
  const remainingAttempts = Math.max(config.maxAttempts - attemptsUsed, 0);
  const allowed = attemptsUsed < config.maxAttempts;
  const retryAfterSeconds = allowed ? 0 : config.windowSeconds;

  return {
    allowed,
    remainingAttempts,
    retryAfterSeconds,
  };
}
