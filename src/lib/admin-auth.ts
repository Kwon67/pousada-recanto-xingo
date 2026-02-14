import type { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'admin_session';

function getAdminEnv() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  // Fallback only for local/dev to avoid lockout when env is missing.
  if (process.env.NODE_ENV !== 'production') {
    return {
      username: username || 'admin',
      password: password || 'admin123',
      secret: secret || 'dev-admin-session-secret',
    };
  }

  return {
    username,
    password,
    secret,
  };
}

export function hasValidAdminSession(sessionValue?: string | null): boolean {
  const { secret } = getAdminEnv();
  return Boolean(secret && sessionValue && sessionValue === secret);
}

export function hasAdminSessionFromRequest(request: NextRequest): boolean {
  return hasValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null);
}

export function validateAdminCredentials(username: string, password: string) {
  const env = getAdminEnv();

  if (!env.username || !env.password || !env.secret) {
    return { success: false as const, error: 'Credenciais do admin não configuradas no servidor.' };
  }

  if (username !== env.username || password !== env.password) {
    return { success: false as const, error: 'Usuário ou senha inválidos.' };
  }

  return { success: true as const, sessionValue: env.secret };
}
