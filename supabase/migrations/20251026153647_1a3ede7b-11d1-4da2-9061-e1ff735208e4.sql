-- Create Celebrations table
CREATE TABLE IF NOT EXISTS public.celebrations (
    "id" BIGINT PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "displayDescription" TEXT,
    "localizationKeyName" TEXT NOT NULL,
    "localizationKeyDescription" TEXT,
    "mediaUrl" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.celebrations IS 'Lưu trữ thông tin Ăn mừng, với Tên và Mô tả đã được dịch sang tiếng Anh.';

-- Enable RLS for celebrations
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for celebrations (public read access)
CREATE POLICY "Celebrations are viewable by everyone" 
ON public.celebrations 
FOR SELECT 
USING (true);

-- Create SkillMoves table
CREATE TABLE IF NOT EXISTS public.skillMoves (
    "id" BIGINT PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "displayDescription" TEXT,
    "localizationKeyName" TEXT NOT NULL,
    "localizationKeyDescription" TEXT,
    "stars" INTEGER,
    "mediaUrl" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.skillMoves IS 'Lưu trữ thông tin Kỹ năng cầu thủ, bao gồm số sao và bản dịch tiếng Anh.';

-- Enable RLS for skillMoves
ALTER TABLE public.skillMoves ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for skillMoves (public read access)
CREATE POLICY "SkillMoves are viewable by everyone" 
ON public.skillMoves 
FOR SELECT 
USING (true);

-- Create trigger for celebrations updatedAt
CREATE TRIGGER update_celebrations_updated_at
BEFORE UPDATE ON public.celebrations
FOR EACH ROW
EXECUTE FUNCTION public.update_metadata_updated_at();

-- Create trigger for skillMoves updatedAt
CREATE TRIGGER update_skillmoves_updated_at
BEFORE UPDATE ON public.skillMoves
FOR EACH ROW
EXECUTE FUNCTION public.update_metadata_updated_at();