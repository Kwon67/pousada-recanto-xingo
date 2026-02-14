import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from '@/lib/admin-auth';
import { registrarAcessoAdmin } from '@/lib/admin-audit';

export async function GET(request: NextRequest) {
  const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null;
  const authenticated = hasValidAdminSession(sessionValue);

  if (!authenticated) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const username = process.env.ADMIN_USERNAME?.trim() || 'admin';

  await registrarAcessoAdmin({
    request,
    username,
    eventType: 'access',
    path: '/admin',
  });

  return NextResponse.json({
    authenticated: true,
    user: {
      id: 'admin',
      email: username,
      name: 'Administrador',
    },
  });
}
