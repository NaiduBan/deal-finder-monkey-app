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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          password_hash: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          password_hash: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          response: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          response?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          response?: string | null
          user_id?: string
        }
        Relationships: []
      }
      Cuelink_data: {
        Row: {
          "Campaign ID": number | null
          "Campaign Name": string | null
          Categories: string | null
          "Coupon Code": string | null
          Description: string | null
          "End Date": string | null
          Id: number
          "Image URL": string | null
          Merchant: string | null
          "Offer Added At": string | null
          "Start Date": string | null
          Status: string | null
          Terms: string | null
          Title: string | null
          URL: string | null
        }
        Insert: {
          "Campaign ID"?: number | null
          "Campaign Name"?: string | null
          Categories?: string | null
          "Coupon Code"?: string | null
          Description?: string | null
          "End Date"?: string | null
          Id: number
          "Image URL"?: string | null
          Merchant?: string | null
          "Offer Added At"?: string | null
          "Start Date"?: string | null
          Status?: string | null
          Terms?: string | null
          Title?: string | null
          URL?: string | null
        }
        Update: {
          "Campaign ID"?: number | null
          "Campaign Name"?: string | null
          Categories?: string | null
          "Coupon Code"?: string | null
          Description?: string | null
          "End Date"?: string | null
          Id?: number
          "Image URL"?: string | null
          Merchant?: string | null
          "Offer Added At"?: string | null
          "Start Date"?: string | null
          Status?: string | null
          Terms?: string | null
          Title?: string | null
          URL?: string | null
        }
        Relationships: []
      }
      daily_notifications: {
        Row: {
          created_at: string
          email_sent: boolean | null
          id: string
          notification_date: string
          notification_sent: boolean | null
          offer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_sent?: boolean | null
          id?: string
          notification_date?: string
          notification_sent?: boolean | null
          offer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_sent?: boolean | null
          id?: string
          notification_date?: string
          notification_sent?: boolean | null
          offer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkmydeals_offers: {
        Row: {
          categories: string | null
          code: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          featured: string | null
          image_url: string | null
          lmd_id: number
          long_offer: string | null
          merchant_homepage: string | null
          offer_value: string | null
          publisher_exclusive: string | null
          smartlink: string | null
          start_date: string | null
          status: string | null
          store: string | null
          terms_and_conditions: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          categories?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          featured?: string | null
          image_url?: string | null
          lmd_id?: number
          long_offer?: string | null
          merchant_homepage?: string | null
          offer_value?: string | null
          publisher_exclusive?: string | null
          smartlink?: string | null
          start_date?: string | null
          status?: string | null
          store?: string | null
          terms_and_conditions?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          categories?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          featured?: string | null
          image_url?: string | null
          lmd_id?: number
          long_offer?: string | null
          merchant_homepage?: string | null
          offer_value?: string | null
          publisher_exclusive?: string | null
          smartlink?: string | null
          start_date?: string | null
          status?: string | null
          store?: string | null
          terms_and_conditions?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          offer_id: string | null
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          offer_id?: string | null
          read?: boolean
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          offer_id?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Offers_data: {
        Row: {
          banner: boolean
          categories: string | null
          code: string | null
          description: string | null
          end_date: string | null
          featured: string | null
          image_url: string | null
          lmd_id: number
          long_offer: string | null
          merchant_homepage: string | null
          offer: string | null
          offer_value: string | null
          publisher_exclusive: string | null
          smartlink: string | null
          sponsored: boolean
          start_date: string | null
          status: string | null
          store: string | null
          terms_and_conditions: string | null
          title: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          banner?: boolean
          categories?: string | null
          code?: string | null
          description?: string | null
          end_date?: string | null
          featured?: string | null
          image_url?: string | null
          lmd_id: number
          long_offer?: string | null
          merchant_homepage?: string | null
          offer?: string | null
          offer_value?: string | null
          publisher_exclusive?: string | null
          smartlink?: string | null
          sponsored?: boolean
          start_date?: string | null
          status?: string | null
          store?: string | null
          terms_and_conditions?: string | null
          title?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          banner?: boolean
          categories?: string | null
          code?: string | null
          description?: string | null
          end_date?: string | null
          featured?: string | null
          image_url?: string | null
          lmd_id?: number
          long_offer?: string | null
          merchant_homepage?: string | null
          offer?: string | null
          offer_value?: string | null
          publisher_exclusive?: string | null
          smartlink?: string | null
          sponsored?: boolean
          start_date?: string | null
          status?: string | null
          store?: string | null
          terms_and_conditions?: string | null
          title?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          is_email_verified: boolean | null
          is_phone_verified: boolean | null
          last_name: string | null
          location: string | null
          marketing_consent: boolean | null
          name: string | null
          occupation: string | null
          phone: string | null
          postal_code: string | null
          preferences: Json | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          is_email_verified?: boolean | null
          is_phone_verified?: boolean | null
          last_name?: string | null
          location?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          occupation?: string | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          is_email_verified?: boolean | null
          is_phone_verified?: boolean | null
          last_name?: string | null
          location?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          occupation?: string | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_offers: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          offer_id: string
          priority: number | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          offer_id: string
          priority?: number | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          offer_id?: string
          priority?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preference_id: string
          preference_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference_id: string
          preference_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preference_id?: string
          preference_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin_secure: {
        Args: { p_email: string; p_password: string }
        Returns: {
          admin_email: string
          admin_id: string
          admin_name: string
          admin_role: string
          session_token: string
          success: boolean
        }[]
      }
      create_admin_user: {
        Args: {
          p_email: string
          p_name: string
          p_password: string
          p_role?: string
        }
        Returns: {
          admin_email: string
          admin_id: string
          admin_name: string
          admin_role: string
          success: boolean
        }[]
      }
      create_admin_user_secure: {
        Args: {
          p_email: string
          p_name: string
          p_password: string
          p_role?: string
        }
        Returns: {
          admin_email: string
          admin_id: string
          admin_name: string
          admin_role: string
          success: boolean
        }[]
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_all_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_email: string
          admin_id: string
          admin_name: string
          admin_role: string
          created_at: string
          is_active: boolean
        }[]
      }
      verify_admin_session: {
        Args: { p_token: string }
        Returns: {
          admin_email: string
          admin_id: string
          admin_name: string
          admin_role: string
        }[]
      }
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
