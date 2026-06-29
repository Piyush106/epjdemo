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
      journals: {
        Row: {
          abbrev: string
          access_model: string | null
          aims_and_scope: string | null
          color_token: string | null
          contact_email: string | null
          created_at: string
          display_order: number | null
          doi_prefix: string | null
          electronic_issn: string | null
          established: string | null
          external_url: string
          frequency: string | null
          id: string
          journal_doi: string | null
          license: string | null
          print_issn: string | null
          scope_short: string | null
          status: string | null
          subject_areas: string[] | null
          submission_url: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          abbrev: string
          access_model?: string | null
          aims_and_scope?: string | null
          color_token?: string | null
          contact_email?: string | null
          created_at?: string
          display_order?: number | null
          doi_prefix?: string | null
          electronic_issn?: string | null
          established?: string | null
          external_url?: string
          frequency?: string | null
          id?: string
          journal_doi?: string | null
          license?: string | null
          print_issn?: string | null
          scope_short?: string | null
          status?: string | null
          subject_areas?: string[] | null
          submission_url?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          abbrev?: string
          access_model?: string | null
          aims_and_scope?: string | null
          color_token?: string | null
          contact_email?: string | null
          created_at?: string
          display_order?: number | null
          doi_prefix?: string | null
          electronic_issn?: string | null
          established?: string | null
          external_url?: string
          frequency?: string | null
          id?: string
          journal_doi?: string | null
          license?: string | null
          print_issn?: string | null
          scope_short?: string | null
          status?: string | null
          subject_areas?: string[] | null
          submission_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          abstract: string
          article_url: string | null
          authors: string
          created_at: string
          created_by: string | null
          doi: string | null
          id: string
          issue: string | null
          journal_abbrev: string
          journal_name: string
          keywords: string[] | null
          pages: string | null
          pdf_url: string | null
          publication_date: string
          status: string
          title: string
          updated_at: string
          volume: string | null
        }
        Insert: {
          abstract: string
          article_url?: string | null
          authors: string
          created_at?: string
          created_by?: string | null
          doi?: string | null
          id?: string
          issue?: string | null
          journal_abbrev: string
          journal_name: string
          keywords?: string[] | null
          pages?: string | null
          pdf_url?: string | null
          publication_date?: string
          status?: string
          title: string
          updated_at?: string
          volume?: string | null
        }
        Update: {
          abstract?: string
          article_url?: string | null
          authors?: string
          created_at?: string
          created_by?: string | null
          doi?: string | null
          id?: string
          issue?: string | null
          journal_abbrev?: string
          journal_name?: string
          keywords?: string[] | null
          pages?: string | null
          pdf_url?: string | null
          publication_date?: string
          status?: string
          title?: string
          updated_at?: string
          volume?: string | null
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          body_blocks: Json
          body_html: string | null
          category: string
          created_at: string
          created_by: string | null
          faqs: Json | null
          id: string
          keywords: string[]
          last_updated: string
          meta_description: string
          meta_title: string | null
          reading_time_minutes: number | null
          related_links: Json | null
          slug: string
          status: string
          subtitle: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body_blocks?: Json
          body_html?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          faqs?: Json | null
          id?: string
          keywords?: string[]
          last_updated: string
          meta_description: string
          meta_title?: string | null
          reading_time_minutes?: number | null
          related_links?: Json | null
          slug: string
          status?: string
          subtitle?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body_blocks?: Json
          body_html?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          faqs?: Json | null
          id?: string
          keywords?: string[]
          last_updated?: string
          meta_description?: string
          meta_title?: string | null
          reading_time_minutes?: number | null
          related_links?: Json | null
          slug?: string
          status?: string
          subtitle?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      manuscript_submissions: {
        Row: {
          abstract: string
          affiliation: string
          author_email: string
          author_name: string
          comments: string | null
          country: string | null
          created_at: string
          declaration_confirmed: boolean
          file_name: string
          file_path: string
          id: string
          journal_name: string
          keywords: string | null
          paper_title: string
          status: string
          updated_at: string
        }
        Insert: {
          abstract: string
          affiliation: string
          author_email: string
          author_name: string
          comments?: string | null
          country?: string | null
          created_at?: string
          declaration_confirmed?: boolean
          file_name: string
          file_path: string
          id?: string
          journal_name: string
          keywords?: string | null
          paper_title: string
          status?: string
          updated_at?: string
        }
        Update: {
          abstract?: string
          affiliation?: string
          author_email?: string
          author_name?: string
          comments?: string | null
          country?: string | null
          created_at?: string
          declaration_confirmed?: boolean
          file_name?: string
          file_path?: string
          id?: string
          journal_name?: string
          keywords?: string | null
          paper_title?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
