-- =====================================================
-- MIGRATION: Chuyển đổi sang camelCase và tái cấu trúc bảng players
-- =====================================================

-- 1. DROP bảng players cũ
DROP TABLE IF EXISTS public.players CASCADE;

-- 2. Tạo bảng players mới với camelCase (khớp 1-1 với API Renderz)
CREATE TABLE public.players (
    -- Identifiers (Khóa chính là assetId - ID của phiên bản thẻ)
    "assetId" BIGINT PRIMARY KEY,
    "playerId" BIGINT NOT NULL,
    
    -- Basic Info
    "firstName" TEXT,
    "lastName" TEXT,
    "commonName" TEXT,
    "cardName" TEXT,
    "birthday" DATE,
    "height" INTEGER,
    "weight" INTEGER,
    "position" TEXT,
    
    -- Core Attributes
    "rating" INTEGER NOT NULL,
    "weakFoot" INTEGER,
    "foot" INTEGER,
    "skillMoves" INTEGER,
    
    -- Complex Data (JSONB - Tên cột khớp 100% với API keys)
    "stats" JSONB,
    "traits" JSONB,
    "skillStyleSkills" JSONB,
    "workRates" JSONB,
    "club" JSONB,
    "league" JSONB,
    "nation" JSONB,
    "priceData" JSONB,
    "animation" JSONB,
    "images" JSONB,
    "potentialPositions" JSONB,
    "avgStats" JSONB,
    "avgGkStats" JSONB,
    "celebration" JSONB,
    
    -- Metadata từ Renderz
    "platform" TEXT DEFAULT 'mobile',
    "auctionable" BOOLEAN DEFAULT false,
    "rank" INTEGER,
    "likes" INTEGER,
    "added" TIMESTAMPTZ,
    "revealOn" TIMESTAMPTZ,
    "source" TEXT,
    "bio" TEXT,
    "bindingXml" TEXT,
    "tags" TEXT,
    "skillStyleId" INTEGER,
    
    -- Dữ liệu gốc (Rất quan trọng cho Debugging)
    "rawData" JSONB NOT NULL,
    
    -- Timestamps hệ thống
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index để tối ưu hóa tìm kiếm
CREATE INDEX idx_players_playerid ON public.players ("playerId");
CREATE INDEX idx_players_rating ON public.players ("rating");
CREATE INDEX idx_players_commonname ON public.players ("commonName");
CREATE INDEX idx_players_position ON public.players ("position");

-- Trigger để tự động cập nhật updatedAt
CREATE OR REPLACE FUNCTION public.update_players_updated_at_camelcase()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at_trigger
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.update_players_updated_at_camelcase();

-- 3. Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Policy cho phép mọi người xem
CREATE POLICY "Players are viewable by everyone"
ON public.players
FOR SELECT
USING (true);

-- 4. Cập nhật bảng formations sang camelCase
ALTER TABLE public.formations RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.formations RENAME COLUMN name_en TO "nameEn";

-- 5. Cập nhật bảng clubs sang camelCase
ALTER TABLE public.clubs RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.clubs RENAME COLUMN logo_url TO "logoUrl";
ALTER TABLE public.clubs RENAME COLUMN name_vi TO "nameVi";
ALTER TABLE public.clubs RENAME COLUMN club_id TO "clubId";

-- 6. Cập nhật bảng countries_vi sang camelCase
ALTER TABLE public.countries_vi RENAME COLUMN name_vi TO "nameVi";
ALTER TABLE public.countries_vi RENAME COLUMN country_code TO "countryCode";
ALTER TABLE public.countries_vi RENAME COLUMN name_en TO "nameEn";
ALTER TABLE public.countries_vi RENAME COLUMN created_at TO "createdAt";

-- 7. Cập nhật bảng squads sang camelCase
ALTER TABLE public.squads RENAME COLUMN squad_name TO "squadName";
ALTER TABLE public.squads RENAME COLUMN updated_at TO "updatedAt";
ALTER TABLE public.squads RENAME COLUMN user_id TO "userId";
ALTER TABLE public.squads RENAME COLUMN created_at TO "createdAt";