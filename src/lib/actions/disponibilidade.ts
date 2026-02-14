'use server';

import { createClient } from '@/lib/supabase/server';

const STATUSES_QUE_BLOQUEIAM = ['pendente', 'confirmada'] as const;

/**
 * Retorna array de datas ocupadas no formato 'yyyy-MM-dd'.
 * Considera reservas ativas que bloqueiam agenda (pendente/confirmada).
 * A data de check-out fica livre para nova reserva no mesmo dia.
 */
export async function getDatasOcupadas(quartoId?: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('reservas')
      .select('check_in, check_out')
      .in('status', STATUSES_QUE_BLOQUEIAM);

    if (quartoId) {
      query = query.eq('quarto_id', quartoId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const ocupadas: string[] = [];
    for (const reserva of data) {
      const start = new Date(reserva.check_in + 'T00:00:00');
      const end = new Date(reserva.check_out + 'T00:00:00');
      const current = new Date(start);
      while (current < end) {
        ocupadas.push(formatDate(current));
        current.setDate(current.getDate() + 1);
      }
    }

    return [...new Set(ocupadas)];
  } catch {
    return [];
  }
}

/**
 * Retorna IDs dos quartos ativos que não têm conflito de datas.
 * Lógica de conflito: check_in < newCheckOut AND check_out > newCheckIn
 */
export async function getQuartosDisponiveisIds(checkIn: string, checkOut: string): Promise<string[]> {
  try {
    const supabase = await createClient();

    // Buscar todos os quartos ativos
    const { data: quartos, error: quartosError } = await supabase
      .from('quartos')
      .select('id')
      .eq('ativo', true);

    if (quartosError) throw quartosError;

    // Buscar reservas que conflitam com o período
    const { data: conflitos, error: conflitosError } = await supabase
      .from('reservas')
      .select('quarto_id')
      .in('status', STATUSES_QUE_BLOQUEIAM)
      .lt('check_in', checkOut)
      .gt('check_out', checkIn);

    if (conflitosError) throw conflitosError;

    const quartosOcupados = new Set(conflitos.map((r) => r.quarto_id));
    return quartos
      .filter((q) => !quartosOcupados.has(q.id))
      .map((q) => q.id);
  } catch {
    return [];
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
