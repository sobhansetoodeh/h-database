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
      attachments: {
        Row: {
          created_at: string | null
          id: string
          name: string
          size: number | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          size?: number | null
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          size?: number | null
          type?: string
          url?: string
        }
        Relationships: []
      }
      case_attachments: {
        Row: {
          attachment_id: string
          case_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          attachment_id: string
          case_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          attachment_id?: string
          case_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_attachments_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_attachments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_people: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          person_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          person_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_people_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_people_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          status: Database["public"]["Enums"]["case_status"] | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["case_status"] | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["case_status"] | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      incident_people: {
        Row: {
          created_at: string | null
          id: string
          incident_id: string
          person_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          incident_id: string
          person_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          incident_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_people_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_people_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          follow_up: string | null
          id: string
          importance: Database["public"]["Enums"]["incident_importance"] | null
          records: string | null
          security_opinion: string | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          follow_up?: string | null
          id?: string
          importance?: Database["public"]["Enums"]["incident_importance"] | null
          records?: string | null
          security_opinion?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          follow_up?: string | null
          id?: string
          importance?: Database["public"]["Enums"]["incident_importance"] | null
          records?: string | null
          security_opinion?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          academic_rank: string | null
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          email: string | null
          employee_number: string | null
          faculty: string | null
          full_name: string
          id: string
          is_foreign_student: boolean | null
          national_id: string | null
          notes: string | null
          phone: string | null
          position: string | null
          program: string | null
          religion: string | null
          student_number: string | null
          type: Database["public"]["Enums"]["person_type"]
          updated_at: string | null
        }
        Insert: {
          academic_rank?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string | null
          faculty?: string | null
          full_name: string
          id?: string
          is_foreign_student?: boolean | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          program?: string | null
          religion?: string | null
          student_number?: string | null
          type: Database["public"]["Enums"]["person_type"]
          updated_at?: string | null
        }
        Update: {
          academic_rank?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string | null
          faculty?: string | null
          full_name?: string
          id?: string
          is_foreign_student?: boolean | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          program?: string | null
          religion?: string | null
          student_number?: string | null
          type?: Database["public"]["Enums"]["person_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      people_attachments: {
        Row: {
          attachment_id: string
          created_at: string | null
          id: string
          is_profile_picture: boolean | null
          person_id: string
        }
        Insert: {
          attachment_id: string
          created_at?: string | null
          id?: string
          is_profile_picture?: boolean | null
          person_id: string
        }
        Update: {
          attachment_id?: string
          created_at?: string | null
          id?: string
          is_profile_picture?: boolean | null
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_attachments_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_attachments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "admin" | "user"
      case_status: "open" | "in_progress" | "closed"
      incident_importance: "low" | "medium" | "high" | "critical"
      incident_status: "pending" | "under_review" | "resolved"
      person_type: "student" | "staff" | "faculty"
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
      app_role: ["admin", "user"],
      case_status: ["open", "in_progress", "closed"],
      incident_importance: ["low", "medium", "high", "critical"],
      incident_status: ["pending", "under_review", "resolved"],
      person_type: ["student", "staff", "faculty"],
    },
  },
} as const
