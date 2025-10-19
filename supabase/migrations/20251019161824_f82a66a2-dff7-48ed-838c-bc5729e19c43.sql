-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS public.players;

-- Tạo bảng players mới (Cấu trúc toàn diện 1-1)
CREATE TABLE public.players (
    -- Identifiers
    "assetId" BIGINT PRIMARY KEY,
    "playerId" BIGINT NOT NULL,
    "id" BIGINT,

    -- Basic Information
    "firstName" TEXT,
    "lastName" TEXT,
    "commonName" TEXT,
    "cardName" TEXT,
    "position" TEXT,
    "birthday" TIMESTAMPTZ,
    "height" INTEGER,
    "weight" INTEGER,
    "bio" TEXT,
    "source" TEXT,

    -- Core Attributes
    "rating" INTEGER NOT NULL,
    "foot" INTEGER,
    "weakFoot" INTEGER,
    "skillMovesLevel" INTEGER,
    "rank" INTEGER,

    -- Work Rates
    "workRateAtt" INTEGER,
    "workRateDef" INTEGER,

    -- Metadata & Status
    "auctionable" BOOLEAN,
    "likes" INTEGER,
    "tags" TEXT,
    "platform" TEXT,
    "isCard" BOOLEAN,
    "isSold" BOOLEAN,

    -- Timestamps from Renderz
    "added" TIMESTAMPTZ,
    "revealOn" TIMESTAMPTZ,

    -- Skills & Styles
    "skillStyleId" INTEGER,

    -- UI & Graphics
    "bindingXml" TEXT,

    -- Complex Data (JSONB)
    "stats" JSONB,
    "avgStats" JSONB,
    "avgGkStats" JSONB,
    "liveOvr" JSONB,
    "traits" JSONB,
    "skillMoves" JSONB,
    "skillStyleSkills" JSONB,
    "club" JSONB,
    "league" JSONB,
    "nation" JSONB,
    "priceData" JSONB,
    "animation" JSONB,
    "images" JSONB,
    "celebration" JSONB,
    "potentialPositions" JSONB,
    "workRates" JSONB,
    "program" JSONB,

    -- Dữ liệu gốc
    "rawData" JSONB NOT NULL,

    -- Timestamps hệ thống
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm Index
CREATE INDEX idx_players_playerid ON public.players ("playerId");
CREATE INDEX idx_players_rating ON public.players ("rating");
CREATE INDEX idx_players_commonname ON public.players ("commonName");

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Players are viewable by everyone" 
ON public.players 
FOR SELECT 
USING (true);

-- Tạo trigger cho updatedAt
CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.update_players_updated_at_camelcase();