export interface Avaliacao {
  id: string;
  hospede_id?: string;
  quarto_id?: string;
  nota: number;
  comentario: string;
  aprovada: boolean;
  created_at: string;
  hospede?: {
    nome: string;
    cidade: string;
  };
}
