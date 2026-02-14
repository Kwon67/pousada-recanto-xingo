import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, validateAdminCredentials } from '@/lib/admin-auth';
import { registrarAcessoAdmin } from '@/lib/admin-audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body?.username ?? '').trim();
    const password = String(body?.password ?? '');

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Preencha usuário e senha.' },
        { status: 400 }
      );
    }

    const result = validateAdminCredentials(username, password);
    if (!result.success) {
      const status = result.error.includes('não configuradas') ? 500 : 401;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    const response = NextResponse.json({
      success: true,
      user: { id: 'admin', email: username, name: 'Administrador' },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, result.sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    await registrarAcessoAdmin({
      request,
      username,
      eventType: 'login',
      path: '/admin/login',
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Não foi possível fazer login.' },
      { status: 500 }
    );
  }
}
