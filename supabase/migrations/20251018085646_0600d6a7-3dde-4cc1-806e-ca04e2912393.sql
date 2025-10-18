-- Create formations table
CREATE TABLE IF NOT EXISTS public.formations (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  name_en VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  positions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Formations are viewable by everyone" 
ON public.formations 
FOR SELECT 
USING (true);

-- Insert all formations
INSERT INTO public.formations (name, name_en, category, positions) VALUES
-- 4 Defenders
('4-3-3 Tấn công', '4-3-3 Attack', '4 Hậu vệ', '["LW", "ST", "RW", "CAM", "CM", "CM", "LB", "CB", "CB", "RB", "GK"]'),
('4-3-3 Giữ bóng', '4-3-3 Holding', '4 Hậu vệ', '["LW", "ST", "RW", "CM", "CDM", "CM", "LB", "CB", "CB", "RB", "GK"]'),
('4-3-3 Phòng ngự', '4-3-3 Defend', '4 Hậu vệ', '["LW", "ST", "RW", "CDM", "CM", "CDM", "LB", "CB", "CB", "RB", "GK"]'),
('4-3-3 Cân bằng', '4-3-3 Flat', '4 Hậu vệ', '["LW", "ST", "RW", "CM", "CM", "CM", "LB", "CB", "CB", "RB", "GK"]'),
('4-1-2-1-2 Rộng', '4-1-2-1-2 Wide', '4 Hậu vệ', '["ST", "ST", "CAM", "LM", "RM", "CDM", "LB", "CB", "CB", "RB", "GK"]'),
('4-1-2-1-2 Hẹp', '4-1-2-1-2 Narrow', '4 Hậu vệ', '["ST", "ST", "CAM", "CM", "CM", "CDM", "LB", "CB", "CB", "RB", "GK"]'),
('4-4-2 Cân bằng', '4-4-2 Flat', '4 Hậu vệ', '["ST", "ST", "LM", "CM", "CM", "RM", "LB", "CB", "CB", "RB", "GK"]'),
('4-4-2 Giữ bóng', '4-4-2 Holding', '4 Hậu vệ', '["ST", "ST", "LM", "CDM", "CDM", "RM", "LB", "CB", "CB", "RB", "GK"]'),
('4-2-3-1 Rộng', '4-2-3-1 Wide', '4 Hậu vệ', '["ST", "LM", "CAM", "RM", "CDM", "CDM", "LB", "CB", "CB", "RB", "GK"]'),
('4-2-3-1 Hẹp', '4-2-3-1 Narrow', '4 Hậu vệ', '["ST", "CAM", "CAM", "CAM", "CDM", "CDM", "LB", "CB", "CB", "RB", "GK"]'),
('4-5-1', '4-5-1', '4 Hậu vệ', '["ST", "LM", "CAM", "CAM", "RM", "CM", "LB", "CB", "CB", "RB", "GK"]'),
('4-5-1 Tấn công', '4-5-1 Attack', '4 Hậu vệ', '["ST", "LF", "RF", "CM", "CM", "CDM", "LB", "CB", "CB", "RB", "GK"]'),
('4-1-4-1', '4-1-4-1', '4 Hậu vệ', '["ST", "LM", "CM", "CM", "RM", "CDM", "LB", "CB", "CB", "RB", "GK"]'),
('4-4-1-1 Tấn công', '4-4-1-1 Attack', '4 Hậu vệ', '["ST", "CF", "LM", "CM", "CM", "RM", "LB", "CB", "CB", "RB", "GK"]'),
('4-2-2-2', '4-2-2-2', '4 Hậu vệ', '["ST", "ST", "CAM", "CAM", "CDM", "CDM", "LB", "CB", "CB", "RB", "GK"]'),
('4-3-2-1', '4-3-2-1', '4 Hậu vệ', '["ST", "LF", "RF", "CM", "CM", "CM", "LB", "CB", "CB", "RB", "GK"]'),
('4-2-4', '4-2-4', '4 Hậu vệ', '["LW", "ST", "ST", "RW", "CM", "CM", "LB", "CB", "CB", "RB", "GK"]'),
-- 3 Defenders
('3-4-3 Cân bằng', '3-4-3 Flat', '3 Hậu vệ', '["LW", "ST", "RW", "LM", "CM", "CM", "RM", "CB", "CB", "CB", "GK"]'),
('3-4-3 Kim cương', '3-4-3 Diamond', '3 Hậu vệ', '["ST", "ST", "CAM", "LM", "CM", "RM", "CDM", "CB", "CB", "CB", "GK"]'),
('3-5-2', '3-5-2', '3 Hậu vệ', '["ST", "ST", "LM", "CM", "CAM", "CM", "RM", "CB", "CB", "CB", "GK"]'),
('3-5-1-1', '3-5-1-1', '3 Hậu vệ', '["ST", "CF", "LM", "CM", "CAM", "CM", "RM", "CB", "CB", "CB", "GK"]'),
('3-4-1-2', '3-4-1-2', '3 Hậu vệ', '["ST", "ST", "CAM", "LM", "CM", "CM", "RM", "CB", "CB", "CB", "GK"]'),
-- 5 Defenders
('5-2-2-1', '5-2-2-1', '5 Hậu vệ', '["ST", "LW", "RW", "CM", "CM", "LWB", "CB", "CB", "CB", "RWB", "GK"]'),
('5-4-1', '5-4-1', '5 Hậu vệ', '["ST", "LM", "CM", "CM", "RM", "LWB", "CB", "CB", "CB", "RWB", "GK"]'),
('5-3-2', '5-3-2', '5 Hậu vệ', '["ST", "ST", "CM", "CM", "CM", "LWB", "CB", "CB", "CB", "RWB", "GK"]'),
('5-2-1-2', '5-2-1-2', '5 Hậu vệ', '["ST", "ST", "CAM", "CM", "CM", "LWB", "CB", "CB", "CB", "RWB", "GK"]');