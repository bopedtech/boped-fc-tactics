-- Tạo bảng leagues với Composite Primary Key
CREATE TABLE public.leagues (
    -- Khóa từ Renderz
    "id" BIGINT NOT NULL,
    -- Khóa ngữ cảnh (Context Key) - Rất quan trọng
    "seasonId" INTEGER NOT NULL,

    -- Các trường dữ liệu từ API
    "name" TEXT NOT NULL,
    "image" TEXT,

    -- System Fields (Theo quy ước dự án)
    "rawData" JSONB NOT NULL, -- Lưu trữ toàn bộ JSON gốc của object
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Định nghĩa Khóa chính Kết hợp (Composite Primary Key)
    -- Đảm bảo tính duy nhất của một League trong một Season cụ thể
    PRIMARY KEY ("id", "seasonId")
);

-- Tạo index cho seasonId để tối ưu query theo season
CREATE INDEX idx_leagues_season ON public.leagues("seasonId");

-- Enable RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Policy cho phép mọi người xem
CREATE POLICY "Leagues are viewable by everyone" 
ON public.leagues 
FOR SELECT 
USING (true);

-- Trigger tự động cập nhật updatedAt
CREATE TRIGGER update_leagues_updated_at
BEFORE UPDATE ON public.leagues
FOR EACH ROW
EXECUTE FUNCTION public.update_players_updated_at();

COMMENT ON TABLE public.leagues IS 'Lưu trữ thông tin các giải đấu (Leagues) từ Renderz API, được phân biệt rõ ràng theo từng Season ID.';