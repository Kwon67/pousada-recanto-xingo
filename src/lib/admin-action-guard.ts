'use server';

import { cookies } from 'next/headers';
import { getAdminSession, getAdminSessionCookieNames, type AdminSession } from '@/lib/admin-auth';

async function getSessionCookieValue(): Promise<string | null> {
  const cookieStore = await cookies();

  for (const cookieName of getAdminSessionCookieNames()) {
    const cookieValue = cookieStore.get(cookieName)?.value;
    if (cookieValue) return cookieValue;
  }

  return null;
}

export async function getAdminActionSession(): Promise<AdminSession | null> {
  const sessionValue = await getSessionCookieValue();
  return getAdminSession(sessionValue);
}

export async function isAdminActionAuthenticated(): Promise<boolean> {
  return Boolean(await getAdminActionSession());
}

export async function assertAdminActionSession(): Promise<AdminSession> {
  const session = await getAdminActionSession();
  if (!session) {
    throw new Error('Sessão administrativa inválida ou expirada.');
  }

  return session;
}
