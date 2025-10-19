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
          clubId: number
          createdAt: string | null
          id: number
          league: string | null
          logoUrl: string | null
          name: string
          nameVi: string | null
        }
        Insert: {
          clubId: number
          createdAt?: string | null
          id?: number
          league?: string | null
          logoUrl?: string | null
          name: string
          nameVi?: string | null
        }
        Update: {
          clubId?: number
          createdAt?: string | null
          id?: number
          league?: string | null
          logoUrl?: string | null
          name?: string
          nameVi?: string | null
        }
        Relationships: []
      }
      countries_vi: {
        Row: {
          countryCode: string
          createdAt: string | null
          id: number
          nameEn: string
          nameVi: string
        }
        Insert: {
          countryCode: string
          createdAt?: string | null
          id?: number
          nameEn: string
          nameVi: string
        }
        Update: {
          countryCode?: string
          createdAt?: string | null
          id?: number
          nameEn?: string
          nameVi?: string
        }
        Relationships: []
      }
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
