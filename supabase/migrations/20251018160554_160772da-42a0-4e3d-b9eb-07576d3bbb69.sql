-- Sửa lại 3-4-3 Kim cương: LW, ST, RW, CAM, LM, RM, CDM, CB, CB, CB, GK
UPDATE formations 
SET positions = '["LW", "ST", "RW", "CAM", "LM", "RM", "CDM", "CB", "CB", "CB", "GK"]'::jsonb
WHERE id = 19;