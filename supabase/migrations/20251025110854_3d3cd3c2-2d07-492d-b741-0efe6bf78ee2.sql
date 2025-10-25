-- Create Programs table
CREATE TABLE IF NOT EXISTS public.programs (
    "id" BIGINT PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "localizationKey" TEXT NOT NULL,
    "image" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.programs IS 'Lưu trữ thông tin các Chương trình/Sự kiện từ Renderz API, đã được làm giàu với tên tiếng Anh.';

-- Enable RLS for Programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Create policy for Programs (viewable by everyone)
CREATE POLICY "Programs are viewable by everyone"
ON public.programs
FOR SELECT
USING (true);