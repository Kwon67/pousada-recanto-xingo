'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { quartosMock } from '@/data/mock';
import type { Database } from '@/types/database';
import type { Quarto } from '@/types/quarto';

type QuartoInsert = Database['public']['Tables']['quartos']['Insert'];
type QuartoUpdate = Database['public']['Tables']['quartos']['Update'];

export async function getQuartos(filtro?: { categoria?: string }): Promise<Quarto[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('quartos').select('*').order('ordem');
    if (filtro?.categoria && filtro.categoria !== 'todos') {
      query = query.eq('categoria', filtro.categoria as 'standard' | 'superior' | 'suite');
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as Quarto[];
  } catch {
    // Fallback to mock data if Supabase is not configured
    let quartos = [...quartosMock];
    if (filtro?.categoria && filtro.categoria !== 'todos') {
      quartos = quartos.filter((q) => q.categoria === filtro.categoria);
    }
    return quartos;
  }
}

export async function getQuartoById(id: string): Promise<Quarto | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('quartos').select('*').eq('id', id).single();
    if (error) throw error;
    return data as unknown as Quarto;
  } catch {
    return quartosMock.find((q) => q.id === id) || null;
  }
}

export async function getQuartoBySlug(slug: string): Promise<Quarto | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('quartos').select('*').eq('slug', slug).single();
    if (error) throw error;
    return data as unknown as Quarto;
  } catch {
    return quartosMock.find((q) => q.slug === slug) || null;
  }
}

export async function criarQuarto(data: {
  nome: string;
  descricao_curta: string;
  descricao: string;
  categoria: string;
  preco_diaria: number;
  preco_fds: number;
  capacidade: number;
  tamanho_m2: number;
  amenidades: string[];
  imagens: string[];
  imagem_principal: string | null;
  ativo: boolean;
  destaque: boolean;
}) {
  const supabase = createAdminClient();
  const slug = data.nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const insertData: QuartoInsert = {
    ...data,
    slug,
    categoria: data.categoria as QuartoInsert['categoria'],
  };
  const { error } = await supabase.from('quartos').insert(insertData);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/quartos');
  revalidatePath('/admin/quartos');
  return { success: true, message: 'Quarto criado com sucesso!' };
}

export async function atualizarQuarto(id: string, data: QuartoUpdate) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('quartos').update(data).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/quartos');
  revalidatePath('/admin/quartos');
  return { success: true, message: 'Quarto atualizado com sucesso!' };
}

export async function deletarQuarto(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('quartos').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/quartos');
  revalidatePath('/admin/quartos');
  return { success: true, message: 'Quarto excluído com sucesso!' };
}

export async function toggleAtivoQuarto(id: string, ativo: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('quartos').update({ ativo }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/quartos');
  revalidatePath('/admin/quartos');
  return { success: true };
}
