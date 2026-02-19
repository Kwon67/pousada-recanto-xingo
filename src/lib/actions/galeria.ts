'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { galeriaImagensMock } from '@/data/mock';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdminActionSession } from '@/lib/admin-action-guard';
import type { Database } from '@/types/database';

export interface GaleriaItem {
  id: string;
  url: string;
  alt: string | null;
  categoria: string | null;
  ordem: number;
  destaque: boolean;
}

function createReadOnlyClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !anonKey) return null;

  return createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function normalizeGaleriaRows(rows: GaleriaItem[]) {
  return rows.map((item) => ({
    ...item,
    destaque: Boolean(item.destaque),
  }));
}

function parseActionError(err: unknown): { message: string; missingDestaqueColumn: boolean } {
  const fallback = 'Erro inesperado';

  if (err instanceof Error) {
    const message = err.message || fallback;
    return {
      message,
      missingDestaqueColumn: /destaque/i.test(message) && /does not exist|schema cache/i.test(message),
    };
  }

  if (typeof err === 'object' && err !== null) {
    const maybe = err as { message?: string; details?: string; hint?: string };
    const parts = [maybe.message, maybe.details, maybe.hint].filter(Boolean);
    const message = parts.length > 0 ? parts.join(' ') : fallback;
    return {
      message,
      missingDestaqueColumn: /destaque/i.test(message) && /does not exist|schema cache/i.test(message),
    };
  }

  return { message: fallback, missingDestaqueColumn: false };
}

export async function getGaleria(categoria?: string): Promise<GaleriaItem[]> {
  const runSelect = async (
    client: ReturnType<typeof createAdminClient> | ReturnType<typeof createReadOnlyClient>
  ) => {
    if (!client) throw new Error('Supabase read client indisponível');

    let query = client.from('galeria').select('*').order('ordem');
    if (categoria && categoria !== 'todos') {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) throw error;

    return normalizeGaleriaRows((data as unknown as GaleriaItem[]) ?? []);
  };

  try {
    return await runSelect(createAdminClient());
  } catch {
    try {
      return await runSelect(createReadOnlyClient());
    } catch {
      return galeriaImagensMock.map((img, i) => ({
        ...img,
        categoria: 'momentos',
        ordem: i,
        destaque: false,
      }));
    }
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

    // Verificar se já existe mídia com a mesma URL
    const { data: existing, error: checkError } = await supabase
      .from('galeria')
      .select('id, alt, categoria')
      .eq('url', data.url)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existing) {
      return {
        success: false,
        message: `Já existe uma mídia com esta URL na categoria "${existing.categoria || 'momentos'}". Use uma imagem/vídeo diferente.`,
        duplicate: true,
      };
    }

    const { data: current, error: countError } = await supabase
      .from('galeria')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (countError) throw countError;

    const basePayload = {
      url: data.url,
      alt: data.alt ?? null,
      categoria: data.categoria ?? 'momentos',
      ordem: (current?.ordem ?? 0) + 1,
    };

    let inserted: unknown = null;
    let usedDestaqueFallback = false;

    const firstAttempt = await supabase
      .from('galeria')
      .insert({
        ...basePayload,
        destaque: data.destaque ?? false,
      })
      .select('*')
      .single();

    if (firstAttempt.error) {
      const parsed = parseActionError(firstAttempt.error);

      if (parsed.missingDestaqueColumn) {
        const fallbackAttempt = await supabase
          .from('galeria')
          .insert(basePayload)
          .select('*')
          .single();

        if (fallbackAttempt.error) {
          throw fallbackAttempt.error;
        }

        inserted = fallbackAttempt.data;
        usedDestaqueFallback = true;
      } else {
        throw firstAttempt.error;
      }
    } else {
      inserted = firstAttempt.data;
    }

    revalidatePath('/admin/galeria');
    revalidatePath('/');
    return {
      success: true,
      message: usedDestaqueFallback && data.destaque
        ? 'Foto adicionada, mas o destaque não foi salvo (banco sem coluna destaque).'
        : 'Foto adicionada com sucesso!',
      data: inserted as unknown as GaleriaItem,
    };
  } catch (err) {
    const { message } = parseActionError(err);
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
    const firstAttempt = await supabase
      .from('galeria')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    let updated = firstAttempt.data;
    if (firstAttempt.error) {
      const parsed = parseActionError(firstAttempt.error);
      if (!parsed.missingDestaqueColumn) {
        throw firstAttempt.error;
      }

      const { destaque: _ignored, ...withoutDestaque } = data;
      if (Object.keys(withoutDestaque).length === 0) {
        return {
          success: false,
          message: 'Seu banco não tem o campo de destaque da galeria. Execute as migrations pendentes.',
        };
      }

      const fallbackAttempt = await supabase
        .from('galeria')
        .update(withoutDestaque)
        .eq('id', id)
        .select('*')
        .single();

      if (fallbackAttempt.error) {
        throw fallbackAttempt.error;
      }
      updated = fallbackAttempt.data;
    }

    revalidatePath('/admin/galeria');
    revalidatePath('/');
    return {
      success: true,
      message: 'Imagem atualizada com sucesso!',
      data: updated as unknown as GaleriaItem,
    };
  } catch (err) {
    const { message } = parseActionError(err);
    return { success: false, message };
  }
}

export async function toggleDestaqueFoto(id: string, destaque: boolean) {
  return atualizarFoto(id, { destaque });
}

export async function deletarFoto(id: string) {
  try {
    await assertAdminActionSession();
  } catch (err) {
    console.error('[deletarFoto] Erro de autenticação:', err);
    const { message } = parseActionError(err);
    return { success: false, message };
  }

  try {
    const supabase = createAdminClient();
    console.log('[deletarFoto] Tentando excluir ID:', id);
    
    const { error, count } = await supabase
      .from('galeria')
      .delete()
      .eq('id', id)
      .select('id');
    
    console.log('[deletarFoto] Resultado:', { error, count, id });
    
    if (error) {
      console.error('[deletarFoto] Erro do Supabase:', error);
      throw error;
    }

    revalidatePath('/admin/galeria');
    revalidatePath('/');
    return { success: true, message: 'Foto excluída com sucesso!' };
  } catch (err) {
    console.error('[deletarFoto] Erro geral:', err);
    const { message } = parseActionError(err);
    return { success: false, message };
  }
}

export async function getGaleriaDuplicates(): Promise<{ categoria: string; items: GaleriaItem[] }[]> {
  await assertAdminActionSession();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('galeria')
      .select('*')
      .order('categoria')
      .order('ordem');

    if (error) throw error;

    const rows = normalizeGaleriaRows(data as unknown as GaleriaItem[]);
    
    // Agrupar por categoria e encontrar URLs duplicadas
    const byCategoria = new Map<string, GaleriaItem[]>();
    for (const item of rows) {
      const cat = item.categoria || 'momentos';
      if (!byCategoria.has(cat)) byCategoria.set(cat, []);
      byCategoria.get(cat)!.push(item);
    }

    const duplicates: { categoria: string; items: GaleriaItem[] }[] = [];
    byCategoria.forEach((items, categoria) => {
      const urlCounts = new Map<string, number>();
      for (const item of items) {
        urlCounts.set(item.url, (urlCounts.get(item.url) || 0) + 1);
      }
      
      const dupUrls = new Set([...urlCounts.entries()]
        .filter(([_, count]) => count > 1)
        .map(([url]) => url));
      
      if (dupUrls.size > 0) {
        duplicates.push({
          categoria,
          items: items.filter(i => dupUrls.has(i.url)),
        });
      }
    });

    return duplicates;
  } catch (err) {
    const { message } = parseActionError(err);
    console.error('[getGaleriaDuplicates] Erro:', message);
    return [];
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
    const { message } = parseActionError(err);
    return { success: false, message };
  }
}
