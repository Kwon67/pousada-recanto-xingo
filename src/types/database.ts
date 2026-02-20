export interface Configuracoes {
  id: string;
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
  latitude?: number;
  longitude?: number;
  horario_checkin: string;
  horario_checkout: string;
  whatsapp_notificacoes?: boolean;
  email_notificacoes?: boolean;
  nova_reserva_push?: boolean;
}

export type Database = {
  public: {
    Tables: {
      quartos: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          descricao: string | null;
          descricao_curta: string | null;
          categoria: 'standard' | 'superior' | 'suite';
          preco_diaria: number;
          preco_fds: number | null;
          capacidade: number;
          tamanho_m2: number | null;
          amenidades: string[];
          imagens: string[];
          imagem_principal: string | null;
          ativo: boolean;
          destaque: boolean;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          descricao?: string | null;
          descricao_curta?: string | null;
          categoria?: 'standard' | 'superior' | 'suite';
          preco_diaria: number;
          preco_fds?: number | null;
          capacidade?: number;
          tamanho_m2?: number | null;
          amenidades?: string[];
          imagens?: string[];
          imagem_principal?: string | null;
          ativo?: boolean;
          destaque?: boolean;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          descricao?: string | null;
          descricao_curta?: string | null;
          categoria?: 'standard' | 'superior' | 'suite';
          preco_diaria?: number;
          preco_fds?: number | null;
          capacidade?: number;
          tamanho_m2?: number | null;
          amenidades?: string[];
          imagens?: string[];
          imagem_principal?: string | null;
          ativo?: boolean;
          destaque?: boolean;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hospedes: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          cpf: string | null;
          cidade: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone?: string | null;
          cpf?: string | null;
          cidade?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          cpf?: string | null;
          cidade?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reservas: {
        Row: {
          id: string;
          quarto_id: string | null;
          hospede_id: string | null;
          check_in: string;
          check_out: string;
          num_hospedes: number;
          valor_total: number;
          status: 'pendente' | 'aguardando_pagamento' | 'confirmada' | 'cancelada' | 'concluida';
          observacoes: string | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_payment_status:
            | 'nao_iniciado'
            | 'pendente'
            | 'pago'
            | 'falhou'
            | 'cancelado'
            | 'expirado';
          stripe_payment_method: string | null;
          payment_approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quarto_id?: string | null;
          hospede_id?: string | null;
          check_in: string;
          check_out: string;
          num_hospedes?: number;
          valor_total: number;
          status?: 'pendente' | 'aguardando_pagamento' | 'confirmada' | 'cancelada' | 'concluida';
          observacoes?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_payment_status?:
            | 'nao_iniciado'
            | 'pendente'
            | 'pago'
            | 'falhou'
            | 'cancelado'
            | 'expirado';
          stripe_payment_method?: string | null;
          payment_approved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          quarto_id?: string | null;
          hospede_id?: string | null;
          check_in?: string;
          check_out?: string;
          num_hospedes?: number;
          valor_total?: number;
          status?: 'pendente' | 'aguardando_pagamento' | 'confirmada' | 'cancelada' | 'concluida';
          observacoes?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_payment_status?:
            | 'nao_iniciado'
            | 'pendente'
            | 'pago'
            | 'falhou'
            | 'cancelado'
            | 'expirado';
          stripe_payment_method?: string | null;
          payment_approved_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      avaliacoes: {
        Row: {
          id: string;
          hospede_id: string | null;
          quarto_id: string | null;
          nota: number;
          comentario: string | null;
          aprovada: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          hospede_id?: string | null;
          quarto_id?: string | null;
          nota: number;
          comentario?: string | null;
          aprovada?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          hospede_id?: string | null;
          quarto_id?: string | null;
          nota?: number;
          comentario?: string | null;
          aprovada?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      configuracoes: {
        Row: {
          id: string;
          nome_pousada: string;
          descricao: string | null;
          endereco: string;
          telefone: string;
          email: string;
          instagram: string | null;
          facebook: string | null;
          booking_url: string | null;
          google_analytics: string | null;
          meta_pixel: string | null;
          email_conta: string | null;
          latitude: number | null;
          longitude: number | null;
          horario_checkin: string;
          horario_checkout: string;
          whatsapp_notificacoes: boolean;
          email_notificacoes: boolean;
          nova_reserva_push: boolean;
        };
        Insert: {
          id?: string;
          nome_pousada: string;
          descricao?: string | null;
          endereco: string;
          telefone: string;
          email: string;
          instagram?: string | null;
          facebook?: string | null;
          booking_url?: string | null;
          google_analytics?: string | null;
          meta_pixel?: string | null;
          email_conta?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          horario_checkin: string;
          horario_checkout: string;
          whatsapp_notificacoes?: boolean;
          email_notificacoes?: boolean;
          nova_reserva_push?: boolean;
        };
        Update: {
          id?: string;
          nome_pousada?: string;
          descricao?: string | null;
          endereco?: string;
          telefone?: string;
          email?: string;
          instagram?: string | null;
          facebook?: string | null;
          booking_url?: string | null;
          google_analytics?: string | null;
          meta_pixel?: string | null;
          email_conta?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          horario_checkin?: string;
          horario_checkout?: string;
          whatsapp_notificacoes?: boolean;
          email_notificacoes?: boolean;
          nova_reserva_push?: boolean;
        };
        Relationships: [];
      };
      conteudo_site: {
        Row: {
          id: string;
          chave: string;
          valor: string | null;
          categoria: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chave: string;
          valor?: string | null;
          categoria?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chave?: string;
          valor?: string | null;
          categoria?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      galeria: {
        Row: {
          id: string;
          url: string;
          alt: string | null;
          categoria: string | null;
          ordem: number;
          destaque: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          alt?: string | null;
          categoria?: string | null;
          ordem?: number;
          destaque?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          alt?: string | null;
          categoria?: string | null;
          ordem?: number;
          destaque?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_access_logs: {
        Row: {
          id: string;
          username: string;
          event_type: 'login' | 'access' | 'login_failed' | 'logout';
          ip: string | null;
          user_agent: string | null;
          path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          event_type: 'login' | 'access' | 'login_failed' | 'logout';
          ip?: string | null;
          user_agent?: string | null;
          path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          event_type?: 'login' | 'access' | 'login_failed' | 'logout';
          ip?: string | null;
          user_agent?: string | null;
          path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      categoria_quarto: 'standard' | 'superior' | 'suite';
      status_reserva: 'pendente' | 'aguardando_pagamento' | 'confirmada' | 'cancelada' | 'concluida';
    };
    CompositeTypes: Record<string, never>;
  };
};
