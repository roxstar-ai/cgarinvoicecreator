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
      customers: {
        Row: {
          additional_line_1_amount: number | null
          additional_line_1_desc: string | null
          additional_line_2_amount: number | null
          additional_line_2_desc: string | null
          additional_line_3_amount: number | null
          additional_line_3_desc: string | null
          address: string | null
          city_state_zip: string | null
          created_at: string | null
          daily_rate: number | null
          daily_rate_days: number | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          middle_name: string | null
          monthly_rate: number
          name: string
          notes: string | null
          phone: string | null
          responsible_first_name: string | null
          responsible_last_name: string | null
          responsible_middle_name: string | null
          updated_at: string | null
        }
        Insert: {
          additional_line_1_amount?: number | null
          additional_line_1_desc?: string | null
          additional_line_2_amount?: number | null
          additional_line_2_desc?: string | null
          additional_line_3_amount?: number | null
          additional_line_3_desc?: string | null
          address?: string | null
          city_state_zip?: string | null
          created_at?: string | null
          daily_rate?: number | null
          daily_rate_days?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          middle_name?: string | null
          monthly_rate?: number
          name: string
          notes?: string | null
          phone?: string | null
          responsible_first_name?: string | null
          responsible_last_name?: string | null
          responsible_middle_name?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_line_1_amount?: number | null
          additional_line_1_desc?: string | null
          additional_line_2_amount?: number | null
          additional_line_2_desc?: string | null
          additional_line_3_amount?: number | null
          additional_line_3_desc?: string | null
          address?: string | null
          city_state_zip?: string | null
          created_at?: string | null
          daily_rate?: number | null
          daily_rate_days?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          middle_name?: string | null
          monthly_rate?: number
          name?: string
          notes?: string | null
          phone?: string | null
          responsible_first_name?: string | null
          responsible_last_name?: string | null
          responsible_middle_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facility_settings: {
        Row: {
          address: string
          city_state_zip: string
          created_at: string | null
          email: string | null
          fax: string | null
          id: string
          name: string
          phone: string | null
          thank_you_note: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          city_state_zip: string
          created_at?: string | null
          email?: string | null
          fax?: string | null
          id?: string
          name: string
          phone?: string | null
          thank_you_note?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          city_state_zip?: string
          created_at?: string | null
          email?: string | null
          fax?: string | null
          id?: string
          name?: string
          phone?: string | null
          thank_you_note?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      invoice_number_sequence: {
        Row: {
          last_number: number
          year: number
        }
        Insert: {
          last_number?: number
          year: number
        }
        Update: {
          last_number?: number
          year?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_city_state_zip: string | null
          customer_id: string
          customer_name: string
          daily_rate: number | null
          daily_rate_days: number | null
          daily_rate_total: number | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          line_1_amount: number | null
          line_1_desc: string | null
          line_2_amount: number | null
          line_2_desc: string | null
          line_3_amount: number | null
          line_3_desc: string | null
          monthly_rate: number
          notes: string | null
          service_month: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_city_state_zip?: string | null
          customer_id: string
          customer_name: string
          daily_rate?: number | null
          daily_rate_days?: number | null
          daily_rate_total?: number | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          line_1_amount?: number | null
          line_1_desc?: string | null
          line_2_amount?: number | null
          line_2_desc?: string | null
          line_3_amount?: number | null
          line_3_desc?: string | null
          monthly_rate?: number
          notes?: string | null
          service_month: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_city_state_zip?: string | null
          customer_id?: string
          customer_name?: string
          daily_rate?: number | null
          daily_rate_days?: number | null
          daily_rate_total?: number | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          line_1_amount?: number | null
          line_1_desc?: string | null
          line_2_amount?: number | null
          line_2_desc?: string | null
          line_3_amount?: number | null
          line_3_desc?: string | null
          monthly_rate?: number
          notes?: string | null
          service_month?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: { p_year: number }; Returns: string }
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
