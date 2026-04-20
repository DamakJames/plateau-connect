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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          content_id: string
          content_type: Database["public"]["Enums"]["content_kind"]
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: Database["public"]["Enums"]["content_kind"]
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: Database["public"]["Enums"]["content_kind"]
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      dialects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lga_id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lga_id: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lga_id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialects_lga_id_fkey"
            columns: ["lga_id"]
            isOneToOne: false
            referencedRelation: "lgas"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_items: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          lesson_id: string
          media_url: string | null
          position: number
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          lesson_id: string
          media_url?: string | null
          position?: number
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          lesson_id?: string
          media_url?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_items_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          id: string
          last_viewed_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          id?: string
          last_viewed_at?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          id?: string
          last_viewed_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          dialect_id: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dialect_id: string
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dialect_id?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_dialect_id_fkey"
            columns: ["dialect_id"]
            isOneToOne: false
            referencedRelation: "dialects"
            referencedColumns: ["id"]
          },
        ]
      }
      lgas: {
        Row: {
          cover_url: string | null
          created_at: string
          display_order: number
          id: string
          name: string
          overview: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          name: string
          overview?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          overview?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          lga_id: string | null
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          lga_id?: string | null
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          lga_id?: string | null
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_lga_id_fkey"
            columns: ["lga_id"]
            isOneToOne: false
            referencedRelation: "lgas"
            referencedColumns: ["id"]
          },
        ]
      }
      phrases: {
        Row: {
          audio_url: string | null
          category: string | null
          created_at: string
          dialect_id: string
          id: string
          text: string
          translation: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          dialect_id: string
          id?: string
          text: string
          translation: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          dialect_id?: string
          id?: string
          text?: string
          translation?: string
        }
        Relationships: [
          {
            foreignKeyName: "phrases_dialect_id_fkey"
            columns: ["dialect_id"]
            isOneToOne: false
            referencedRelation: "dialects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      proverbs: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          lga_id: string
          meaning: string | null
          text: string
          translation: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          lga_id: string
          meaning?: string | null
          text: string
          translation?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          lga_id?: string
          meaning?: string | null
          text?: string
          translation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proverbs_lga_id_fkey"
            columns: ["lga_id"]
            isOneToOne: false
            referencedRelation: "lgas"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          created_at: string
          id: string
          quiz_id: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quiz_id: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quiz_id?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          id: string
          is_correct: boolean
          label: string
          position: number
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          label: string
          position?: number
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          label?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          id: string
          position: number
          prompt: string
          quiz_id: string
        }
        Insert: {
          id?: string
          position?: number
          prompt: string
          quiz_id: string
        }
        Update: {
          id?: string
          position?: number
          prompt?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          audio_url: string | null
          body: string
          cover_url: string | null
          created_at: string
          id: string
          lga_id: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          body: string
          cover_url?: string | null
          created_at?: string
          id?: string
          lga_id: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          body?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          lga_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_lga_id_fkey"
            columns: ["lga_id"]
            isOneToOne: false
            referencedRelation: "lgas"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          body: string | null
          created_at: string
          dialect_id: string | null
          id: string
          kind: Database["public"]["Enums"]["content_kind"]
          lga_id: string | null
          media_url: string | null
          review_notes: string | null
          status: Database["public"]["Enums"]["submission_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          dialect_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["content_kind"]
          lga_id?: string | null
          media_url?: string | null
          review_notes?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          dialect_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["content_kind"]
          lga_id?: string | null
          media_url?: string | null
          review_notes?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_dialect_id_fkey"
            columns: ["dialect_id"]
            isOneToOne: false
            referencedRelation: "dialects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_lga_id_fkey"
            columns: ["lga_id"]
            isOneToOne: false
            referencedRelation: "lgas"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "contributor" | "user"
      content_kind: "story" | "proverb" | "phrase" | "lesson" | "media"
      media_kind: "audio" | "video" | "image"
      submission_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "contributor", "user"],
      content_kind: ["story", "proverb", "phrase", "lesson", "media"],
      media_kind: ["audio", "video", "image"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
