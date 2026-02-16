'use server';

import { revalidatePath } from 'next/cache';
import { galeriaImagensMock } from '@/data/mock';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdminActionSession } from '@/lib/admin-action-guard';

export interface GaleriaItem {
  id: string;
  url: string;
  alt: string | null;
  categoria: string | null;
  ordem: number;
  destaque: boolean;
}

export async function getGaleria(categoria?: string): Promise<GaleriaItem[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase.from('galeria').select('*').order('ordem');
    if (categoria && categoria !== 'todos') {
      query = query.eq('categoria', categoria);
    }
    const { data, error } = await query;
    if (error) throw error;

    return (data as unknown as GaleriaItem[]).map((item) => ({
      ...item,
      destaque: Boolean(item.destaque),
    }));
  } catch {
    return galeriaImagensMock.map((img, i) => ({
      ...img,
      categoria: 'pousada',
      ordem: i,
      destaque: false,
    }));
  }
}

export async function adicionarFoto(data: {
  url: string;
  alt?: string;
  categoria?: string;
  destaque?: boolean;
}) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();

    const { data: current, error: countError } = await supabase
      .from('galeria')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (countError) throw countError;

    const { data: inserted, error } = await supabase
      .from('galeria')
      .insert({
        url: data.url,
        alt: data.alt ?? null,
        categoria: data.categoria ?? 'pousada',
        ordem: (current?.ordem ?? 0) + 1,
        destaque: data.destaque ?? false,
      })
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/admin/galeria');
    revalidatePath('/');
    return {
      success: true,
      message: 'Foto adicionada com sucesso!',
      data: inserted as unknown as GaleriaItem,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao adicionar foto';
    return { success: false, message };
  }
}

export async function atualizarFoto(
  id: string,
  data: {
    url?: string;
    alt?: string | null;
    categoria?: string | null;
    destaque?: boolean;
  }
) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const { data: updated, error } = await supabase
      .from('galeria')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    revalidatePath('/admin/galeria');
    revalidatePath('/');
    return {
      success: true,
      message: 'Imagem atualizada com sucesso!',
      data: updated as unknown as GaleriaItem,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar foto';
    return { success: false, message };
  }
}

export async function toggleDestaqueFoto(id: string, destaque: boolean) {
  return atualizarFoto(id, { destaque });
}

export async function deletarFoto(id: string) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('galeria').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/galeria');
    revalidatePath('/');
    return { success: true, message: 'Foto excluída com sucesso!' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir foto';
    return { success: false, message };
  }
}

export async function atualizarOrdemGaleria(itens: { id: string; ordem: number }[]) {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    for (const item of itens) {
      const { error } = await supabase
        .from('galeria')
        .update({ ordem: item.ordem })
        .eq('id', item.id);
      if (error) throw error;
    }

    revalidatePath('/admin/galeria');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao ordenar galeria';
    return { success: false, message };
  }
}
