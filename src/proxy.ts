import { NextResponse, type NextRequest } from 'next/server';
import { hasAdminSessionFromRequest } from '@/lib/admin-auth';

function applySecurityHeaders(response: NextResponse, pathname: string): NextResponse {
  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/upload')) {
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = await hasAdminSessionFromRequest(request);

  if (pathname.startsWith('/api/upload')) {
    if (!hasSession) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }),
        pathname
      );
    }
    return applySecurityHeaders(NextResponse.next(), pathname);
  }

  if (pathname.startsWith('/api/admin')) {
    const isPublicApi =
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/logout' ||
      pathname === '/api/admin/session';

    if (!isPublicApi && !hasSession) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }),
        pathname
      );
    }

    return applySecurityHeaders(NextResponse.next(), pathname);
  }

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    if (!hasSession && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      return applySecurityHeaders(NextResponse.redirect(loginUrl), pathname);
    }

    if (hasSession && isLoginPage) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL('/admin', request.url)),
        pathname
      );
    }
  }

  return applySecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: ['/admin/:path*', '/api/upload', '/api/admin/:path*'],
};
