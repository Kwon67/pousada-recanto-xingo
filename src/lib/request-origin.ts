import type { NextRequest } from 'next/server';

function normalizeHost(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(',')[0]?.trim().toLowerCase();
  return first || null;
}

function toUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

interface SameOriginOptions {
  /**
   * Se true, métodos mutáveis (POST/PUT/PATCH/DELETE) exigem Origin/Referer válidos.
   */
  requireOriginForStateChanging?: boolean;
}

function normalizeOrigin(value: string | null): string | null {
  if (!value) return null;
  const url = toUrl(value);
  if (!url) return null;
  return url.origin;
}

function isStateChangingMethod(method: string): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

function isAllowedSecFetchSite(request: NextRequest): boolean {
  const value = request.headers.get('sec-fetch-site')?.toLowerCase().trim();
  if (!value) return true;

  // Rejeita explicitamente tráfego cross-site em endpoints sensíveis.
  return value === 'same-origin' || value === 'same-site' || value === 'none';
}

function buildAllowedOrigins(request: NextRequest): Set<string> {
  const allowed = new Set<string>();

  const configured = (process.env.ADMIN_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  for (const origin of configured) {
    const normalized = normalizeOrigin(origin);
    if (normalized) allowed.add(normalized);
  }

  const nextOrigin = request.nextUrl.origin?.trim();
  if (nextOrigin) {
    const normalized = normalizeOrigin(nextOrigin);
    if (normalized) allowed.add(normalized);
  }

  const hostCandidates = new Set<string>();
  const forwardedHost = normalizeHost(request.headers.get('x-forwarded-host'));
  const host = normalizeHost(request.headers.get('host'));
  const nextHost = request.nextUrl.host?.toLowerCase() || null;

  if (forwardedHost) hostCandidates.add(forwardedHost);
  if (host) hostCandidates.add(host);
  if (nextHost) hostCandidates.add(nextHost);

  for (const candidate of hostCandidates) {
    const plainHost = candidate.split(':')[0];
    if (!plainHost) continue;

    allowed.add(`https://${candidate}`);
    allowed.add(`http://${candidate}`);
    allowed.add(`https://${plainHost}`);
    allowed.add(`http://${plainHost}`);
  }

  return allowed;
}

function isAllowedOriginValue(origin: string, allowedOrigins: Set<string>): boolean {
  if (allowedOrigins.has(origin)) return true;

  const originUrl = toUrl(origin);
  if (!originUrl) return false;

  for (const allowed of allowedOrigins) {
    const allowedUrl = toUrl(allowed);
    if (!allowedUrl) continue;

    if (allowedUrl.origin === originUrl.origin) return true;
    if (allowedUrl.hostname === originUrl.hostname) return true;
  }

  return false;
}

export function isSameOriginRequest(
  request: NextRequest,
  options: SameOriginOptions = {}
): boolean {
  const requireOriginForStateChanging = options.requireOriginForStateChanging ?? true;
  const method = request.method.toUpperCase();

  if (!isAllowedSecFetchSite(request)) {
    return false;
  }

  const origin = normalizeOrigin(request.headers.get('origin'));
  const referer = request.headers.get('referer');
  const refererOrigin = normalizeOrigin(referer);
  const allowedOrigins = buildAllowedOrigins(request);

  if (origin) {
    return isAllowedOriginValue(origin, allowedOrigins);
  }

  if (refererOrigin) {
    return isAllowedOriginValue(refererOrigin, allowedOrigins);
  }

  if (!isStateChangingMethod(method)) {
    return true;
  }

  return requireOriginForStateChanging ? false : true;
}
