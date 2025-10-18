-- Fix 3-4-3 Kim cương: có 2 ST thừa, nên để 1 ST và 1 CM
UPDATE formations 
SET positions = '["ST", "CAM", "LM", "CM", "RM", "CDM", "CB", "CB", "CB", "GK"]'::jsonb
WHERE id = 19;

-- Kiểm tra lại 4-5-1: có CAM xuất hiện 2 lần và CM 1 lần
UPDATE formations 
SET positions = '["ST", "LM", "CAM", "CM", "RM", "CDM", "LB", "CB", "CB", "RB", "GK"]'::jsonb
WHERE id = 11;