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
      formations: {
        Row: {
          category: string
          createdAt: string | null
          id: number
          name: string
          nameEn: string
          positions: Json
        }
        Insert: {
          category: string
          createdAt?: string | null
          id?: number
          name: string
          nameEn: string
          positions: Json
        }
        Update: {
          category?: string
          createdAt?: string | null
          id?: number
          name?: string
          nameEn?: string
          positions?: Json
        }
        Relationships: []
      }
      leagues: {
        Row: {
          createdAt: string | null
          displayName: string | null
          id: number
          image: string | null
          localizationKey: string
          rawData: Json
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          displayName?: string | null
          id: number
          image?: string | null
          localizationKey: string
          rawData: Json
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          displayName?: string | null
          id?: number
          image?: string | null
          localizationKey?: string
          rawData?: Json
          updatedAt?: string | null
        }
        Relationships: []
      }
      localization_dictionary: {
        Row: {
          key: string
          source: string | null
          updatedAt: string | null
          value_en: string
        }
        Insert: {
          key: string
          source?: string | null
          updatedAt?: string | null
          value_en: string
        }
        Update: {
          key?: string
          source?: string | null
          updatedAt?: string | null
          value_en?: string
        }
        Relationships: []
      }
      nations: {
        Row: {
          createdAt: string | null
          displayName: string
          id: number
          image: string | null
          localizationKey: string
          rawData: Json
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          displayName: string
          id: number
          image?: string | null
          localizationKey: string
          rawData: Json
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          displayName?: string
          id?: number
          image?: string | null
          localizationKey?: string
          rawData?: Json
          updatedAt?: string | null
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
          createdAt: string | null
          firstName: string | null
          foot: number | null
          height: number | null
          id: number | null
          images: Json | null
          isCard: boolean | null
          isSold: boolean | null
          lastName: string | null
          league: Json | null
          likes: number | null
          liveOvr: Json | null
          nation: Json | null
          platform: string | null
          playerId: number
          position: string | null
          potentialPositions: Json | null
          priceData: Json | null
          program: Json | null
          rank: number | null
          rating: number
          rawData: Json
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
          workRates: Json | null
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
          createdAt?: string | null
          firstName?: string | null
          foot?: number | null
          height?: number | null
          id?: number | null
          images?: Json | null
          isCard?: boolean | null
          isSold?: boolean | null
          lastName?: string | null
          league?: Json | null
          likes?: number | null
          liveOvr?: Json | null
          nation?: Json | null
          platform?: string | null
          playerId: number
          position?: string | null
          potentialPositions?: Json | null
          priceData?: Json | null
          program?: Json | null
          rank?: number | null
          rating: number
          rawData: Json
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
          workRates?: Json | null
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
          createdAt?: string | null
          firstName?: string | null
          foot?: number | null
          height?: number | null
          id?: number | null
          images?: Json | null
          isCard?: boolean | null
          isSold?: boolean | null
          lastName?: string | null
          league?: Json | null
          likes?: number | null
          liveOvr?: Json | null
          nation?: Json | null
          platform?: string | null
          playerId?: number
          position?: string | null
          potentialPositions?: Json | null
          priceData?: Json | null
          program?: Json | null
          rank?: number | null
          rating?: number
          rawData?: Json
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
          workRates?: Json | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          createdAt: string | null
          displayName: string
          id: number
          image: string | null
          localizationKey: string
          rawData: Json
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          displayName: string
          id: number
          image?: string | null
          localizationKey: string
          rawData: Json
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          displayName?: string
          id?: number
          image?: string | null
          localizationKey?: string
          rawData?: Json
          updatedAt?: string | null
        }
        Relationships: []
      }
      squads: {
        Row: {
          createdAt: string | null
          formation: string
          id: string
          lineup: Json
          playstyle: string | null
          squadName: string
          updatedAt: string | null
          userId: string
        }
        Insert: {
          createdAt?: string | null
          formation: string
          id?: string
          lineup: Json
          playstyle?: string | null
          squadName: string
          updatedAt?: string | null
          userId: string
        }
        Update: {
          createdAt?: string | null
          formation?: string
          id?: string
          lineup?: Json
          playstyle?: string | null
          squadName?: string
          updatedAt?: string | null
          userId?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          createdAt: string | null
          displayName: string
          id: number
          image: string | null
          leagueId: number | null
          localizationKey: string
          rawData: Json
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          displayName: string
          id: number
          image?: string | null
          leagueId?: number | null
          localizationKey: string
          rawData: Json
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          displayName?: string
          id?: number
          image?: string | null
          leagueId?: number | null
          localizationKey?: string
          rawData?: Json
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_league"
            columns: ["leagueId"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      traits: {
        Row: {
          createdAt: string | null
          displayDescription: string | null
          displayName: string
          id: number
          localizationKeyDescription: string | null
          localizationKeyName: string
          rawData: Json
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          displayDescription?: string | null
          displayName: string
          id: number
          localizationKeyDescription?: string | null
          localizationKeyName: string
          rawData: Json
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          displayDescription?: string | null
          displayName?: string
          id?: number
          localizationKeyDescription?: string | null
          localizationKeyName?: string
          rawData?: Json
          updatedAt?: string | null
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
      set_super_admin_by_email: { Args: { _email: string }; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
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
      app_role: ["super_admin", "admin", "user"],
    },
  },
} as const
