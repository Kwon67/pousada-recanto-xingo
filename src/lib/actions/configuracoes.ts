'use server';

import { revalidatePath } from 'next/cache';
import { configuracoesMock } from '@/data/mock';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdminActionSession } from '@/lib/admin-action-guard';
import type { Database, Configuracoes } from '@/types/database';

type ConfiguracoesRow = Database['public']['Tables']['configuracoes']['Row'];
type ConfiguracoesUpsert = Database['public']['Tables']['configuracoes']['Insert'];

function normalizeTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 5);
}

function toConfiguracoes(row: ConfiguracoesRow): Configuracoes {
  return {
    id: row.id,
    nome_pousada: row.nome_pousada,
    descricao: row.descricao ?? '',
    endereco: row.endereco,
    telefone: row.telefone,
    email: row.email,
    instagram: row.instagram ?? '',
    facebook: row.facebook ?? '',
    booking_url: row.booking_url ?? '',
    google_analytics: row.google_analytics ?? '',
    meta_pixel: row.meta_pixel ?? '',
    email_conta: row.email_conta ?? '',
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    horario_checkin: normalizeTime(row.horario_checkin),
    horario_checkout: normalizeTime(row.horario_checkout),
    whatsapp_notificacoes: row.whatsapp_notificacoes,
    email_notificacoes: row.email_notificacoes,
    nova_reserva_push: row.nova_reserva_push,
  };
}

export async function getConfiguracoes(): Promise<Configuracoes> {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return configuracoesMock;

    return toConfiguracoes(data as ConfiguracoesRow);
  } catch {
    return configuracoesMock;
  }
}

export async function atualizarConfiguracoes(data: {
  nome_pousada: string;
  descricao: string;
  endereco: string;
  telefone: string;
  email: string;
  instagram?: string;
  facebook?: string;
  booking_url?: string;
  google_analytics?: string;
  meta_pixel?: string;
  email_conta?: string;
  horario_checkin: string;
  horario_checkout: string;
  latitude?: number;
  longitude?: number;
  whatsapp_notificacoes?: boolean;
  email_notificacoes?: boolean;
  nova_reserva_push?: boolean;
}) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const { data: existing, error: existingError } = await supabase
      .from('configuracoes')
      .select('id')
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;

    const payload: ConfiguracoesUpsert = {
      ...(existing?.id ? { id: existing.id } : {}),
      nome_pousada: data.nome_pousada,
      descricao: data.descricao || null,
      endereco: data.endereco,
      telefone: data.telefone,
      email: data.email,
      instagram: data.instagram || null,
      facebook: data.facebook || null,
      booking_url: data.booking_url || null,
      google_analytics: data.google_analytics || null,
      meta_pixel: data.meta_pixel || null,
      email_conta: data.email_conta || null,
      horario_checkin: data.horario_checkin,
      horario_checkout: data.horario_checkout,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      whatsapp_notificacoes: data.whatsapp_notificacoes ?? true,
      email_notificacoes: data.email_notificacoes ?? true,
      nova_reserva_push: data.nova_reserva_push ?? true,
    };

    const { error } = await supabase.from('configuracoes').upsert(payload);
    if (error) throw error;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar configurações';
    return { success: false, message };
  }

  revalidatePath('/admin/configuracoes');
  revalidatePath('/');
  revalidatePath('/contato');
  revalidatePath('/sobre');
  return { success: true, message: 'Configurações salvas com sucesso!' };
}
