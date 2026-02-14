'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminAccessLog } from '@/types/admin';

export async function getUltimosAcessosAdmin(limit: number = 12): Promise<AdminAccessLog[]> {
  try {
    const supabase = createAdminClient();
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const { data, error } = await supabase
      .from('admin_access_logs')
      .select('id, username, event_type, ip, user_agent, path, created_at')
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) throw error;
    return data as AdminAccessLog[];
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Erro desconhecido ao buscar auditoria admin';
    console.error('getUltimosAcessosAdmin error:', message);
    return [];
  }
}
