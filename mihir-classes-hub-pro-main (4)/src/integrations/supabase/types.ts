export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_date: string
          id: string
          is_general: boolean
          priority: string
          target_board: string | null
          target_class: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_date?: string
          id?: string
          is_general?: boolean
          priority: string
          target_board?: string | null
          target_class?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_date?: string
          id?: string
          is_general?: boolean
          priority?: string
          target_board?: string | null
          target_class?: string | null
          title?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          batch_time: string
          class: string
          created_at: string
          date: string
          id: string
          status: string
          student_id: string
          student_name: string
        }
        Insert: {
          batch_time?: string
          class: string
          created_at?: string
          date: string
          id?: string
          status: string
          student_id: string
          student_name: string
        }
        Update: {
          batch_time?: string
          class?: string
          created_at?: string
          date?: string
          id?: string
          status?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount_paid: number
          created_at: string
          fee_record_id: string | null
          id: string
          payment_date: string
          payment_method: string | null
          remarks: string | null
          student_id: string | null
          student_name: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          fee_record_id?: string | null
          id?: string
          payment_date?: string
          payment_method?: string | null
          remarks?: string | null
          student_id?: string | null
          student_name: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          fee_record_id?: string | null
          id?: string
          payment_date?: string
          payment_method?: string | null
          remarks?: string | null
          student_id?: string | null
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_fee_record_id_fkey"
            columns: ["fee_record_id"]
            isOneToOne: false
            referencedRelation: "fee_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_records: {
        Row: {
          amount: number
          class: string
          created_at: string
          due_date: string
          id: string
          paid_date: string | null
          remaining_amount: number | null
          status: string
          student_id: string
          student_name: string
          term_number: number
          term_type: string
          total_paid: number | null
        }
        Insert: {
          amount: number
          class: string
          created_at?: string
          due_date: string
          id?: string
          paid_date?: string | null
          remaining_amount?: number | null
          status?: string
          student_id: string
          student_name: string
          term_number: number
          term_type: string
          total_paid?: number | null
        }
        Update: {
          amount?: number
          class?: string
          created_at?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          remaining_amount?: number | null
          status?: string
          student_id?: string
          student_name?: string
          term_number?: number
          term_type?: string
          total_paid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          board: string
          class: string
          content: string
          created_at: string
          created_date: string
          id: string
          subject: string
          title: string
        }
        Insert: {
          board: string
          class: string
          content: string
          created_at?: string
          created_date?: string
          id?: string
          subject: string
          title: string
        }
        Update: {
          board?: string
          class?: string
          content?: string
          created_at?: string
          created_date?: string
          id?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          batch_time: string
          board: string
          class: string
          created_at: string
          fee_amount: number
          id: string
          name: string
          password: string
          term_type: string
          username: string
        }
        Insert: {
          batch_time?: string
          board: string
          class: string
          created_at?: string
          fee_amount: number
          id?: string
          name: string
          password: string
          term_type: string
          username: string
        }
        Update: {
          batch_time?: string
          board?: string
          class?: string
          created_at?: string
          fee_amount?: number
          id?: string
          name?: string
          password?: string
          term_type?: string
          username?: string
        }
        Relationships: []
      }
      work_assignments: {
        Row: {
          board: string
          class: string
          created_at: string
          created_date: string
          description: string
          due_date: string
          id: string
          priority: string
          subject: string
          title: string
        }
        Insert: {
          board: string
          class: string
          created_at?: string
          created_date?: string
          description: string
          due_date: string
          id?: string
          priority: string
          subject: string
          title: string
        }
        Update: {
          board?: string
          class?: string
          created_at?: string
          created_date?: string
          description?: string
          due_date?: string
          id?: string
          priority?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      work_submissions: {
        Row: {
          assignment_id: string | null
          created_at: string
          id: string
          remarks: string | null
          status: string
          student_id: string | null
          student_name: string
          submission_date: string
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          id?: string
          remarks?: string | null
          status?: string
          student_id?: string | null
          student_name: string
          submission_date?: string
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          id?: string
          remarks?: string | null
          status?: string
          student_id?: string | null
          student_name?: string
          submission_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "work_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          id: string;
          title: string;
          description: string;
          video_url: string;
          thumbnail_url: string;
          duration_seconds: number;
          uploaded_by: string;
          created_at: string;
          likes_count: number;
          year: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          video_url: string;
          thumbnail_url: string;
          duration_seconds: number;
          uploaded_by: string;
          created_at?: string;
          likes_count?: number;
          year: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          video_url?: string;
          thumbnail_url?: string;
          duration_seconds?: number;
          uploaded_by?: string;
          created_at?: string;
          likes_count?: number;
          year?: string;
        };
        Relationships: [];
      },
      video_likes: {
        Row: {
          id: string;
          video_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      },
      albums: {
        Row: {
          id: string;
          name: string;
          description: string;
          cover_url: string | null;
          created_at: string;
          link?: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          cover_url?: string | null;
          created_at?: string;
          link?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          cover_url?: string | null;
          created_at?: string;
          link?: string | null;
        };
        Relationships: [];
      },
      album_media: {
        Row: {
          id: string;
          album_id: string;
          type: 'image' | 'video';
          url: string;
          thumbnail_url: string | null;
          title: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          type: 'image' | 'video';
          url: string;
          thumbnail_url?: string | null;
          title?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          type?: 'image' | 'video';
          url?: string;
          thumbnail_url?: string | null;
          title?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      },
      recent_activities: {
        Row: {
          id: string;
          user_id: string | null;
          user_name: string;
          action: string;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_name: string;
          action: string;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_name?: string;
          action?: string;
          details?: string | null;
          created_at?: string;
        };
        Relationships: [];
      },
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
