-- Migration to change programs.id from BIGINT to TEXT
-- Renderz API returns string IDs like 'PROGRAM_HEROS8'

-- 1. Create new table with correct schema
CREATE TABLE public.programs_new (
    "id" TEXT PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "localizationKey" TEXT NOT NULL,
    "image" TEXT,
    "rawData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Copy data from old table (if exists)
INSERT INTO public.programs_new ("id", "displayName", "localizationKey", "image", "rawData", "createdAt", "updatedAt")
SELECT 
    CAST("id" AS TEXT), 
    "displayName", 
    "localizationKey", 
    "image", 
    COALESCE("rawData", '{}'), 
    COALESCE("createdAt", NOW()), 
    COALESCE("updatedAt", NOW())
FROM public.programs
ON CONFLICT DO NOTHING;

-- 3. Drop old table
DROP TABLE IF EXISTS public.programs;

-- 4. Rename new table
ALTER TABLE public.programs_new RENAME TO programs;

-- 5. Enable RLS
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- 6. Create policy
CREATE POLICY "Programs are viewable by everyone"
ON public.programs
FOR SELECT
USING (true);

COMMENT ON TABLE public.programs IS 'Lưu trữ thông tin các Chương trình/Sự kiện từ Renderz API, đã được làm giàu với tên tiếng Anh.';
