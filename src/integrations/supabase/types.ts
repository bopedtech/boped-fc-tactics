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
      celebrations: {
        Row: {
          displayName: string | null
          id: number
          localizationKey: string | null
          mediaUrl: string | null
          rawData: Json | null
          updatedAt: string | null
        }
        Insert: {
          displayName?: string | null
          id: number
          localizationKey?: string | null
          mediaUrl?: string | null
          rawData?: Json | null
          updatedAt?: string | null
        }
        Update: {
          displayName?: string | null
          id?: number
          localizationKey?: string | null
          mediaUrl?: string | null
          rawData?: Json | null
          updatedAt?: string | null
        }
        Relationships: []
      }
      formations: {
        Row: {
          category: string | null
          id: string
          name: string
          nameEn: string | null
          positions: Json | null
          rawData: Json | null
          updatedAt: string | null
        }
        Insert: {
          category?: string | null
          id: string
          name: string
          nameEn?: string | null
          positions?: Json | null
          rawData?: Json | null
          updatedAt?: string | null
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
          nameEn?: string | null
          positions?: Json | null
          rawData?: Json | null
          updatedAt?: string | null
        }
        Relationships: []
      }
      leagues: {
        Row: {
          displayname: string | null
          id: number
          image: string | null
          localizationkey: string | null
          rawdata: Json | null
          updatedat: string | null
        }
        Insert: {
          displayname?: string | null
          id: number
          image?: string | null
          localizationkey?: string | null
          rawdata?: Json | null
          updatedat?: string | null
        }
        Update: {
          displayname?: string | null
          id?: number
          image?: string | null
          localizationkey?: string | null
          rawdata?: Json | null
          updatedat?: string | null
        }
        Relationships: []
      }
      localization_dictionary: {
        Row: {
          created_at: string
          id: string
          key: string
          source: string | null
          updated_at: string
          value_en: string | null
          value_vi: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          source?: string | null
          updated_at?: string
          value_en?: string | null
          value_vi?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          source?: string | null
          updated_at?: string
          value_en?: string | null
          value_vi?: string | null
        }
        Relationships: []
      }
      nations: {
        Row: {
          displayname: string | null
          id: number
          image: string | null
          localizationkey: string | null
          rawdata: Json | null
          updatedat: string | null
        }
        Insert: {
          displayname?: string | null
          id: number
          image?: string | null
          localizationkey?: string | null
          rawdata?: Json | null
          updatedat?: string | null
        }
        Update: {
          displayname?: string | null
          id?: number
          image?: string | null
          localizationkey?: string | null
          rawdata?: Json | null
          updatedat?: string | null
        }
        Relationships: []
      }
      player_merchandise: {
        Row: {
          affiliateUrl: string
          created_at: string
          id: number
          isActive: boolean | null
          playerId: number
          productDescription: string
          productDescriptionVi: string | null
        }
        Insert: {
          affiliateUrl: string
          created_at?: string
          id?: number
          isActive?: boolean | null
          playerId: number
          productDescription: string
          productDescriptionVi?: string | null
        }
        Update: {
          affiliateUrl?: string
          created_at?: string
          id?: number
          isActive?: boolean | null
          playerId?: number
          productDescription?: string
          productDescriptionVi?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          added: string | null
          animation: Json | null
          assetId: number
          auctionable: boolean | null
          avgGkStats: Json | null
          avgStats: Json | null
          bindingXml: string | null
          bio: string | null
          birthday: string | null
          cardName: string | null
          celebration: Json | null
          club: Json | null
          commonName: string | null
          created_at_renderz: string | null
          createdAt: string | null
          firstName: string | null
          foot: number | null
          height: number | null
          images: Json | null
          is_visible: boolean | null
          lastName: string | null
          league: Json | null
          likes: number | null
          nation: Json | null
          playerId: number
          position: string | null
          potentialPositions: Json | null
          priceData: Json | null
          rank: number | null
          rating: number
          rawData: Json | null
          revealOn: string | null
          skillMoves: Json | null
          skillMovesLevel: number | null
          skillStyleId: number | null
          skillStyleSkills: Json | null
          source: string | null
          stats: Json | null
          tags: string | null
          traits: Json | null
          updatedAt: string | null
          weakFoot: number | null
          weight: number | null
          workRateAtt: number | null
          workRateDef: number | null
          workRates: string | null
        }
        Insert: {
          added?: string | null
          animation?: Json | null
          assetId: number
          auctionable?: boolean | null
          avgGkStats?: Json | null
          avgStats?: Json | null
          bindingXml?: string | null
          bio?: string | null
          birthday?: string | null
          cardName?: string | null
          celebration?: Json | null
          club?: Json | null
          commonName?: string | null
          created_at_renderz?: string | null
          createdAt?: string | null
          firstName?: string | null
          foot?: number | null
          height?: number | null
          images?: Json | null
          is_visible?: boolean | null
          lastName?: string | null
          league?: Json | null
          likes?: number | null
          nation?: Json | null
          playerId: number
          position?: string | null
          potentialPositions?: Json | null
          priceData?: Json | null
          rank?: number | null
          rating?: number
          rawData?: Json | null
          revealOn?: string | null
          skillMoves?: Json | null
          skillMovesLevel?: number | null
          skillStyleId?: number | null
          skillStyleSkills?: Json | null
          source?: string | null
          stats?: Json | null
          tags?: string | null
          traits?: Json | null
          updatedAt?: string | null
          weakFoot?: number | null
          weight?: number | null
          workRateAtt?: number | null
          workRateDef?: number | null
          workRates?: string | null
        }
        Update: {
          added?: string | null
          animation?: Json | null
          assetId?: number
          auctionable?: boolean | null
          avgGkStats?: Json | null
          avgStats?: Json | null
          bindingXml?: string | null
          bio?: string | null
          birthday?: string | null
          cardName?: string | null
          celebration?: Json | null
          club?: Json | null
          commonName?: string | null
          created_at_renderz?: string | null
          createdAt?: string | null
          firstName?: string | null
          foot?: number | null
          height?: number | null
          images?: Json | null
          is_visible?: boolean | null
          lastName?: string | null
          league?: Json | null
          likes?: number | null
          nation?: Json | null
          playerId?: number
          position?: string | null
          potentialPositions?: Json | null
          priceData?: Json | null
          rank?: number | null
          rating?: number
          rawData?: Json | null
          revealOn?: string | null
          skillMoves?: Json | null
          skillMovesLevel?: number | null
          skillStyleId?: number | null
          skillStyleSkills?: Json | null
          source?: string | null
          stats?: Json | null
          tags?: string | null
          traits?: Json | null
          updatedAt?: string | null
          weakFoot?: number | null
          weight?: number | null
          workRateAtt?: number | null
          workRateDef?: number | null
          workRates?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          ai_prompt_limit_daily: number | null
          aiPromptLimitDaily: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          fc_mobile_experience: string | null
          full_name: string | null
          id: string
          subscription_expires_at: string | null
          subscription_tier: string | null
          subscriptionExpiresAt: string | null
          subscriptionTier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age?: number | null
          ai_prompt_limit_daily?: number | null
          aiPromptLimitDaily?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          fc_mobile_experience?: string | null
          full_name?: string | null
          id: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          subscriptionExpiresAt?: string | null
          subscriptionTier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number | null
          ai_prompt_limit_daily?: number | null
          aiPromptLimitDaily?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          fc_mobile_experience?: string | null
          full_name?: string | null
          id?: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          subscriptionExpiresAt?: string | null
          subscriptionTier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          displayname: string | null
          id: number
          image: string | null
          localizationkey: string | null
          rawdata: Json | null
          updatedat: string | null
        }
        Insert: {
          displayname?: string | null
          id: number
          image?: string | null
          localizationkey?: string | null
          rawdata?: Json | null
          updatedat?: string | null
        }
        Update: {
          displayname?: string | null
          id?: number
          image?: string | null
          localizationkey?: string | null
          rawdata?: Json | null
          updatedat?: string | null
        }
        Relationships: []
      }
      skillmoves: {
        Row: {
          displayName: string | null
          id: number
          localizationKey: string | null
          mediaUrl: string | null
          rawData: Json | null
          updatedAt: string | null
        }
        Insert: {
          displayName?: string | null
          id: number
          localizationKey?: string | null
          mediaUrl?: string | null
          rawData?: Json | null
          updatedAt?: string | null
        }
        Update: {
          displayName?: string | null
          id?: number
          localizationKey?: string | null
          mediaUrl?: string | null
          rawData?: Json | null
          updatedAt?: string | null
        }
        Relationships: []
      }
      squads: {
        Row: {
          createdAt: string
          formation: string | null
          id: string
          lineup: Json | null
          playstyle: string | null
          squadName: string
          updatedAt: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          formation?: string | null
          id?: string
          lineup?: Json | null
          playstyle?: string | null
          squadName: string
          updatedAt?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          formation?: string | null
          id?: string
          lineup?: Json | null
          playstyle?: string | null
          squadName?: string
          updatedAt?: string | null
          userId?: string
        }
        Relationships: []
      }
      sync_state: {
        Row: {
          id: string
          is_complete: boolean | null
          job_name: string
          last_cursor: Json | null
          total_synced: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          is_complete?: boolean | null
          job_name: string
          last_cursor?: Json | null
          total_synced?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          is_complete?: boolean | null
          job_name?: string
          last_cursor?: Json | null
          total_synced?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          displayname: string | null
          id: number
          image: string | null
          localizationkey: string | null
          rawdata: Json | null
          updatedat: string | null
        }
        Insert: {
          displayname?: string | null
          id: number
          image?: string | null
          localizationkey?: string | null
          rawdata?: Json | null
          updatedat?: string | null
        }
        Update: {
          displayname?: string | null
          id?: number
          image?: string | null
          localizationkey?: string | null
          rawdata?: Json | null
          updatedat?: string | null
        }
        Relationships: []
      }
      traits: {
        Row: {
          displayName: string | null
          id: number
          localizationKey: string | null
          mediaUrl: string | null
          rawData: Json | null
          updatedAt: string | null
        }
        Insert: {
          displayName?: string | null
          id: number
          localizationKey?: string | null
          mediaUrl?: string | null
          rawData?: Json | null
          updatedAt?: string | null
        }
        Update: {
          displayName?: string | null
          id?: number
          localizationKey?: string | null
          mediaUrl?: string | null
          rawData?: Json | null
          updatedAt?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
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
      app_role: ["admin", "moderator", "user", "super_admin"],
    },
  },
} as const
