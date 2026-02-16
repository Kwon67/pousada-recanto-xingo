import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminAccessEventType } from '@/types/admin';

interface RegistrarAcessoAdminInput {
  request: NextRequest;
  username: string;
  eventType: AdminAccessEventType;
  path?: string;
}

function normalizeText(value: string | null, maxLength: number): string | null {
  if (!value) return null;
  const sanitized = value.trim();
  return sanitized ? sanitized.slice(0, maxLength) : null;
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    return normalizeText(firstIp, 80);
  }

  const realIp = request.headers.get('x-real-ip');
  return normalizeText(realIp, 80);
}

export async function registrarAcessoAdmin(input: RegistrarAcessoAdminInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    const username = normalizeText(input.username.toLowerCase(), 120) || 'admin';
    const path = normalizeText(input.path ?? input.request.nextUrl.pathname, 160);
    const userAgent = normalizeText(input.request.headers.get('user-agent'), 500);
    const ip = getClientIp(input.request);

    const { error } = await supabase.from('admin_access_logs').insert({
      username,
      event_type: input.eventType,
      ip,
      user_agent: userAgent,
      path,
    });

    if (error) throw error;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Erro desconhecido ao registrar acesso admin';
    console.error('registrarAcessoAdmin error:', message);
  }
}
