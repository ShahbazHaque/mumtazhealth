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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          created_at: string | null
          id: string
          notes: string | null
          service_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string | null
          id?: string
          notes?: string | null
          service_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          service_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      condition_symptom_tracking: {
        Row: {
          condition_type: string
          created_at: string
          entry_date: string
          id: string
          notes: string | null
          pain_level: number | null
          symptoms: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          condition_type: string
          created_at?: string
          entry_date: string
          id?: string
          notes?: string | null
          pain_level?: number | null
          symptoms?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          condition_type?: string
          created_at?: string
          entry_date?: string
          id?: string
          notes?: string | null
          pain_level?: number | null
          symptoms?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_practice_reminders: {
        Row: {
          content_id: string
          created_at: string
          days_of_week: number[]
          id: string
          is_active: boolean
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          reminder_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_practice_reminders_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "wellness_content"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_recommendations: {
        Row: {
          content_ids: string[]
          created_at: string | null
          cycle_phase: string | null
          id: string
          pregnancy_status: string | null
          recommendation_date: string
          user_id: string
        }
        Insert: {
          content_ids: string[]
          created_at?: string | null
          cycle_phase?: string | null
          id?: string
          pregnancy_status?: string | null
          recommendation_date: string
          user_id: string
        }
        Update: {
          content_ids?: string[]
          created_at?: string | null
          cycle_phase?: string | null
          id?: string
          pregnancy_status?: string | null
          recommendation_date?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          evening_reminder: boolean
          evening_time: string
          id: string
          morning_reminder: boolean
          morning_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          evening_reminder?: boolean
          evening_time?: string
          id?: string
          morning_reminder?: boolean
          morning_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          evening_reminder?: boolean
          evening_time?: string
          id?: string
          morning_reminder?: boolean
          morning_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_checkin_logs: {
        Row: {
          created_at: string
          feeling_id: string
          feeling_label: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feeling_id: string
          feeling_label: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feeling_id?: string
          feeling_label?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          created_at: string | null
          currency: string | null
          description: string
          duration_days: number | null
          duration_hours: number | null
          id: string
          is_active: boolean | null
          max_capacity: number | null
          price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          currency?: string | null
          description: string
          duration_days?: number | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          price: number
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          currency?: string | null
          description?: string
          duration_days?: number | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_content_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          content_id: string
          created_at: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          content_id: string
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          content_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "wellness_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_feelings: {
        Row: {
          created_at: string
          feeling_id: string
          feeling_label: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feeling_id: string
          feeling_label: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feeling_id?: string
          feeling_label?: string
          id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_saved_content: {
        Row: {
          content_id: string
          id: string
          notes: string | null
          saved_at: string | null
          user_id: string
        }
        Insert: {
          content_id: string
          id?: string
          notes?: string | null
          saved_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string
          id?: string
          notes?: string | null
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_content_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "wellness_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wellness_profiles: {
        Row: {
          conception_date: string | null
          created_at: string | null
          current_trimester: number | null
          dietary_restrictions: Json | null
          dosha_assessment_date: string | null
          due_date: string | null
          id: string
          life_stage: string | null
          onboarding_completed: boolean | null
          preferred_yoga_style: string | null
          pregnancy_status: string | null
          primary_dosha: string | null
          secondary_dosha: string | null
          spiritual_preference: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conception_date?: string | null
          created_at?: string | null
          current_trimester?: number | null
          dietary_restrictions?: Json | null
          dosha_assessment_date?: string | null
          due_date?: string | null
          id?: string
          life_stage?: string | null
          onboarding_completed?: boolean | null
          preferred_yoga_style?: string | null
          pregnancy_status?: string | null
          primary_dosha?: string | null
          secondary_dosha?: string | null
          spiritual_preference?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conception_date?: string | null
          created_at?: string | null
          current_trimester?: number | null
          dietary_restrictions?: Json | null
          dosha_assessment_date?: string | null
          due_date?: string | null
          id?: string
          life_stage?: string | null
          onboarding_completed?: boolean | null
          preferred_yoga_style?: string | null
          pregnancy_status?: string | null
          primary_dosha?: string | null
          secondary_dosha?: string | null
          spiritual_preference?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wellness_content: {
        Row: {
          audio_url: string | null
          benefits: string[] | null
          content_type: string
          created_at: string | null
          cycle_phases: string[] | null
          description: string | null
          detailed_guidance: string | null
          difficulty_level: string | null
          doshas: string[] | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_premium: boolean | null
          pregnancy_statuses: string[] | null
          pregnancy_trimesters: number[] | null
          preview_content: string | null
          spiritual_path: string | null
          tags: string[] | null
          tier_requirement: string | null
          title: string
          unlock_after_completions: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          benefits?: string[] | null
          content_type: string
          created_at?: string | null
          cycle_phases?: string[] | null
          description?: string | null
          detailed_guidance?: string | null
          difficulty_level?: string | null
          doshas?: string[] | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_premium?: boolean | null
          pregnancy_statuses?: string[] | null
          pregnancy_trimesters?: number[] | null
          preview_content?: string | null
          spiritual_path?: string | null
          tags?: string[] | null
          tier_requirement?: string | null
          title: string
          unlock_after_completions?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          benefits?: string[] | null
          content_type?: string
          created_at?: string | null
          cycle_phases?: string[] | null
          description?: string | null
          detailed_guidance?: string | null
          difficulty_level?: string | null
          doshas?: string[] | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_premium?: boolean | null
          pregnancy_statuses?: string[] | null
          pregnancy_trimesters?: number[] | null
          preview_content?: string | null
          spiritual_path?: string | null
          tags?: string[] | null
          tier_requirement?: string | null
          title?: string
          unlock_after_completions?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      wellness_entries: {
        Row: {
          created_at: string
          cycle_phase: string | null
          daily_practices: Json | null
          emotional_score: number | null
          emotional_state: string | null
          entry_date: string
          id: string
          menopause_tracking: Json | null
          monthly_reflection: string | null
          nutrition_log: Json | null
          pain_level: number | null
          physical_symptoms: string | null
          postpartum_tracking: Json | null
          pregnancy_tracking: Json | null
          spiritual_anchor: string | null
          spiritual_practices: Json | null
          trimester: number | null
          tweak_plan: string | null
          updated_at: string
          user_id: string
          vata_crash: string | null
          yoga_practice: Json | null
        }
        Insert: {
          created_at?: string
          cycle_phase?: string | null
          daily_practices?: Json | null
          emotional_score?: number | null
          emotional_state?: string | null
          entry_date: string
          id?: string
          menopause_tracking?: Json | null
          monthly_reflection?: string | null
          nutrition_log?: Json | null
          pain_level?: number | null
          physical_symptoms?: string | null
          postpartum_tracking?: Json | null
          pregnancy_tracking?: Json | null
          spiritual_anchor?: string | null
          spiritual_practices?: Json | null
          trimester?: number | null
          tweak_plan?: string | null
          updated_at?: string
          user_id: string
          vata_crash?: string | null
          yoga_practice?: Json | null
        }
        Update: {
          created_at?: string
          cycle_phase?: string | null
          daily_practices?: Json | null
          emotional_score?: number | null
          emotional_state?: string | null
          entry_date?: string
          id?: string
          menopause_tracking?: Json | null
          monthly_reflection?: string | null
          nutrition_log?: Json | null
          pain_level?: number | null
          physical_symptoms?: string | null
          postpartum_tracking?: Json | null
          pregnancy_tracking?: Json | null
          spiritual_anchor?: string | null
          spiritual_practices?: Json | null
          trimester?: number | null
          tweak_plan?: string | null
          updated_at?: string
          user_id?: string
          vata_crash?: string | null
          yoga_practice?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
      app_role: ["user", "admin"],
    },
  },
} as const
