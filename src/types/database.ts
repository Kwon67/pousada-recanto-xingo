export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      reserva_rate_limit_attempts: {
        Row: {
          id: string
          key_type: string
          key_value: string
          created_at: string
        }
        Insert: {
          id?: string
          key_type: string
          key_value: string
          created_at?: string
        }
        Update: {
          id?: string
          key_type?: string
          key_value?: string
          created_at?: string
        }
        Relationships: []
      }
      admin_access_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip: string | null
          path: string | null
          user_agent: string | null
          username: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip?: string | null
          path?: string | null
          user_agent?: string | null
          username: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip?: string | null
          path?: string | null
          user_agent?: string | null
          username?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          aprovada: boolean | null
          comentario: string | null
          created_at: string | null
          hospede_id: string | null
          id: string
          nota: number | null
          quarto_id: string | null
        }
        Insert: {
          aprovada?: boolean | null
          comentario?: string | null
          created_at?: string | null
          hospede_id?: string | null
          id?: string
          nota?: number | null
          quarto_id?: string | null
        }
        Update: {
          aprovada?: boolean | null
          comentario?: string | null
          created_at?: string | null
          hospede_id?: string | null
          id?: string
          nota?: number | null
          quarto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_hospede_id_fkey"
            columns: ["hospede_id"]
            isOneToOne: false
            referencedRelation: "hospedes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          booking_url: string | null
          cta_preco_noite: string | null
          descricao: string | null
          email: string | null
          email_conta: string | null
          email_notificacoes: boolean | null
          endereco: string | null
          facebook: string | null
          google_analytics: string | null
          horario_checkin: string | null
          horario_checkout: string | null
          id: string
          instagram: string | null
          latitude: number | null
          longitude: number | null
          meta_pixel: string | null
          nome_pousada: string | null
          nova_reserva_push: boolean | null
          telefone: string | null
          whatsapp_notificacoes: boolean | null
        }
        Insert: {
          booking_url?: string | null
          cta_preco_noite?: string | null
          descricao?: string | null
          email?: string | null
          email_conta?: string | null
          email_notificacoes?: boolean | null
          endereco?: string | null
          facebook?: string | null
          google_analytics?: string | null
          horario_checkin?: string | null
          horario_checkout?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          meta_pixel?: string | null
          nome_pousada?: string | null
          nova_reserva_push?: boolean | null
          telefone?: string | null
          whatsapp_notificacoes?: boolean | null
        }
        Update: {
          booking_url?: string | null
          cta_preco_noite?: string | null
          descricao?: string | null
          email?: string | null
          email_conta?: string | null
          email_notificacoes?: boolean | null
          endereco?: string | null
          facebook?: string | null
          google_analytics?: string | null
          horario_checkin?: string | null
          horario_checkout?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          meta_pixel?: string | null
          nome_pousada?: string | null
          nova_reserva_push?: boolean | null
          telefone?: string | null
          whatsapp_notificacoes?: boolean | null
        }
        Relationships: []
      }
      conteudo_site: {
        Row: {
          categoria: string | null
          chave: string
          id: string
          updated_at: string | null
          valor: string | null
        }
        Insert: {
          categoria?: string | null
          chave: string
          id?: string
          updated_at?: string | null
          valor?: string | null
        }
        Update: {
          categoria?: string | null
          chave?: string
          id?: string
          updated_at?: string | null
          valor?: string | null
        }
        Relationships: []
      }
      galeria: {
        Row: {
          alt: string | null
          categoria: string | null
          created_at: string | null
          destaque: boolean | null
          id: string
          ordem: number | null
          url: string
        }
        Insert: {
          alt?: string | null
          categoria?: string | null
          created_at?: string | null
          destaque?: boolean | null
          id?: string
          ordem?: number | null
          url: string
        }
        Update: {
          alt?: string | null
          categoria?: string | null
          created_at?: string | null
          destaque?: boolean | null
          id?: string
          ordem?: number | null
          url?: string
        }
        Relationships: []
      }
      hospedes: {
        Row: {
          cidade: string | null
          cpf: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      quartos: {
        Row: {
          amenidades: string[] | null
          ativo: boolean | null
          capacidade: number | null
          categoria: Database["public"]["Enums"]["categoria_quarto"] | null
          created_at: string | null
          descricao: string | null
          descricao_curta: string | null
          destaque: boolean | null
          id: string
          imagem_principal: string | null
          imagens: string[] | null
          nome: string
          ordem: number | null
          preco_diaria: number
          preco_fds: number | null
          slug: string
          tamanho_m2: number | null
          updated_at: string | null
        }
        Insert: {
          amenidades?: string[] | null
          ativo?: boolean | null
          capacidade?: number | null
          categoria?: Database["public"]["Enums"]["categoria_quarto"] | null
          created_at?: string | null
          descricao?: string | null
          descricao_curta?: string | null
          destaque?: boolean | null
          id?: string
          imagem_principal?: string | null
          imagens?: string[] | null
          nome: string
          ordem?: number | null
          preco_diaria: number
          preco_fds?: number | null
          slug: string
          tamanho_m2?: number | null
          updated_at?: string | null
        }
        Update: {
          amenidades?: string[] | null
          ativo?: boolean | null
          capacidade?: number | null
          categoria?: Database["public"]["Enums"]["categoria_quarto"] | null
          created_at?: string | null
          descricao?: string | null
          descricao_curta?: string | null
          destaque?: boolean | null
          id?: string
          imagem_principal?: string | null
          imagens?: string[] | null
          nome?: string
          ordem?: number | null
          preco_diaria?: number
          preco_fds?: number | null
          slug?: string
          tamanho_m2?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservas: {
        Row: {
          check_in: string
          check_out: string
          created_at: string | null
          hospede_id: string | null
          id: string
          num_hospedes: number | null
          observacoes: string | null
          payment_approved_at: string | null
          pixel_disparado: boolean | null
          quarto_id: string | null
          status: Database["public"]["Enums"]["status_reserva"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_method: string | null
          stripe_payment_status: string
          stripe_session_id: string | null
          valor_pago: number | null
          valor_total: number
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string | null
          hospede_id?: string | null
          id?: string
          num_hospedes?: number | null
          observacoes?: string | null
          payment_approved_at?: string | null
          pixel_disparado?: boolean | null
          quarto_id?: string | null
          status?: Database["public"]["Enums"]["status_reserva"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_method?: string | null
          stripe_payment_status?: string
          stripe_session_id?: string | null
          valor_pago?: number | null
          valor_total: number
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string | null
          hospede_id?: string | null
          id?: string
          num_hospedes?: number | null
          observacoes?: string | null
          payment_approved_at?: string | null
          pixel_disparado?: boolean | null
          quarto_id?: string | null
          status?: Database["public"]["Enums"]["status_reserva"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_method?: string | null
          stripe_payment_status?: string
          stripe_session_id?: string | null
          valor_pago?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_hospede_id_fkey"
            columns: ["hospede_id"]
            isOneToOne: false
            referencedRelation: "hospedes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      categoria_quarto: "standard" | "superior" | "suite"
      status_reserva:
        | "pendente"
        | "confirmada"
        | "cancelada"
        | "concluida"
        | "aguardando_pagamento"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_quarto: ["standard", "superior", "suite"],
      status_reserva: [
        "pendente",
        "confirmada",
        "cancelada",
        "concluida",
        "aguardando_pagamento",
      ],
    },
  },
} as const

export interface Configuracoes {
  id: string;
  nome_pousada: string;
  descricao: string;
  cta_preco_noite?: string;
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
