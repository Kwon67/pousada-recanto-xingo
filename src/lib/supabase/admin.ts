import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const adminKey = secretKey || serviceRoleKey;

  if (!supabaseUrl || !adminKey) {
    throw new Error(
      'Supabase admin não configurado (NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY).'
    );
  }

  return createClient<Database>(supabaseUrl, adminKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
