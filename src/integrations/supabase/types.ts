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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_mercado_pago_config: {
        Row: {
          access_token: string
          created_at: string | null
          created_by: string | null
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          data_nascimento: string | null
          endereco: string | null
          id: string
          nome: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          data_nascimento?: string | null
          endereco?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          data_nascimento?: string | null
          endereco?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      alunos: {
        Row: {
          ativo: boolean
          created_at: string
          data_nascimento: string | null
          dia_vencimento: number | null
          duracao_aula: number | null
          email: string | null
          endereco: string | null
          id: string
          instrumento: string | null
          nivel: string | null
          nome: string
          observacoes: string | null
          professor_id: string
          responsavel_nome: string | null
          responsavel_telefone: string | null
          suspended_at: string | null
          suspended_reason: string | null
          telefone: string | null
          tipo_cobranca: string | null
          updated_at: string
          valor_mensalidade: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_nascimento?: string | null
          dia_vencimento?: number | null
          duracao_aula?: number | null
          email?: string | null
          endereco?: string | null
          id?: string
          instrumento?: string | null
          nivel?: string | null
          nome: string
          observacoes?: string | null
          professor_id: string
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          telefone?: string | null
          tipo_cobranca?: string | null
          updated_at?: string
          valor_mensalidade?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_nascimento?: string | null
          dia_vencimento?: number | null
          duracao_aula?: number | null
          email?: string | null
          endereco?: string | null
          id?: string
          instrumento?: string | null
          nivel?: string | null
          nome?: string
          observacoes?: string | null
          professor_id?: string
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          telefone?: string | null
          tipo_cobranca?: string | null
          updated_at?: string
          valor_mensalidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alunos_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string | null
          entity: string
          entity_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      aulas: {
        Row: {
          aluno_id: string
          created_at: string
          data_hora: string
          duracao_minutos: number | null
          feedback: string | null
          google_event_id: string | null
          id: string
          link_meet: string | null
          materiais: Json | null
          meet_id: string | null
          meet_link: string | null
          presenca: boolean | null
          professor_id: string
          status: string | null
          tema: string | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_hora: string
          duracao_minutos?: number | null
          feedback?: string | null
          google_event_id?: string | null
          id?: string
          link_meet?: string | null
          materiais?: Json | null
          meet_id?: string | null
          meet_link?: string | null
          presenca?: boolean | null
          professor_id: string
          status?: string | null
          tema?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_hora?: string
          duracao_minutos?: number | null
          feedback?: string | null
          google_event_id?: string | null
          id?: string
          link_meet?: string | null
          materiais?: Json | null
          meet_id?: string | null
          meet_link?: string | null
          presenca?: boolean | null
          professor_id?: string
          status?: string | null
          tema?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      cobrancas_professor: {
        Row: {
          competencia: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          forma_pagamento: string | null
          id: string
          link_pagamento: string | null
          manual_payment_at: string | null
          manual_payment_by: string | null
          manual_payment_reason: string | null
          mercado_pago_payment_id: string | null
          mercado_pago_status: string | null
          payment_precedence: string | null
          plano_nome: string | null
          professor_id: string
          referencia_externa: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          competencia: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          link_pagamento?: string | null
          manual_payment_at?: string | null
          manual_payment_by?: string | null
          manual_payment_reason?: string | null
          mercado_pago_payment_id?: string | null
          mercado_pago_status?: string | null
          payment_precedence?: string | null
          plano_nome?: string | null
          professor_id: string
          referencia_externa?: string | null
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          competencia?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          link_pagamento?: string | null
          manual_payment_at?: string | null
          manual_payment_by?: string | null
          manual_payment_reason?: string | null
          mercado_pago_payment_id?: string | null
          mercado_pago_status?: string | null
          payment_precedence?: string | null
          plano_nome?: string | null
          professor_id?: string
          referencia_externa?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_cobrancas_professor_professores"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          chave_pix: string | null
          created_at: string
          fuso_horario: string | null
          id: string
          link_pagamento: string | null
          mensagem_cobranca: string | null
          notificacoes_push: boolean | null
          professor_id: string
          updated_at: string
        }
        Insert: {
          chave_pix?: string | null
          created_at?: string
          fuso_horario?: string | null
          id?: string
          link_pagamento?: string | null
          mensagem_cobranca?: string | null
          notificacoes_push?: boolean | null
          professor_id: string
          updated_at?: string
        }
        Update: {
          chave_pix?: string | null
          created_at?: string
          fuso_horario?: string | null
          id?: string
          link_pagamento?: string | null
          mensagem_cobranca?: string | null
          notificacoes_push?: boolean | null
          professor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes_professor: {
        Row: {
          billing_message: string | null
          created_at: string | null
          id: string
          payment_link: string | null
          pix_key: string | null
          professor_id: string
          push_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          billing_message?: string | null
          created_at?: string | null
          id?: string
          payment_link?: string | null
          pix_key?: string | null
          professor_id: string
          push_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_message?: string | null
          created_at?: string | null
          id?: string
          payment_link?: string | null
          pix_key?: string | null
          professor_id?: string
          push_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_professor_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: true
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_metrics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          professor_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          professor_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          professor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversion_metrics_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          config_data: Json | null
          created_at: string
          id: string
          integration_name: string
          last_test: string | null
          professor_id: string
          status: string
          updated_at: string
        }
        Insert: {
          config_data?: Json | null
          created_at?: string
          id?: string
          integration_name: string
          last_test?: string | null
          professor_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          config_data?: Json | null
          created_at?: string
          id?: string
          integration_name?: string
          last_test?: string | null
          professor_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      mensagens_enviadas: {
        Row: {
          aluno_id: string
          conteudo: string
          data_envio: string
          id: string
          professor_id: string
          referencia_externa: string | null
          status: string
          tipo_mensagem: string
        }
        Insert: {
          aluno_id: string
          conteudo: string
          data_envio?: string
          id?: string
          professor_id: string
          referencia_externa?: string | null
          status?: string
          tipo_mensagem: string
        }
        Update: {
          aluno_id?: string
          conteudo?: string
          data_envio?: string
          id?: string
          professor_id?: string
          referencia_externa?: string | null
          status?: string
          tipo_mensagem?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_enviadas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_enviadas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          aluno_id: string
          aula_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          eligible_to_schedule: boolean | null
          forma_pagamento: string | null
          id: string
          link_pagamento: string | null
          manual_payment_at: string | null
          manual_payment_by: string | null
          manual_payment_reason: string | null
          mercado_pago_payment_id: string | null
          mercado_pago_status: string | null
          payment_precedence: string | null
          professor_id: string
          referencia_externa: string | null
          status: string
          tipo_pagamento: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          aluno_id: string
          aula_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          eligible_to_schedule?: boolean | null
          forma_pagamento?: string | null
          id?: string
          link_pagamento?: string | null
          manual_payment_at?: string | null
          manual_payment_by?: string | null
          manual_payment_reason?: string | null
          mercado_pago_payment_id?: string | null
          mercado_pago_status?: string | null
          payment_precedence?: string | null
          professor_id: string
          referencia_externa?: string | null
          status?: string
          tipo_pagamento?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          aluno_id?: string
          aula_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          eligible_to_schedule?: boolean | null
          forma_pagamento?: string | null
          id?: string
          link_pagamento?: string | null
          manual_payment_at?: string | null
          manual_payment_by?: string | null
          manual_payment_reason?: string | null
          mercado_pago_payment_id?: string | null
          mercado_pago_status?: string | null
          payment_precedence?: string | null
          professor_id?: string
          referencia_externa?: string | null
          status?: string
          tipo_pagamento?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_professor: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          limite_alunos: number | null
          nome: string
          preco_mensal: number
          recursos: Json | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          limite_alunos?: number | null
          nome: string
          preco_mensal: number
          recursos?: Json | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          limite_alunos?: number | null
          nome?: string
          preco_mensal?: number
          recursos?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      professores: {
        Row: {
          avatar_url: string | null
          billing_text: string | null
          bio: string | null
          config_calendario: Json | null
          config_notificacoes: Json | null
          created_at: string
          criado_por: string | null
          data_expiracao: string | null
          data_nascimento: string | null
          email: string
          endereco: string | null
          especialidades: string | null
          grace_period_until: string | null
          id: string
          limite_alunos: number | null
          manual_plan_override: boolean | null
          modules: Json
          nome: string
          payment_preference: Json | null
          pix_key: string | null
          plan_changed_at: string | null
          plan_changed_by: string | null
          plano: string | null
          senha_temporaria: boolean | null
          status: string | null
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          billing_text?: string | null
          bio?: string | null
          config_calendario?: Json | null
          config_notificacoes?: Json | null
          created_at?: string
          criado_por?: string | null
          data_expiracao?: string | null
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          especialidades?: string | null
          grace_period_until?: string | null
          id?: string
          limite_alunos?: number | null
          manual_plan_override?: boolean | null
          modules?: Json
          nome: string
          payment_preference?: Json | null
          pix_key?: string | null
          plan_changed_at?: string | null
          plan_changed_by?: string | null
          plano?: string | null
          senha_temporaria?: boolean | null
          status?: string | null
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          billing_text?: string | null
          bio?: string | null
          config_calendario?: Json | null
          config_notificacoes?: Json | null
          created_at?: string
          criado_por?: string | null
          data_expiracao?: string | null
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          especialidades?: string | null
          grace_period_until?: string | null
          id?: string
          limite_alunos?: number | null
          manual_plan_override?: boolean | null
          modules?: Json
          nome?: string
          payment_preference?: Json | null
          pix_key?: string | null
          plan_changed_at?: string | null
          plan_changed_by?: string | null
          plano?: string | null
          senha_temporaria?: boolean | null
          status?: string | null
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          id: string
          id_evento: string
          payload: Json
          processed_at: string | null
          received_at: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_evento: string
          payload: Json
          processed_at?: string | null
          received_at?: string
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          id_evento?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          tipo?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_cobranca_professor_mensal: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      criar_pagamento_mensal: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_audit: {
        Args: {
          p_action: string
          p_entity: string
          p_entity_id?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "professor"
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
      app_role: ["admin", "teacher", "professor"],
    },
  },
} as const
