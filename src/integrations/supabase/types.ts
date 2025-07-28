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
      activities: {
        Row: {
          admin_id: string | null
          created_at: string
          description: string
          fresher_id: string | null
          id: string
          metadata: Json | null
          type: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          description: string
          fresher_id?: string | null
          id?: string
          metadata?: Json | null
          type: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          description?: string
          fresher_id?: string | null
          id?: string
          metadata?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_fresher_id_fkey"
            columns: ["fresher_id"]
            isOneToOne: false
            referencedRelation: "freshers"
            referencedColumns: ["id"]
          },
        ]
      }
      freshers: {
        Row: {
          avatar_url: string | null
          batch: string
          created_at: string
          department: string
          email: string
          enrollment_date: string
          id: string
          name: string
          phone: string | null
          profile_id: string | null
          status: Database["public"]["Enums"]["fresher_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          batch: string
          created_at?: string
          department: string
          email: string
          enrollment_date?: string
          id?: string
          name: string
          phone?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["fresher_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          batch?: string
          created_at?: string
          department?: string
          email?: string
          enrollment_date?: string
          id?: string
          name?: string
          phone?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["fresher_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freshers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          completed: boolean
          correct_answers: number
          created_at: string
          fresher_id: string
          id: string
          quiz_date: string
          score: number
          time_taken: number | null
          total_questions: number
        }
        Insert: {
          completed?: boolean
          correct_answers: number
          created_at?: string
          fresher_id: string
          id?: string
          quiz_date?: string
          score: number
          time_taken?: number | null
          total_questions?: number
        }
        Update: {
          completed?: boolean
          correct_answers?: number
          created_at?: string
          fresher_id?: string
          id?: string
          quiz_date?: string
          score?: number
          time_taken?: number | null
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_fresher_id_fkey"
            columns: ["fresher_id"]
            isOneToOne: false
            referencedRelation: "freshers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_queues: {
        Row: {
          created_at: string
          error_count: number
          id: string
          last_updated: string
          pending_count: number
          processed_count: number
          queue_name: string
          status: Database["public"]["Enums"]["queue_status"]
        }
        Insert: {
          created_at?: string
          error_count?: number
          id?: string
          last_updated?: string
          pending_count?: number
          processed_count?: number
          queue_name: string
          status?: Database["public"]["Enums"]["queue_status"]
        }
        Update: {
          created_at?: string
          error_count?: number
          id?: string
          last_updated?: string
          pending_count?: number
          processed_count?: number
          queue_name?: string
          status?: Database["public"]["Enums"]["queue_status"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_average_score: {
        Args: { fresher_uuid: string }
        Returns: number
      }
      get_completion_rate: {
        Args: { fresher_uuid: string }
        Returns: number
      }
    }
    Enums: {
      fresher_status: "active" | "inactive" | "completed" | "dropped"
      queue_status: "operational" | "warning" | "critical" | "maintenance"
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
      fresher_status: ["active", "inactive", "completed", "dropped"],
      queue_status: ["operational", "warning", "critical", "maintenance"],
    },
  },
} as const
