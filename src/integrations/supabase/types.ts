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
      analytics_events: {
        Row: {
          created_at: string
          event_category: string | null
          event_data: Json | null
          event_type: string
          id: string
          lead_id: string | null
          profile_id: string | null
          referrer: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          event_category?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          lead_id?: string | null
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          lead_id?: string | null
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_types: {
        Row: {
          buffer_after_minutes: number
          buffer_before_minutes: number
          code: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          max_days_advance: number
          max_per_day: number | null
          min_hours_advance: number
          name: string
          price_clp: number | null
          requires_professional_ids: string[] | null
          updated_at: string
        }
        Insert: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          code: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_days_advance?: number
          max_per_day?: number | null
          min_hours_advance?: number
          name: string
          price_clp?: number | null
          requires_professional_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          code?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_days_advance?: number
          max_per_day?: number | null
          min_hours_advance?: number
          name?: string
          price_clp?: number | null
          requires_professional_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type_id: string | null
          confirmation_sent: boolean | null
          created_at: string
          dentalink_appointment_id: string | null
          dentalink_patient_id: string | null
          dentalink_professional_id: string | null
          duration_minutes: number
          id: string
          lead_id: string | null
          reminder_sent: boolean | null
          scheduled_date: string
          scheduled_time: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          appointment_type_id?: string | null
          confirmation_sent?: boolean | null
          created_at?: string
          dentalink_appointment_id?: string | null
          dentalink_patient_id?: string | null
          dentalink_professional_id?: string | null
          duration_minutes: number
          id?: string
          lead_id?: string | null
          reminder_sent?: boolean | null
          scheduled_date: string
          scheduled_time: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          appointment_type_id?: string | null
          confirmation_sent?: boolean | null
          created_at?: string
          dentalink_appointment_id?: string | null
          dentalink_patient_id?: string | null
          dentalink_professional_id?: string | null
          duration_minutes?: number
          id?: string
          lead_id?: string | null
          reminder_sent?: boolean | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          consent_text: string | null
          consent_type: string
          created_at: string
          id: string
          ip_address: string | null
          lead_id: string | null
          profile_id: string | null
          signature_data: string | null
          user_agent: string | null
          version: string
        }
        Insert: {
          accepted: boolean
          accepted_at?: string | null
          consent_text?: string | null
          consent_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          profile_id?: string | null
          signature_data?: string | null
          user_agent?: string | null
          version?: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          consent_text?: string | null
          consent_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          profile_id?: string | null
          signature_data?: string | null
          user_agent?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_leads: {
        Row: {
          created_at: string
          dentalink_appointment_id: string | null
          dentalink_patient_id: string | null
          email: string
          ia_scan_completed_at: string | null
          ia_scan_result: Json | null
          id: string
          name: string
          origin: string | null
          phone: string
          reason: string | null
          rut: string | null
          scheduled_at: string | null
          scheduling_preferences: Json | null
          status: Database["public"]["Enums"]["funnel_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dentalink_appointment_id?: string | null
          dentalink_patient_id?: string | null
          email: string
          ia_scan_completed_at?: string | null
          ia_scan_result?: Json | null
          id?: string
          name: string
          origin?: string | null
          phone: string
          reason?: string | null
          rut?: string | null
          scheduled_at?: string | null
          scheduling_preferences?: Json | null
          status?: Database["public"]["Enums"]["funnel_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dentalink_appointment_id?: string | null
          dentalink_patient_id?: string | null
          email?: string
          ia_scan_completed_at?: string | null
          ia_scan_result?: Json | null
          id?: string
          name?: string
          origin?: string | null
          phone?: string
          reason?: string | null
          rut?: string | null
          scheduled_at?: string | null
          scheduling_preferences?: Json | null
          status?: Database["public"]["Enums"]["funnel_status"]
          updated_at?: string
        }
        Relationships: []
      }
      funnel_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string
          id: string
          lead_id: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          mercadopago_response: Json | null
          mercadopago_status: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          lead_id: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          mercadopago_response?: Json | null
          mercadopago_status?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          lead_id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          mercadopago_response?: Json | null
          mercadopago_status?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_payments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_status_history: {
        Row: {
          changed_at: string
          from_status: Database["public"]["Enums"]["funnel_status"] | null
          id: string
          lead_id: string
          metadata: Json | null
          to_status: Database["public"]["Enums"]["funnel_status"]
        }
        Insert: {
          changed_at?: string
          from_status?: Database["public"]["Enums"]["funnel_status"] | null
          id?: string
          lead_id: string
          metadata?: Json | null
          to_status: Database["public"]["Enums"]["funnel_status"]
        }
        Update: {
          changed_at?: string
          from_status?: Database["public"]["Enums"]["funnel_status"] | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          to_status?: Database["public"]["Enums"]["funnel_status"]
        }
        Relationships: [
          {
            foreignKeyName: "funnel_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          lead_id: string
          metadata: Json | null
          mime_type: string | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          lead_id: string
          metadata?: Json | null
          mime_type?: string | null
          storage_path: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          mime_type?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_uploads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          channel: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          external_message_id: string | null
          id: string
          lead_id: string | null
          message_content: string | null
          profile_id: string | null
          recipient_email: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string
          template_name: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          lead_id?: string | null
          message_content?: string | null
          profile_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          template_name?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          lead_id?: string | null
          message_content?: string | null
          profile_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_scheduling_preferences: {
        Row: {
          avoid_dates: string[] | null
          created_at: string
          id: string
          lead_id: string | null
          notes: string | null
          preferred_days: string[] | null
          preferred_time_range: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avoid_dates?: string[] | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          preferred_days?: string[] | null
          preferred_time_range?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avoid_dates?: string[] | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          preferred_days?: string[] | null
          preferred_time_range?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_scheduling_preferences_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          dentalink_patient_id: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          phone_verified: boolean | null
          region: string | null
          rut: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          dentalink_patient_id?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          region?: string | null
          rut?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          dentalink_patient_id?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          region?: string | null
          rut?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      second_opinions: {
        Row: {
          budget_document_path: string | null
          converted_to_evaluation: boolean | null
          created_at: string
          current_diagnosis: string | null
          email: string
          external_budget_amount: number | null
          external_clinic_name: string | null
          flow_type: string
          has_rx: boolean | null
          ia_completed_at: string | null
          ia_report: Json | null
          id: string
          lead_id: string | null
          name: string
          payment_id: string | null
          payment_status: string | null
          phone: string
          profile_id: string | null
          reason: string
          rx_storage_paths: string[] | null
          specialist_id: string | null
          status: string
          updated_at: string
          videocall_completed: boolean | null
          videocall_scheduled_at: string | null
          videocall_url: string | null
        }
        Insert: {
          budget_document_path?: string | null
          converted_to_evaluation?: boolean | null
          created_at?: string
          current_diagnosis?: string | null
          email: string
          external_budget_amount?: number | null
          external_clinic_name?: string | null
          flow_type?: string
          has_rx?: boolean | null
          ia_completed_at?: string | null
          ia_report?: Json | null
          id?: string
          lead_id?: string | null
          name: string
          payment_id?: string | null
          payment_status?: string | null
          phone: string
          profile_id?: string | null
          reason: string
          rx_storage_paths?: string[] | null
          specialist_id?: string | null
          status?: string
          updated_at?: string
          videocall_completed?: boolean | null
          videocall_scheduled_at?: string | null
          videocall_url?: string | null
        }
        Update: {
          budget_document_path?: string | null
          converted_to_evaluation?: boolean | null
          created_at?: string
          current_diagnosis?: string | null
          email?: string
          external_budget_amount?: number | null
          external_clinic_name?: string | null
          flow_type?: string
          has_rx?: boolean | null
          ia_completed_at?: string | null
          ia_report?: Json | null
          id?: string
          lead_id?: string | null
          name?: string
          payment_id?: string | null
          payment_status?: string | null
          phone?: string
          profile_id?: string | null
          reason?: string
          rx_storage_paths?: string[] | null
          specialist_id?: string | null
          status?: string
          updated_at?: string
          videocall_completed?: boolean | null
          videocall_scheduled_at?: string | null
          videocall_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "second_opinions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "second_opinions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          appointment_type_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          lead_id: string | null
          max_wait_days: number | null
          offered_at: string | null
          preferred_dates: string[]
          preferred_time_range: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          appointment_type_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          max_wait_days?: number | null
          offered_at?: string | null
          preferred_dates: string[]
          preferred_time_range?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          appointment_type_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          max_wait_days?: number | null
          offered_at?: string | null
          preferred_dates?: string[]
          preferred_time_range?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
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
      funnel_status:
        | "LEAD"
        | "IA_DONE"
        | "CHECKOUT_CREATED"
        | "PAID"
        | "SCHEDULED"
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "refunded"
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
      funnel_status: [
        "LEAD",
        "IA_DONE",
        "CHECKOUT_CREATED",
        "PAID",
        "SCHEDULED",
      ],
      payment_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
