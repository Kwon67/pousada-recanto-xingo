import { NextResponse, type NextRequest } from 'next/server';
import { hasAdminSessionFromRequest } from '@/lib/admin-auth';

// ─── Nonce + CSP ─────────────────────────────────────────────────────────────

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function buildCsp(nonce: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseOrigin: string | null = null;
  let supabaseWss: string | null = null;

  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);
      supabaseOrigin = url.origin;
      supabaseWss = `wss://${url.host}`;
    } catch {
      // ignore invalid URL
    }
  }

  const nonceDirective = `'nonce-${nonce}'`;

  const directives: [string, string[]][] = [
    ['default-src', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['frame-ancestors', ["'none'"]],
    ['object-src', ["'none'"]],
    [
      'script-src',
      [
        "'self'",
        nonceDirective,
        'https://connect.facebook.net',
        'https://www.googletagmanager.com',
      ],
    ],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    [
      'img-src',
      [
        "'self'",
        'data:',
        'blob:',
        'https://res.cloudinary.com',
        'https://www.facebook.com',
        'https://placehold.co',
      ],
    ],
    ['font-src', ["'self'", 'data:', 'https://fonts.gstatic.com']],
    [
      'connect-src',
      [
        "'self'",
        ...(supabaseOrigin ? [supabaseOrigin] : []),
        ...(supabaseWss ? [supabaseWss] : []),
        'https://api.abacatepay.com',
        'https://connect.facebook.net',
        'https://www.facebook.com',
        'https://graph.facebook.com',
      ],
    ],
    ['frame-src', ["'self'", 'https://abacatepay.com', 'https://www.google.com']],
    ['media-src', ["'self'", 'blob:', 'data:', 'https://res.cloudinary.com']],
    ['form-action', ["'self'"]],
  ];

  if (process.env.NODE_ENV === 'production') {
    directives.push(['upgrade-insecure-requests', []]);
  }

  return directives
    .map(([directive, sources]) =>
      sources.length === 0 ? directive : `${directive} ${sources.join(' ')}`
    )
    .join('; ');
}

// ─── Security headers ─────────────────────────────────────────────────────────

function applySecurityHeaders(
  response: NextResponse,
  pathname: string,
  nonce: string
): NextResponse {
  response.headers.set('Content-Security-Policy', buildCsp(nonce));
  response.headers.set('x-nonce', nonce);

  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/upload')) {
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  return response;
}

// ─── Proxy handler ───────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = generateNonce();
  const hasSession = await hasAdminSessionFromRequest(request);

  if (pathname.startsWith('/api/upload')) {
    if (!hasSession) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }),
        pathname,
        nonce
      );
    }
    return applySecurityHeaders(NextResponse.next(), pathname, nonce);
  }

  if (pathname.startsWith('/api/admin')) {
    const isPublicApi =
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/logout' ||
      pathname === '/api/admin/session';

    if (!isPublicApi && !hasSession) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }),
        pathname,
        nonce
      );
    }

    return applySecurityHeaders(NextResponse.next(), pathname, nonce);
  }

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    if (!hasSession && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      return applySecurityHeaders(NextResponse.redirect(loginUrl), pathname, nonce);
    }

    if (hasSession && isLoginPage) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL('/admin', request.url)),
        pathname,
        nonce
      );
    }
  }

  // Forward nonce to server components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  return applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    pathname,
    nonce
  );
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/upload',
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
