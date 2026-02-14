export interface Hospede {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cidade: string;
  created_at: string;
}

export interface NovoHospede {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cidade: string;
}
