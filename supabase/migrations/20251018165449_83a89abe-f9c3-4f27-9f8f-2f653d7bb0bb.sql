-- Tạo bảng clubs với logo
CREATE TABLE IF NOT EXISTS public.clubs (
  id SERIAL PRIMARY KEY,
  club_id INTEGER UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  name_vi VARCHAR,
  logo_url TEXT,
  league VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người xem clubs
CREATE POLICY "Clubs are viewable by everyone" 
ON public.clubs 
FOR SELECT 
USING (true);

-- Tạo bảng countries_vi để lưu tên tiếng Việt
CREATE TABLE IF NOT EXISTS public.countries_vi (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) UNIQUE NOT NULL,
  name_en VARCHAR NOT NULL,
  name_vi VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.countries_vi ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người xem countries
CREATE POLICY "Countries are viewable by everyone" 
ON public.countries_vi 
FOR SELECT 
USING (true);

-- Thêm dữ liệu các câu lạc bộ phổ biến với logo
INSERT INTO public.clubs (club_id, name, name_vi, logo_url, league) VALUES
(243, 'Manchester United', 'Manchester United', 'https://cdn.sofifa.net/teams/11/30.png', 'Premier League'),
(241, 'Manchester City', 'Manchester City', 'https://cdn.sofifa.net/teams/10/30.png', 'Premier League'),
(1, 'Arsenal', 'Arsenal', 'https://cdn.sofifa.net/teams/1/30.png', 'Premier League'),
(5, 'Liverpool', 'Liverpool', 'https://cdn.sofifa.net/teams/9/30.png', 'Premier League'),
(9, 'Chelsea', 'Chelsea', 'https://cdn.sofifa.net/teams/5/30.png', 'Premier League'),
(21, 'Tottenham Hotspur', 'Tottenham', 'https://cdn.sofifa.net/teams/18/30.png', 'Premier League'),
(73, 'Real Madrid', 'Real Madrid', 'https://cdn.sofifa.net/teams/243/30.png', 'La Liga'),
(240, 'FC Barcelona', 'Barcelona', 'https://cdn.sofifa.net/teams/241/30.png', 'La Liga'),
(244, 'Atlético Madrid', 'Atletico Madrid', 'https://cdn.sofifa.net/teams/7/30.png', 'La Liga'),
(45, 'Bayern München', 'Bayern Munich', 'https://cdn.sofifa.net/teams/21/30.png', 'Bundesliga'),
(103, 'Juventus', 'Juventus', 'https://cdn.sofifa.net/teams/45/30.png', 'Serie A'),
(44, 'Inter', 'Inter Milan', 'https://cdn.sofifa.net/teams/44/30.png', 'Serie A'),
(47, 'AC Milan', 'AC Milan', 'https://cdn.sofifa.net/teams/47/30.png', 'Serie A'),
(73, 'PSG', 'Paris Saint-Germain', 'https://cdn.sofifa.net/teams/73/30.png', 'Ligue 1')
ON CONFLICT (club_id) DO NOTHING;

-- Thêm dữ liệu các quốc gia phổ biến với tên tiếng Việt
INSERT INTO public.countries_vi (country_code, name_en, name_vi) VALUES
('ENG', 'England', 'Anh'),
('FRA', 'France', 'Pháp'),
('GER', 'Germany', 'Đức'),
('ESP', 'Spain', 'Tây Ban Nha'),
('ITA', 'Italy', 'Ý'),
('BRA', 'Brazil', 'Brazil'),
('ARG', 'Argentina', 'Argentina'),
('POR', 'Portugal', 'Bồ Đào Nha'),
('NED', 'Netherlands', 'Hà Lan'),
('BEL', 'Belgium', 'Bỉ'),
('URU', 'Uruguay', 'Uruguay'),
('CRO', 'Croatia', 'Croatia'),
('POL', 'Poland', 'Ba Lan'),
('KOR', 'South Korea', 'Hàn Quốc'),
('JPN', 'Japan', 'Nhật Bản'),
('MEX', 'Mexico', 'Mexico'),
('USA', 'United States', 'Mỹ'),
('CAN', 'Canada', 'Canada'),
('CHI', 'Chile', 'Chile'),
('COL', 'Colombia', 'Colombia'),
('VNM', 'Vietnam', 'Việt Nam')
ON CONFLICT (country_code) DO NOTHING;