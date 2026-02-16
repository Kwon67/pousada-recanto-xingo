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

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  // Requests from server-side contexts may not send origin.
  if (!origin) return true;

  const originUrl = toUrl(origin);
  if (!originUrl) return false;

  const allowedOrigins = (process.env.ADMIN_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowedOrigins.includes(originUrl.origin)) {
    return true;
  }

  const hostCandidates = new Set<string>();
  const forwardedHost = normalizeHost(request.headers.get('x-forwarded-host'));
  const host = normalizeHost(request.headers.get('host'));
  const nextHost = request.nextUrl.host?.toLowerCase() || null;

  if (forwardedHost) hostCandidates.add(forwardedHost);
  if (host) hostCandidates.add(host);
  if (nextHost) hostCandidates.add(nextHost);

  const originHost = originUrl.host.toLowerCase();
  if (hostCandidates.has(originHost)) return true;

  const originHostname = originUrl.hostname.toLowerCase();
  for (const candidate of hostCandidates) {
    if (candidate.split(':')[0] === originHostname) {
      return true;
    }
  }

  return false;
}
