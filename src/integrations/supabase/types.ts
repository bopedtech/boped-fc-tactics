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
      clubs: {
        Row: {
          club_id: number
          created_at: string | null
          id: number
          league: string | null
          logo_url: string | null
          name: string
          name_vi: string | null
        }
        Insert: {
          club_id: number
          created_at?: string | null
          id?: number
          league?: string | null
          logo_url?: string | null
          name: string
          name_vi?: string | null
        }
        Update: {
          club_id?: number
          created_at?: string | null
          id?: number
          league?: string | null
          logo_url?: string | null
          name?: string
          name_vi?: string | null
        }
        Relationships: []
      }
      countries_vi: {
        Row: {
          country_code: string
          created_at: string | null
          id: number
          name_en: string
          name_vi: string
        }
        Insert: {
          country_code: string
          created_at?: string | null
          id?: number
          name_en: string
          name_vi: string
        }
        Update: {
          country_code?: string
          created_at?: string | null
          id?: number
          name_en?: string
          name_vi?: string
        }
        Relationships: []
      }
      formations: {
        Row: {
          category: string
          created_at: string | null
          id: number
          name: string
          name_en: string
          positions: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
          name: string
          name_en: string
          positions: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
          name?: string
          name_en?: string
          positions?: Json
        }
        Relationships: []
      }
      players: {
        Row: {
          added: string | null
          animation: Json | null
          asset_id: number
          auctionable: boolean | null
          avg_gk_stats: Json | null
          avg_stats: Json | null
          binding_xml: string | null
          bio: string | null
          birthday: string | null
          card_name: string | null
          celebration: Json | null
          club: Json | null
          common_name: string | null
          created_at: string | null
          first_name: string | null
          foot: number | null
          height: number | null
          id: number
          images: Json | null
          last_name: string | null
          league: Json | null
          likes: number | null
          nation: Json | null
          player_id: number
          position: string
          potential_positions: Json | null
          price_data: Json | null
          rank: number | null
          rating: number
          reveal_on: string | null
          skill_moves: Json | null
          skill_moves_level: number | null
          skill_style_id: number | null
          skill_style_skills: Json | null
          source: string | null
          stats: Json | null
          tags: string | null
          traits: Json | null
          updated_at: string | null
          weak_foot: number | null
          weight: number | null
          work_rate_att: number | null
          work_rate_def: number | null
        }
        Insert: {
          added?: string | null
          animation?: Json | null
          asset_id: number
          auctionable?: boolean | null
          avg_gk_stats?: Json | null
          avg_stats?: Json | null
          binding_xml?: string | null
          bio?: string | null
          birthday?: string | null
          card_name?: string | null
          celebration?: Json | null
          club?: Json | null
          common_name?: string | null
          created_at?: string | null
          first_name?: string | null
          foot?: number | null
          height?: number | null
          id?: number
          images?: Json | null
          last_name?: string | null
          league?: Json | null
          likes?: number | null
          nation?: Json | null
          player_id: number
          position: string
          potential_positions?: Json | null
          price_data?: Json | null
          rank?: number | null
          rating: number
          reveal_on?: string | null
          skill_moves?: Json | null
          skill_moves_level?: number | null
          skill_style_id?: number | null
          skill_style_skills?: Json | null
          source?: string | null
          stats?: Json | null
          tags?: string | null
          traits?: Json | null
          updated_at?: string | null
          weak_foot?: number | null
          weight?: number | null
          work_rate_att?: number | null
          work_rate_def?: number | null
        }
        Update: {
          added?: string | null
          animation?: Json | null
          asset_id?: number
          auctionable?: boolean | null
          avg_gk_stats?: Json | null
          avg_stats?: Json | null
          binding_xml?: string | null
          bio?: string | null
          birthday?: string | null
          card_name?: string | null
          celebration?: Json | null
          club?: Json | null
          common_name?: string | null
          created_at?: string | null
          first_name?: string | null
          foot?: number | null
          height?: number | null
          id?: number
          images?: Json | null
          last_name?: string | null
          league?: Json | null
          likes?: number | null
          nation?: Json | null
          player_id?: number
          position?: string
          potential_positions?: Json | null
          price_data?: Json | null
          rank?: number | null
          rating?: number
          reveal_on?: string | null
          skill_moves?: Json | null
          skill_moves_level?: number | null
          skill_style_id?: number | null
          skill_style_skills?: Json | null
          source?: string | null
          stats?: Json | null
          tags?: string | null
          traits?: Json | null
          updated_at?: string | null
          weak_foot?: number | null
          weight?: number | null
          work_rate_att?: number | null
          work_rate_def?: number | null
        }
        Relationships: []
      }
      squads: {
        Row: {
          created_at: string | null
          formation: string
          id: string
          lineup: Json
          playstyle: string | null
          squad_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          formation: string
          id?: string
          lineup: Json
          playstyle?: string | null
          squad_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          formation?: string
          id?: string
          lineup?: Json
          playstyle?: string | null
          squad_name?: string
          updated_at?: string | null
          user_id?: string
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
