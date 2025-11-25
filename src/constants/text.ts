// Text constants for multilingual support
// Future: Replace with i18n library and translation files

export const TEXT = {
  // Common
  SEARCH_PLACEHOLDER: "Tìm kiếm cầu thủ...",
  SEARCH: "Tìm kiếm",
  LOADING: "Đang tải...",
  NO_RESULTS: "Không tìm thấy kết quả",
  CANCEL: "Hủy",
  SAVE: "Lưu",
  DELETE: "Xóa",
  EDIT: "Sửa",
  RESET: "Đặt lại",
  
  // Player attributes
  RATING: "OVR",
  POSITION: "Vị trí",
  NATION: "Quốc gia",
  CLUB: "Câu lạc bộ",
  LEAGUE: "Giải đấu",
  WEAK_FOOT: "Chân thuận",
  SKILL_MOVES: "Kỹ năng",
  HEIGHT: "Chiều cao",
  WEIGHT: "Cân nặng",
  
  // Player stats
  STATS: {
    PACE: "TỐC ĐỘ",
    SHOOTING: "SÚT",
    PASSING: "CHUYỀN",
    DRIBBLING: "RÊ DẮT",
    DEFENSE: "PHÒNG NGỰ",
    PHYSICALITY: "THỂ LỰC",
    DIVING: "ĐỖ NGƯƠI",
    HANDLING: "XỬ LÝ",
    KICKING: "PHÁT BÓNG",
    REFLEXES: "PHẢN XẠ",
    SPEED: "TỐC ĐỘ",
    POSITIONING: "CHỌN VỊ TRÍ",
    // Short versions for compact display
    SHORT: {
      PACE: "TỐC",
      SHOOTING: "SÚT",
      PASSING: "CHU",
      DRIBBLING: "RÊ",
      DEFENSE: "PHÒ",
      PHYSICALITY: "THỂ",
      DIVING: "PHÁ",
      HANDLING: "BẮT",
      KICKING: "PHÁT",
      REFLEXES: "PHẢ",
    }
  },
  
  // Squad Builder
  SQUAD_BUILDER: {
    TITLE: "Xây dựng đội hình",
    SELECT_FORMATION: "Chọn sơ đồ",
    SELECT_PLAYER: "Chọn cầu thủ",
    ADD_PLAYER: "Thêm cầu thủ",
    REMOVE_PLAYER: "Xóa cầu thủ",
    SAVE_SQUAD: "Lưu đội hình",
    SQUAD_NAME: "Tên đội hình",
    SELECT_RANK: "Chọn Rank",
    TRAINING_LEVEL: "Cấp độ Training",
    ALTERNATIVE_POSITION: "Vị trí phụ",
    OVR_PENALTY: "OVR giảm",
    NEED_RANK: "Cần Rank",
    UNLOCK_ALTERNATIVE: "để mở khóa vị trí phụ",
  },
  
  // Player Selection Dialog
  PLAYER_SELECTION: {
    TITLE: "Chọn cầu thủ",
    POSITION_REQUIRED: "Vị trí",
    FILTERS: "BỘ LỌC",
    SEARCH_NAME: "Tìm theo tên...",
    FOUND: "Tìm thấy",
    PLAYERS: "cầu thủ",
    SELECTED: "Đã chọn",
    RANK_WARNING: "Rank {rank}: OVR giảm {penalty} • Cần Rank 2+ để mở khóa vị trí phụ",
    RANK_INFO: "Rank {rank}: OVR giảm {penalty} khi chơi vị trí phụ",
  },
  
  // Database page
  DATABASE: {
    TITLE: "Cơ sở dữ liệu cầu thủ",
    ALL_PLAYERS: "Tất cả cầu thủ",
    FILTER_BY: "Lọc theo",
    SORT_BY: "Sắp xếp theo",
    SHOWING: "Hiển thị",
    OF: "của",
  },
  
  // Positions in Vietnamese
  POSITIONS: {
    GK: "Thủ môn",
    LB: "Hậu vệ trái",
    LWB: "Tiền vệ cánh trái",
    CB: "Trung vệ",
    RB: "Hậu vệ phải",
    RWB: "Tiền vệ cánh phải",
    CDM: "Tiền vệ phòng ngự",
    CM: "Tiền vệ trung tâm",
    CAM: "Tiền vệ tấn công",
    LM: "Tiền vệ trái",
    RM: "Tiền vệ phải",
    LW: "Tiền đạo cánh trái",
    RW: "Tiền đạo cánh phải",
    CF: "Tiền đạo ảo",
    ST: "Tiền đạo",
    LF: "Tiền đạo lệch trái",
    RF: "Tiền đạo lệch phải",
  },
  
  // Sort options
  SORT_OPTIONS: {
    NEWEST: "Mới nhất",
    RATING_DESC: "OVR cao đến thấp",
    RATING_ASC: "OVR thấp đến cao",
    NAME_ASC: "Tên A-Z",
    NAME_DESC: "Tên Z-A",
  },
} as const;
