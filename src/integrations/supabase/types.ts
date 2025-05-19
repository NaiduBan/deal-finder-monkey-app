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
          created_at: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      Data: {
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
      offers: {
        Row: {
          affiliate_link: string | null
          category_id: string | null
          code: string | null
          created_at: string
          description: string
          expiry_date: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          is_amazon: boolean | null
          lmd_id: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          long_offer: string | null
          merchant_homepage: string | null
          offer_type: string | null
          offer_value: string | null
          original_price: number
          price: number
          publisher_exclusive: boolean | null
          savings: string | null
          smartlink: string | null
          start_date: string | null
          status: string | null
          store: string
          terms: string | null
          terms_and_conditions: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          affiliate_link?: string | null
          category_id?: string | null
          code?: string | null
          created_at?: string
          description: string
          expiry_date?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_amazon?: boolean | null
          lmd_id?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          long_offer?: string | null
          merchant_homepage?: string | null
          offer_type?: string | null
          offer_value?: string | null
          original_price: number
          price: number
          publisher_exclusive?: boolean | null
          savings?: string | null
          smartlink?: string | null
          start_date?: string | null
          status?: string | null
          store: string
          terms?: string | null
          terms_and_conditions?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          affiliate_link?: string | null
          category_id?: string | null
          code?: string | null
          created_at?: string
          description?: string
          expiry_date?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_amazon?: boolean | null
          lmd_id?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          long_offer?: string | null
          merchant_homepage?: string | null
          offer_type?: string | null
          offer_value?: string | null
          original_price?: number
          price?: number
          publisher_exclusive?: boolean | null
          savings?: string | null
          smartlink?: string | null
          start_date?: string | null
          status?: string | null
          store?: string
          terms?: string | null
          terms_and_conditions?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_temp_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
