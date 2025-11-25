-- Populate localization_dictionary with all app texts
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/nhdmgiyoienkixokcoue/sql/new

INSERT INTO localization_dictionary (key, value_en, value_vi, source) VALUES

-- Common texts
('common.search_placeholder', 'Search players...', 'Tìm kiếm cầu thủ...', 'App_UI'),
('common.search', 'Search', 'Tìm kiếm', 'App_UI'),
('common.loading', 'Loading...', 'Đang tải...', 'App_UI'),
('common.no_results', 'No results found', 'Không tìm thấy kết quả', 'App_UI'),
('common.cancel', 'Cancel', 'Hủy', 'App_UI'),
('common.save', 'Save', 'Lưu', 'App_UI'),
('common.delete', 'Delete', 'Xóa', 'App_UI'),
('common.edit', 'Edit', 'Sửa', 'App_UI'),
('common.reset', 'Reset', 'Đặt lại', 'App_UI'),

-- Player attributes
('player.rating', 'OVR', 'OVR', 'App_UI'),
('player.position', 'Position', 'Vị trí', 'App_UI'),
('player.nation', 'Nation', 'Quốc gia', 'App_UI'),
('player.club', 'Club', 'Câu lạc bộ', 'App_UI'),
('player.league', 'League', 'Giải đấu', 'App_UI'),
('player.weak_foot', 'Weak Foot', 'Chân thuận', 'App_UI'),
('player.skill_moves', 'Skill Moves', 'Kỹ năng', 'App_UI'),
('player.height', 'Height', 'Chiều cao', 'App_UI'),
('player.weight', 'Weight', 'Cân nặng', 'App_UI'),

-- Player stats (full names)
('stats.pace', 'PACE', 'TỐC ĐỘ', 'App_UI'),
('stats.shooting', 'SHOOTING', 'SÚT', 'App_UI'),
('stats.passing', 'PASSING', 'CHUYỀN', 'App_UI'),
('stats.dribbling', 'DRIBBLING', 'RÊ DẮT', 'App_UI'),
('stats.defense', 'DEFENSE', 'PHÒNG NGỰ', 'App_UI'),
('stats.physicality', 'PHYSICALITY', 'THỂ LỰC', 'App_UI'),
('stats.diving', 'DIVING', 'ĐỖ NGƯƠI', 'App_UI'),
('stats.handling', 'HANDLING', 'XỬ LÝ', 'App_UI'),
('stats.kicking', 'KICKING', 'PHÁT BÓNG', 'App_UI'),
('stats.reflexes', 'REFLEXES', 'PHẢN XẠ', 'App_UI'),
('stats.speed', 'SPEED', 'TỐC ĐỘ', 'App_UI'),
('stats.positioning', 'POSITIONING', 'CHỌN VỊ TRÍ', 'App_UI'),

-- Short stat names
('stats.short.pace', 'PAC', 'TỐC', 'App_UI'),
('stats.short.shooting', 'SHO', 'SÚT', 'App_UI'),
('stats.short.passing', 'PAS', 'CHU', 'App_UI'),
('stats.short.dribbling', 'DRI', 'RÊ', 'App_UI'),
('stats.short.defense', 'DEF', 'PHÒ', 'App_UI'),
('stats.short.physicality', 'PHY', 'THỂ', 'App_UI'),
('stats.short.diving', 'DIV', 'PHÁ', 'App_UI'),
('stats.short.handling', 'HAN', 'BẮT', 'App_UI'),
('stats.short.kicking', 'KIC', 'PHÁT', 'App_UI'),
('stats.short.reflexes', 'REF', 'PHẢ', 'App_UI'),

-- Squad Builder
('squad.title', 'Squad Builder', 'Xây dựng đội hình', 'App_UI'),
('squad.select_formation', 'Select Formation', 'Chọn sơ đồ', 'App_UI'),
('squad.select_player', 'Select Player', 'Chọn cầu thủ', 'App_UI'),
('squad.add_player', 'Add Player', 'Thêm cầu thủ', 'App_UI'),
('squad.remove_player', 'Remove Player', 'Xóa cầu thủ', 'App_UI'),
('squad.save_squad', 'Save Squad', 'Lưu đội hình', 'App_UI'),
('squad.squad_name', 'Squad Name', 'Tên đội hình', 'App_UI'),
('squad.select_rank', 'Select Rank', 'Chọn Rank', 'App_UI'),
('squad.training_level', 'Training Level', 'Cấp độ Training', 'App_UI'),
('squad.alternative_position', 'Alternative Position', 'Vị trí phụ', 'App_UI'),
('squad.ovr_penalty', 'OVR Penalty', 'OVR giảm', 'App_UI'),
('squad.need_rank', 'Need Rank', 'Cần Rank', 'App_UI'),
('squad.unlock_alternative', 'to unlock alternative position', 'để mở khóa vị trí phụ', 'App_UI'),

-- Player Selection Dialog
('selection.title', 'Select Player', 'Chọn cầu thủ', 'App_UI'),
('selection.position_required', 'Position', 'Vị trí', 'App_UI'),
('selection.filters', 'FILTERS', 'BỘ LỌC', 'App_UI'),
('selection.search_name', 'Search by name...', 'Tìm theo tên...', 'App_UI'),
('selection.found', 'Found', 'Tìm thấy', 'App_UI'),
('selection.players', 'players', 'cầu thủ', 'App_UI'),
('selection.selected', 'Selected', 'Đã chọn', 'App_UI'),

-- Database page
('database.title', 'Player Database', 'Cơ sở dữ liệu cầu thủ', 'App_UI'),
('database.all_players', 'All Players', 'Tất cả cầu thủ', 'App_UI'),
('database.filter_by', 'Filter by', 'Lọc theo', 'App_UI'),
('database.sort_by', 'Sort by', 'Sắp xếp theo', 'App_UI'),
('database.showing', 'Showing', 'Hiển thị', 'App_UI'),
('database.of', 'of', 'của', 'App_UI'),

-- Positions
('position.GK', 'Goalkeeper', 'Thủ môn', 'App_UI'),
('position.LB', 'Left Back', 'Hậu vệ trái', 'App_UI'),
('position.LWB', 'Left Wing Back', 'Tiền vệ cánh trái', 'App_UI'),
('position.CB', 'Center Back', 'Trung vệ', 'App_UI'),
('position.RB', 'Right Back', 'Hậu vệ phải', 'App_UI'),
('position.RWB', 'Right Wing Back', 'Tiền vệ cánh phải', 'App_UI'),
('position.CDM', 'Defensive Midfielder', 'Tiền vệ phòng ngự', 'App_UI'),
('position.CM', 'Center Midfielder', 'Tiền vệ trung tâm', 'App_UI'),
('position.CAM', 'Attacking Midfielder', 'Tiền vệ tấn công', 'App_UI'),
('position.LM', 'Left Midfielder', 'Tiền vệ trái', 'App_UI'),
('position.RM', 'Right Midfielder', 'Tiền vệ phải', 'App_UI'),
('position.LW', 'Left Winger', 'Tiền đạo cánh trái', 'App_UI'),
('position.RW', 'Right Winger', 'Tiền đạo cánh phải', 'App_UI'),
('position.CF', 'Center Forward', 'Tiền đạo ảo', 'App_UI'),
('position.ST', 'Striker', 'Tiền đạo', 'App_UI'),
('position.LF', 'Left Forward', 'Tiền đạo lệch trái', 'App_UI'),
('position.RF', 'Right Forward', 'Tiền đạo lệch phải', 'App_UI'),

-- Sort options
('sort.newest', 'Newest', 'Mới nhất', 'App_UI'),
('sort.rating_desc', 'OVR High to Low', 'OVR cao đến thấp', 'App_UI'),
('sort.rating_asc', 'OVR Low to High', 'OVR thấp đến cao', 'App_UI'),
('sort.name_asc', 'Name A-Z', 'Tên A-Z', 'App_UI'),
('sort.name_desc', 'Name Z-A', 'Tên Z-A', 'App_UI')

ON CONFLICT (key) DO UPDATE SET
  value_en = EXCLUDED.value_en,
  value_vi = EXCLUDED.value_vi,
  source = EXCLUDED.source,
  "updatedAt" = NOW();
