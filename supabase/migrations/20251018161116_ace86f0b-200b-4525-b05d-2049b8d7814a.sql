-- Sửa lại 4-5-1: ST, LM, CAM, CAM, CM, RM, LB, CB, CB, RB, GK
UPDATE formations 
SET positions = '["ST", "LM", "CAM", "CAM", "CM", "RM", "LB", "CB", "CB", "RB", "GK"]'::jsonb
WHERE id = 11;