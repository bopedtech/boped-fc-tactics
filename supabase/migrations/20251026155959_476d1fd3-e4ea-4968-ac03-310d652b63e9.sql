-- Chuẩn hóa bảng skillMoves với camelCase và kiểu dữ liệu chính xác
-- Xử lý trường hợp bảng có thể đã tồn tại với lowercase columns

-- 1. Tạo bảng nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS public.skillmoves (
    id BIGINT PRIMARY KEY,
    "displayName" TEXT,
    "displayDescription" TEXT,
    "localizationKeyName" TEXT,
    "localizationKeyDescription" TEXT,
    stars INTEGER,
    "mediaUrl" TEXT,
    "rawData" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Chuẩn hóa tên cột sang camelCase (nếu cần)
DO $$
BEGIN
    -- displayName
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='skillmoves' AND column_name='displayname') THEN
        ALTER TABLE public.skillmoves RENAME COLUMN displayname TO "displayName";
    END IF;
    
    -- displayDescription
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='skillmoves' AND column_name='displaydescription') THEN
        ALTER TABLE public.skillmoves RENAME COLUMN displaydescription TO "displayDescription";
    END IF;
    
    -- localizationKeyName
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='skillmoves' AND column_name='localizationkeyname') THEN
        ALTER TABLE public.skillmoves RENAME COLUMN localizationkeyname TO "localizationKeyName";
    END IF;
    
    -- localizationKeyDescription
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='skillmoves' AND column_name='localizationkeydescription') THEN
        ALTER TABLE public.skillmoves RENAME COLUMN localizationkeydescription TO "localizationKeyDescription";
    END IF;
    
    -- mediaUrl
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='skillmoves' AND column_name='mediaurl') THEN
        ALTER TABLE public.skillmoves RENAME COLUMN mediaurl TO "mediaUrl";
    END IF;
    
    -- rawData
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='skillmoves' AND column_name='rawdata') THEN
        ALTER TABLE public.skillmoves RENAME COLUMN rawdata TO "rawData";
    END IF;
    
    -- createdAt
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='skillmoves' AND column_name='createdat') THEN
        ALTER TABLE public.skillmoves RENAME COLUMN createdat TO "createdAt";
    END IF;
    
    -- updatedAt
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='skillmoves' AND column_name='updatedat') THEN
        ALTER TABLE public.skillmoves RENAME COLUMN updatedat TO "updatedAt";
    END IF;
END $$;

-- 3. Áp dụng ràng buộc NOT NULL
ALTER TABLE public.skillmoves ALTER COLUMN "displayName" SET NOT NULL;
ALTER TABLE public.skillmoves ALTER COLUMN "localizationKeyName" SET NOT NULL;
ALTER TABLE public.skillmoves ALTER COLUMN "rawData" SET NOT NULL;

-- 4. Đảm bảo RLS policy
ALTER TABLE public.skillmoves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SkillMoves are viewable by everyone" ON public.skillmoves;
CREATE POLICY "SkillMoves are viewable by everyone" 
ON public.skillmoves 
FOR SELECT 
USING (true);