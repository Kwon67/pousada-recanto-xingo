'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/Toast';
import type { Database } from '@/types/database';

type ReservaRow = Database['public']['Tables']['reservas']['Row'];
type ReservaPayload = RealtimePostgresChangesPayload<ReservaRow>;

interface UseRealtimeReservasOptions {
  enabled?: boolean;
  onInsert?: (_payload: ReservaPayload) => void;
  onUpdate?: (_payload: ReservaPayload) => void;
  onDelete?: (_payload: ReservaPayload) => void;
  onChange?: (_payload: ReservaPayload) => void;
  onInvalidate?: () => void;
}

export function useRealtimeReservas({
  enabled = true,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  onInvalidate,
}: UseRealtimeReservasOptions = {}) {
  const { showToast } = useToast();

  const supabase = useMemo(
    () =>
      createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`reservas-realtime-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservas',
        },
        (payload: ReservaPayload) => {
          if (payload.eventType === 'INSERT') {
            showToast('Nova reserva recebida!', 'success');
            onInsert?.(payload);
          }

          if (payload.eventType === 'UPDATE') {
            onUpdate?.(payload);
          }

          if (payload.eventType === 'DELETE') {
            onDelete?.(payload);
          }

          onChange?.(payload);
          onInvalidate?.();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    enabled,
    onChange,
    onDelete,
    onInsert,
    onInvalidate,
    onUpdate,
    showToast,
    supabase,
  ]);
}

export function AdminRealtimeReservasRefresh({ enabled = true }: { enabled?: boolean }) {
  const router = useRouter();

  useRealtimeReservas({
    enabled,
    onInvalidate: () => router.refresh(),
  });

  return null;
}
