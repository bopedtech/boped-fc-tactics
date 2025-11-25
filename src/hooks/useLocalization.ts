import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

type LocalizationDictionary = Record<string, { en: string; vi: string }>;

// Static fallback dictionary for UI texts & stats labels
const STATIC_DICTIONARY: LocalizationDictionary = {
  // Stat groups - outfield
  "stats.pace": { en: "Pace", vi: "Tốc độ" },
  "stats.shooting": { en: "Shooting", vi: "Sút" },
  "stats.passing": { en: "Passing", vi: "Chuyền" },
  "stats.dribbling": { en: "Dribbling", vi: "Rê dắt" },
  "stats.defense": { en: "Defense", vi: "Phòng ngự" },
  "stats.physicality": { en: "Physicality", vi: "Thể lực" },

  // Detailed stats - pace
  "stats.acc": { en: "Acceleration", vi: "Tăng tốc" },
  "stats.spd": { en: "Sprint speed", vi: "Tốc độ chạy" },

  // Detailed stats - shooting
  "stats.pos": { en: "Positioning", vi: "Chọn vị trí" },
  "stats.fin": { en: "Finishing", vi: "Dứt điểm" },
  "stats.sho": { en: "Shot power", vi: "Lực sút" },
  "stats.lsa": { en: "Long shots", vi: "Sút xa" },
  "stats.vol": { en: "Volleys", vi: "Vô lê" },
  "stats.pen": { en: "Penalties", vi: "Phạt đền" },

  // Detailed stats - passing
  "stats.vis": { en: "Vision", vi: "Tầm nhìn" },
  "stats.cro": { en: "Crossing", vi: "Tạt bóng" },
  "stats.frk": { en: "Free kick accuracy", vi: "Đá phạt" },
  "stats.spa": { en: "Short passing", vi: "Chuyền ngắn" },
  "stats.lpa": { en: "Long passing", vi: "Chuyền dài" },
  "stats.cur": { en: "Curve", vi: "Sút xoáy" },

  // Detailed stats - dribbling
  "stats.agi": { en: "Agility", vi: "Khéo léo" },
  "stats.bal": { en: "Balance", vi: "Cân bằng" },
  "stats.rea": { en: "Reactions", vi: "Phản ứng" },
  "stats.bac": { en: "Ball control", vi: "Kiểm soát bóng" },
  "stats.dri": { en: "Dribbling", vi: "Rê dắt" },
  "stats.awr": { en: "Composure", vi: "Bình tĩnh" },

  // Detailed stats - defense
  "stats.mrk": { en: "Marking", vi: "Cắt bóng" },
  "stats.hea": { en: "Heading accuracy", vi: "Đánh đầu" },
  "stats.stt": { en: "Standing tackle", vi: "Tranh bóng đứng" },
  "stats.slt": { en: "Sliding tackle", vi: "Xoạc bóng" },

  // Detailed stats - physicality
  "stats.jmp": { en: "Jumping", vi: "Nhảy" },
  "stats.sta": { en: "Stamina", vi: "Sức bền" },
  "stats.str": { en: "Strength", vi: "Sức mạnh" },
  "stats.agg": { en: "Aggression", vi: "Quyết đoán" },

  // GK stats
  "stats.diving": { en: "Diving", vi: "Đổ người" },
  "stats.positioning": { en: "Positioning", vi: "Chọn vị trí" },
  "stats.handling": { en: "Handling", vi: "Xử lý" },
  "stats.reflexes": { en: "Reflexes", vi: "Phản xạ" },
  "stats.kicking": { en: "Kicking", vi: "Phát bóng" },
  "stats.speed": { en: "Speed", vi: "Tốc độ" },
  "stats.gkd": { en: "GK diving", vi: "Bắt bóng" },
  "stats.han": { en: "GK handling", vi: "Xử lý" },
  "stats.gkk": { en: "GK kicking", vi: "Sút" },
  "stats.ref": { en: "GK reflexes", vi: "Phản xạ" },
  "stats.gkp": { en: "GK positioning", vi: "Vị trí" },

  // Player generic
  "player.nation": { en: "Nation", vi: "Quốc gia" },
  "player.club": { en: "Club", vi: "Câu lạc bộ" },
  "player.league": { en: "League", vi: "Giải đấu" },

  // Player detail tabs & sections
  "player.detail.tabs.info": { en: "Info", vi: "Thông tin" },
  "player.detail.tabs.stats": { en: "Stats", vi: "Chỉ số" },
  "player.detail.height": { en: "Height", vi: "Chiều cao" },
  "player.detail.weight": { en: "Weight", vi: "Cân nặng" },
  "player.detail.preferredFoot": { en: "Preferred foot", vi: "Chân thuận" },
  "player.detail.skillMoves": { en: "Skill moves", vi: "Kỹ năng" },
  "player.detail.team": { en: "Club", vi: "Câu lạc bộ" },
  "player.detail.league": { en: "League", vi: "Giải đấu" },
  "player.detail.nation": { en: "Nation", vi: "Quốc tịch" },
  "player.detail.workRates": { en: "Work rates", vi: "Tốc độ làm việc" },
  "player.detail.workRates.attack": { en: "Attack:", vi: "Tấn công:" },
  "player.detail.workRates.defense": { en: "Defense:", vi: "Phòng thủ:" },
  "player.detail.altPositions": { en: "Alternative positions", vi: "Vị trí thay thế" },
  "player.detail.traits": { en: "Traits", vi: "Đặc điểm" },
  "player.detail.skillMoves.label": { en: "Skill move", vi: "Động tác kỹ thuật" },
  "player.detail.celebration.label": { en: "Celebration", vi: "Ăn mừng" },
  "player.detail.noData": { en: "No data", vi: "Không có dữ liệu" },
  "player.detail.hiddenStats": { en: "Hidden stats", vi: "Chỉ số ẩn" },

  // Index page
  "index.widgets.title": { en: "Utilities", vi: "Tiện ích" },
  "index.widgets.searchPlayer": { en: "Find players", vi: "Tìm cầu thủ" },
  "index.widgets.builder": { en: "Squad builder", vi: "Xây đội hình" },
  "index.widgets.mySquads": { en: "My squads", vi: "Đội hình của tôi" },
  "index.widgets.fcmobileCode": { en: "FC Mobile codes", vi: "Code FC Mobile" },
  "index.latestPlayers.title": { en: "Latest players", vi: "Cầu thủ mới nhất" },
  "index.latestPlayers.subtitle": { en: "Recently updated players", vi: "Những cầu thủ được cập nhật gần đây" },
  "index.latestPlayers.viewAll": { en: "View all", vi: "Xem tất cả" },

  // Admin dashboard
  "admin.dashboard.toast.error": { en: "Failed to load statistics", vi: "Không thể tải thống kê" },
  "admin.dashboard.title": { en: "Dashboard", vi: "Dashboard" },
  "admin.dashboard.subtitle": { en: "System overview and quick stats", vi: "Tổng quan hệ thống và thống kê nhanh" },
  "admin.dashboard.totalPlayers.title": { en: "Total players", vi: "Tổng cầu thủ" },
  "admin.dashboard.totalPlayers.description": { en: "Players in database", vi: "Cầu thủ trong database" },
  "admin.dashboard.totalUsers.title": { en: "Users", vi: "Người dùng" },
  "admin.dashboard.totalUsers.description": { en: "Registered accounts", vi: "Tài khoản đã đăng ký" },
  "admin.dashboard.totalSquads.title": { en: "Squads", vi: "Đội hình" },
  "admin.dashboard.totalSquads.description": { en: "Created squads", vi: "Đội hình đã tạo" },
  "admin.dashboard.totalLeagues.title": { en: "Leagues", vi: "Giải đấu" },
  "admin.dashboard.totalLeagues.description": { en: "Leagues in system", vi: "Giải đấu trong hệ thống" },
  "admin.dashboard.totalTeams.title": { en: "Clubs", vi: "Câu lạc bộ" },
  "admin.dashboard.totalTeams.description": { en: "Clubs in database", vi: "CLB trong database" },
  "admin.dashboard.totalNations.title": { en: "Nations", vi: "Quốc gia" },
  "admin.dashboard.totalNations.description": { en: "Nations in system", vi: "Quốc gia trong hệ thống" },
  "admin.dashboard.recentActivity.title": { en: "Recent activity", vi: "Hoạt động gần đây" },
  "admin.dashboard.recentActivity.subtitle": { en: "Track important system events", vi: "Theo dõi các hoạt động quan trọng trong hệ thống" },
  "admin.dashboard.recentActivity.systemStatus.title": { en: "System is running normally", vi: "Hệ thống đang hoạt động bình thường" },
  "admin.dashboard.recentActivity.systemStatus.subtitle": { en: "All services are online", vi: "Tất cả dịch vụ đang online" },
  "admin.dashboard.recentActivity.databaseUpdated.title": { en: "Database updated", vi: "Database đã được cập nhật" },
  "admin.dashboard.recentActivity.databaseUpdated.subtitle": { en: "Latest player data", vi: "Dữ liệu cầu thủ mới nhất" },
};

const FALLBACK_LOCALE = "vi"; // Default to Vietnamese

export function useLocalization() {
  const [dictionary, setDictionary] = useState<LocalizationDictionary>({});
  const [locale, setLocale] = useState<"en" | "vi">(FALLBACK_LOCALE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDictionary();
  }, []);

  const fetchDictionary = async () => {
    try {
      const { data, error } = await supabase
        .from("localization_dictionary")
        .select("key, value_en, value_vi");

      if (error) throw error;

      const dict: LocalizationDictionary = {};
      data?.forEach((item) => {
        dict[item.key] = {
          en: item.value_en,
          vi: item.value_vi || item.value_en,
        };
      });

      // Merge static dictionary (UI + stats) without overriding remote values
      Object.entries(STATIC_DICTIONARY).forEach(([key, value]) => {
        if (!dict[key]) {
          dict[key] = value;
        }
      });

      console.log("📚 Localization dictionary loaded:", Object.keys(dict).length, "keys");
      setDictionary(dict);
    } catch (error) {
      console.error("❌ Error fetching localization dictionary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize t function với dependency là locale để force re-render
  const t = useMemo(() => {
    return (key: string, fallback?: string): string => {
      if (!dictionary[key]) {
        // Return fallback hoặc key, không log warning nữa để tránh spam
        return fallback || key;
      }
      return dictionary[key][locale] || dictionary[key].en || fallback || key;
    };
  }, [dictionary, locale]);

  const changeLocale = (newLocale: "en" | "vi") => {
    console.log(`🌐 Changing locale from ${locale} to ${newLocale}`);
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    
    // Force page reload để apply ngôn ngữ mới cho toàn bộ app
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Load saved locale from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as "en" | "vi";
    if (savedLocale) {
      console.log(`💾 Loaded saved locale: ${savedLocale}`);
      setLocale(savedLocale);
    }
  }, []);

  return {
    t,
    locale,
    changeLocale,
    loading,
  };
}
