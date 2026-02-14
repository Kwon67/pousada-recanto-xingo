export type StatusReserva = 'pendente' | 'confirmada' | 'cancelada' | 'concluida';

export interface Reserva {
  id: string;
  quarto_id: string;
  hospede_id: string;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  valor_total: number;
  status: StatusReserva;
  observacoes?: string;
  created_at: string;
  quarto?: {
    nome: string;
    imagem_principal: string;
    categoria: string;
    preco_diaria: number;
    preco_fds: number;
  };
  hospede?: {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    cidade: string;
  };
}

export interface NovaReserva {
  quarto_id: string;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  valor_total: number;
  observacoes?: string;
}

export interface DatasIndisponiveis {
  quarto_id: string;
  datas: string[];
}
