'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

// Default content used when Supabase is not configured
const conteudoDefault: Record<string, { valor: string; categoria: string }> = {
  hero_titulo: { valor: 'Seu refúgio às margens do Canyon do Xingó', categoria: 'home' },
  hero_subtitulo: { valor: 'Descanse, respire e viva a natureza do sertão alagoano. Pousada aconchegante com piscina, área de lazer e a hospitalidade nordestina que você merece.', categoria: 'home' },
  home_sobre_titulo: { valor: 'Bem-vindo ao Recanto do Matuto', categoria: 'home' },
  home_sobre_texto: { valor: 'Uma pousada nova e aconchegante em Piranhas, Alagoas. Construída com carinho para receber você que busca tranquilidade, conforto e contato com a natureza às margens do Canyon do Xingó.', categoria: 'home' },
  home_cta_titulo: { valor: 'Reserve agora e viva essa experiência', categoria: 'home' },
  home_cta_subtitulo: { valor: 'Quartos a partir de R$ 180/noite', categoria: 'home' },
  home_estrutura_piscina_imagem: { valor: 'https://placehold.co/600x400/2D6A4F/FDF8F0?text=Piscina', categoria: 'home' },
  home_estrutura_area_redes_imagem: { valor: 'https://placehold.co/600x400/D4A843/1B3A4B?text=Area+de+Redes', categoria: 'home' },
  home_estrutura_churrasqueira_imagem: { valor: 'https://placehold.co/600x400/E07A5F/FDF8F0?text=Churrasqueira', categoria: 'home' },
  home_estrutura_chuveirao_imagem: { valor: 'https://placehold.co/600x400/1B3A4B/FDF8F0?text=Chuveir%C3%A3o', categoria: 'home' },
  home_estrutura_espaco_amplo_imagem: { valor: 'https://placehold.co/600x400/40916C/FDF8F0?text=Espaco+Amplo', categoria: 'home' },
  home_estrutura_banheiro_privativo_imagem: { valor: 'https://placehold.co/600x400/2D6A4F/D4A843?text=Banheiro+Privativo', categoria: 'home' },
  sobre_titulo: { valor: 'Nossa História', categoria: 'sobre' },
  sobre_texto: { valor: 'A Pousada Recanto do Matuto Xingó nasceu do sonho de criar um espaço onde os visitantes pudessem se sentir em casa, cercados pela beleza natural do sertão alagoano.', categoria: 'sobre' },
  contato_como_chegar: { valor: 'De avião: O aeroporto mais próximo é o de Aracaju (SE) ou Maceió (AL). De lá, são aproximadamente 3 horas de carro até Piranhas.', categoria: 'contato' },
  politica_cancelamento: { valor: 'Cancelamento gratuito até 48 horas antes do check-in. Após esse prazo, será cobrada a primeira diária como taxa.', categoria: 'geral' },
  regras_pousada: { valor: 'Check-in a partir das 14h. Check-out até as 12h. Silêncio após as 22h. Pets não permitidos. Café da manhã incluso.', categoria: 'geral' },
};

type ConteudoRow = {
  chave: string;
  valor: string | null;
  categoria: string | null;
};

function toConteudoMap(rows: ConteudoRow[]) {
  return rows.reduce<Record<string, { valor: string; categoria: string }>>((acc, item) => {
    acc[item.chave] = {
      valor: item.valor ?? '',
      categoria: item.categoria ?? 'geral',
    };
    return acc;
  }, {});
}

export async function getConteudo() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('conteudo_site').select('chave, valor, categoria');
    if (error) throw error;
    return toConteudoMap((data ?? []) as ConteudoRow[]);
  } catch {
    return conteudoDefault;
  }
}

export async function getConteudoPorCategoria(categoria: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('conteudo_site')
      .select('chave, valor, categoria')
      .eq('categoria', categoria);
    if (error) throw error;
    return (data ?? []).map((item) => ({
      chave: item.chave,
      valor: item.valor ?? '',
      categoria: item.categoria ?? 'geral',
    }));
  } catch {
    return Object.entries(conteudoDefault)
      .filter(([, v]) => v.categoria === categoria)
      .map(([chave, v]) => ({ chave, ...v }));
  }
}

export async function getConteudoValor(chave: string): Promise<string> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('conteudo_site')
      .select('valor')
      .eq('chave', chave)
      .maybeSingle();
    if (error) throw error;
    return data?.valor ?? '';
  } catch {
    return conteudoDefault[chave]?.valor || '';
  }
}

export async function atualizarConteudo(chave: string, valor: string, categoria = 'geral') {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('conteudo_site').upsert(
      {
        chave,
        valor,
        categoria,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'chave' }
    );
    if (error) throw error;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar conteúdo';
    return { success: false, message };
  }

  revalidatePath('/');
  revalidatePath('/sobre');
  revalidatePath('/contato');
  return { success: true, message: 'Conteúdo atualizado! As mudanças já estão no site.' };
}

export async function atualizarConteudos(
  itens: Array<{ chave: string; valor: string; categoria: string }>
) {
  try {
    const supabase = createAdminClient();
    const payload = itens.map((item) => ({
      chave: item.chave,
      valor: item.valor,
      categoria: item.categoria,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('conteudo_site').upsert(payload, { onConflict: 'chave' });
    if (error) throw error;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao salvar conteúdo';
    return { success: false, message };
  }

  revalidatePath('/');
  revalidatePath('/sobre');
  revalidatePath('/contato');
  return { success: true, message: 'Conteúdo salvo com sucesso!' };
}
