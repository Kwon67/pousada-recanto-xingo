import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';
import { registrarAcessoAdmin } from '@/lib/admin-audit';

export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  const authenticated = Boolean(session);

  if (!authenticated) {
    return NextResponse.json(
      { authenticated: false, user: null, session: null },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const username = session?.username || 'admin';

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
    session: {
      expiresAt: session?.expiresAt ?? null,
      issuedAt: session?.issuedAt ?? null,
    },
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
