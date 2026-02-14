import { NextResponse, type NextRequest } from 'next/server';
import { hasAdminSessionFromRequest } from '@/lib/admin-auth';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = hasAdminSessionFromRequest(request);

  if (pathname.startsWith('/api/upload')) {
    if (!hasSession) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    if (!hasSession && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (hasSession && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/upload'],
};

