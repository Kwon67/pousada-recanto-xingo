export type CategoriaQuarto = 'standard' | 'superior' | 'suite';

export interface Quarto {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  descricao_curta: string;
  categoria: CategoriaQuarto;
  preco_diaria: number;
  preco_fds: number;
  capacidade: number;
  tamanho_m2: number;
  amenidades: string[];
  imagens: string[];
  imagem_principal: string;
  ativo: boolean;
  destaque: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface QuartoCard {
  id: string;
  nome: string;
  slug: string;
  descricao_curta: string;
  categoria: CategoriaQuarto;
  preco_diaria: number;
  capacidade: number;
  imagem_principal: string;
  destaque: boolean;
}

export interface FiltroQuartos {
  categoria?: CategoriaQuarto | 'todos';
  precoMin?: number;
  precoMax?: number;
  capacidade?: number;
}
