import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionCookieNames, getAdminSessionFromRequest } from '@/lib/admin-auth';
import { registrarAcessoAdmin } from '@/lib/admin-audit';
import { isSameOriginRequest } from '@/lib/request-origin';

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: 'Origem inválida para logout.' },
      { status: 403 }
    );
  }

  const adminSession = await getAdminSessionFromRequest(request);
  const response = NextResponse.json({ success: true });

  for (const cookieName of getAdminSessionCookieNames()) {
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
      priority: 'high',
    });
  }

  if (adminSession) {
    await registrarAcessoAdmin({
      request,
      username: adminSession.username,
      eventType: 'logout',
      path: '/api/admin/logout',
    });
  }

  return response;
}
