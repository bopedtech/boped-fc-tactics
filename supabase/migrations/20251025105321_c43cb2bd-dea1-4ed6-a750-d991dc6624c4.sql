-- Create Nations table
CREATE TABLE IF NOT EXISTS public.nations (
    "id" BIGINT PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "localizationKey" TEXT NOT NULL,
    "image" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.nations IS 'Lưu trữ thông tin Quốc gia từ Renderz API, đã được làm giàu với tên tiếng Anh.';

-- Enable RLS for Nations
ALTER TABLE public.nations ENABLE ROW LEVEL SECURITY;

-- Create policy for Nations (viewable by everyone)
CREATE POLICY "Nations are viewable by everyone"
ON public.nations
FOR SELECT
USING (true);

-- Create Teams table with foreign key to leagues
CREATE TABLE IF NOT EXISTS public.teams (
    "id" BIGINT PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "localizationKey" TEXT NOT NULL,
    "image" TEXT,
    "leagueId" BIGINT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_league FOREIGN KEY("leagueId") REFERENCES public.leagues("id")
);

COMMENT ON TABLE public.teams IS 'Lưu trữ thông tin Câu lạc bộ từ Renderz API, liên kết với Leagues và đã được làm giàu tên tiếng Anh.';

-- Enable RLS for Teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policy for Teams (viewable by everyone)
CREATE POLICY "Teams are viewable by everyone"
ON public.teams
FOR SELECT
USING (true);

-- Create Traits table with dual localization keys
CREATE TABLE IF NOT EXISTS public.traits (
    "id" BIGINT PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "displayDescription" TEXT,
    "localizationKeyName" TEXT NOT NULL,
    "localizationKeyDescription" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.traits IS 'Lưu trữ thông tin Đặc điểm cầu thủ, với cả Tên và Mô tả đã được dịch sang tiếng Anh.';

-- Enable RLS for Traits
ALTER TABLE public.traits ENABLE ROW LEVEL SECURITY;

-- Create policy for Traits (viewable by everyone)
CREATE POLICY "Traits are viewable by everyone"
ON public.traits
FOR SELECT
USING (true);