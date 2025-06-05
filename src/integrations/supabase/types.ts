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
      Offers_data: {
        Row: {
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
          start_date: string | null
          status: string | null
          store: string | null
          terms_and_conditions: string | null
          title: string | null
          type: string | null
          url: string | null
        }
        Insert: {
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
          start_date?: string | null
          status?: string | null
          store?: string | null
          terms_and_conditions?: string | null
          title?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
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
          created_at: string | null
          id: string
          offer_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          offer_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          offer_id?: string
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
