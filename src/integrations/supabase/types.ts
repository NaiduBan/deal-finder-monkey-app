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
      achievements: {
        Row: {
          badge_color: string | null
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_required: number | null
        }
        Insert: {
          badge_color?: string | null
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points_required?: number | null
        }
        Update: {
          badge_color?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
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
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "deal_comments"
            referencedColumns: ["id"]
          },
        ]
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
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          points_earned: number | null
          streak_count: number | null
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          id?: string
          points_earned?: number | null
          streak_count?: number | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          points_earned?: number | null
          streak_count?: number | null
          user_id?: string
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
      deal_alerts: {
        Row: {
          alert_type: string
          alert_value: string
          created_at: string
          id: string
          is_active: boolean | null
          target_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          alert_value: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          target_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          alert_value?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          target_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deal_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          offer_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          offer_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          offer_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      deal_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean | null
          reward_points: number
          start_date: string
          target_value: number
          title: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean | null
          reward_points: number
          start_date: string
          target_value: number
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          reward_points?: number
          start_date?: string
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      deal_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          likes_count: number | null
          offer_id: string
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          likes_count?: number | null
          offer_id: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          offer_id?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "deal_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_popularity: {
        Row: {
          click_count: number | null
          id: string
          offer_id: string
          popularity_score: number | null
          rating_average: number | null
          rating_count: number | null
          save_count: number | null
          share_count: number | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          click_count?: number | null
          id?: string
          offer_id: string
          popularity_score?: number | null
          rating_average?: number | null
          rating_count?: number | null
          save_count?: number | null
          share_count?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          click_count?: number | null
          id?: string
          offer_id?: string
          popularity_score?: number | null
          rating_average?: number | null
          rating_count?: number | null
          save_count?: number | null
          share_count?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      deal_reviews: {
        Row: {
          created_at: string
          helpful_count: number | null
          id: string
          offer_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          offer_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          offer_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deal_shares: {
        Row: {
          created_at: string
          id: string
          offer_id: string
          shared_to: string | null
          shared_via: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          offer_id: string
          shared_to?: string | null
          shared_via: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          offer_id?: string
          shared_to?: string | null
          shared_via?: string
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
      review_helpfulness: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "deal_reviews"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "saved_offers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "wishlist_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_progress: number | null
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "deal_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          offer_id: string | null
          points: number
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          offer_id?: string | null
          points: number
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          offer_id?: string | null
          points?: number
          user_id?: string
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
      wishlist_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { p_email: string; p_password: string }
        Returns: {
          admin_id: string
          admin_name: string
          admin_email: string
          admin_role: string
          session_token: string
        }[]
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      verify_admin_session: {
        Args: { p_token: string }
        Returns: {
          admin_id: string
          admin_name: string
          admin_email: string
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
