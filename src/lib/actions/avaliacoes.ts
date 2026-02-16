'use server';

import { revalidatePath } from 'next/cache';
import { avaliacoesMock } from '@/data/mock';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdminActionSession, isAdminActionAuthenticated } from '@/lib/admin-action-guard';
import type { Avaliacao } from '@/types/avaliacao';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function getAvaliacoes(filtro?: { nota?: number; aprovada?: boolean }) {
  const hasAdminSession = await isAdminActionAuthenticated();

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('avaliacoes')
      .select(`
        *,
        hospede:hospedes(nome, cidade)
      `)
      .order('created_at', { ascending: false });

    if (filtro?.nota) {
      query = query.eq('nota', filtro.nota);
    }
    if (filtro?.aprovada !== undefined) {
      query = query.eq('aprovada', filtro.aprovada);
    } else if (!hasAdminSession) {
      query = query.eq('aprovada', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as Avaliacao[];
  } catch {
    let avaliacoes = [...avaliacoesMock];
    if (!hasAdminSession) {
      avaliacoes = avaliacoes.filter((a) => a.aprovada);
    }
    if (filtro?.nota) {
      avaliacoes = avaliacoes.filter((a) => a.nota === filtro.nota);
    }
    if (filtro?.aprovada !== undefined) {
      avaliacoes = avaliacoes.filter((a) => a.aprovada === filtro.aprovada);
    }
    return avaliacoes;
  }
}

export async function criarAvaliacao(data: {
  hospede_nome: string;
  quarto_id?: string | null;
  nota: number;
  comentario: string;
  aprovada?: boolean;
}) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();

    const generatedEmail = `${slugify(data.hospede_nome) || 'hospede'}-${Date.now()}@avaliacao.local`;
    const { data: hospede, error: hospedeError } = await supabase
      .from('hospedes')
      .insert({
        nome: data.hospede_nome,
        email: generatedEmail,
      })
      .select('id')
      .single();

    if (hospedeError) throw hospedeError;

    const { error } = await supabase.from('avaliacoes').insert({
      hospede_id: hospede.id,
      quarto_id: data.quarto_id ?? null,
      nota: data.nota,
      comentario: data.comentario,
      aprovada: data.aprovada ?? true,
    });

    if (error) throw error;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar avaliação';
    return { success: false, message };
  }

  revalidatePath('/admin/avaliacoes');
  revalidatePath('/');
  return { success: true, message: 'Avaliação adicionada com sucesso!' };
}

export async function toggleAprovada(id: string, aprovada: boolean) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('avaliacoes')
      .update({ aprovada })
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar avaliação';
    return { success: false, message };
  }

  revalidatePath('/admin/avaliacoes');
  revalidatePath('/');
  return { success: true, message: aprovada ? 'Avaliação aprovada!' : 'Avaliação ocultada do site.' };
}

export async function deletarAvaliacao(id: string) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('avaliacoes').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir avaliação';
    return { success: false, message };
  }

  revalidatePath('/admin/avaliacoes');
  revalidatePath('/');
  return { success: true, message: 'Avaliação excluída com sucesso!' };
}
