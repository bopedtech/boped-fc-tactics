-- Sửa lại 3-4-3 Kim cương: ST, CAM, LM, CM, RM, CDM, CB, CB, CB, GK (thiếu 1 vị trí)
-- Sơ đồ 3-4-3 Kim cương đúng nên là: 2 ST, CAM, LM, RM, CDM, 3 CB, GK
UPDATE formations 
SET positions = '["ST", "ST", "CAM", "LM", "RM", "CDM", "CB", "CB", "CB", "GK"]'::jsonb
WHERE id = 19;