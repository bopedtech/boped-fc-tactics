-- Drop existing clubs table and recreate with new schema
DROP TABLE IF EXISTS public.clubs CASCADE;

-- 1. Bảng Programs (Mùa thẻ)
CREATE TABLE IF NOT EXISTS public.programs (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "sort" INTEGER,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Clubs (Câu lạc bộ) - Schema mới
CREATE TABLE public.clubs (
    "id" BIGINT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Leagues (Giải đấu)
CREATE TABLE IF NOT EXISTS public.leagues (
    "id" BIGINT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Nations (Quốc gia)
CREATE TABLE IF NOT EXISTS public.nations (
    "id" BIGINT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nations ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Programs are viewable by everyone" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Leagues are viewable by everyone" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Nations are viewable by everyone" ON public.nations FOR SELECT USING (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_metadata_updated_at();

CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_metadata_updated_at();

CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_metadata_updated_at();

CREATE TRIGGER update_nations_updated_at
  BEFORE UPDATE ON public.nations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_metadata_updated_at();