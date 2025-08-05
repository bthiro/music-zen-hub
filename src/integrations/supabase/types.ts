export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          instrumento: string | null
          nivel: string | null
          nome: string
          observacoes: string | null
          professor_id: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          instrumento?: string | null
          nivel?: string | null
          nome: string
          observacoes?: string | null
          professor_id: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          instrumento?: string | null
          nivel?: string | null
          nome?: string
          observacoes?: string | null
          professor_id?: string
          telefone?: string | null
          updated_at?: string
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
      aulas: {
        Row: {
          aluno_id: string
          created_at: string
          data_hora: string
          feedback: string | null
          id: string
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
          feedback?: string | null
          id?: string
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
          feedback?: string | null
          id?: string
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
          forma_pagamento: string | null
          id: string
          link_pagamento: string | null
          professor_id: string
          referencia_externa: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          aluno_id: string
          aula_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          forma_pagamento?: string | null
          id?: string
          link_pagamento?: string | null
          professor_id: string
          referencia_externa?: string | null
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          aluno_id?: string
          aula_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          forma_pagamento?: string | null
          id?: string
          link_pagamento?: string | null
          professor_id?: string
          referencia_externa?: string | null
          status?: string
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
      professores: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          especialidades: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          especialidades?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          especialidades?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
