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

  // Header
  "header.nav.home": { en: "Home", vi: "Trang chủ" },
  "header.nav.database": { en: "Player database", vi: "Danh sách cầu thủ" },
  "header.nav.builder": { en: "Squad builder", vi: "Xây dựng đội hình" },
  "header.nav.news": { en: "News", vi: "Bảng tin" },
  "header.user.profile": { en: "Profile", vi: "Cá nhân" },
  "header.user.admin": { en: "Admin panel", vi: "Quản trị hệ thống" },
  "header.user.logout": { en: "Logout", vi: "Đăng xuất" },
  "header.auth.login": { en: "Login", vi: "Đăng nhập" },
  "header.auth.signup": { en: "Sign up", vi: "Đăng ký" },
  "header.toast.logoutSuccess": { en: "Logged out successfully", vi: "Đăng xuất thành công" },

  // Footer
  "footer.company.tagline": { en: "Together with FC Mobile", vi: "Đồng hành cùng FC Mobile" },
  "footer.company.description": { en: "Leading platform for player database, squad builder tools and FC Mobile news. Help gamers optimize their squads and enhance gaming experience.", vi: "Nền tảng hàng đầu về cơ sở dữ liệu cầu thủ, công cụ xây dựng đội hình và tin tức FC Mobile. Giúp game thủ tối ưu đội hình và nâng cao trải nghiệm chơi game." },
  "footer.quickLinks.title": { en: "Quick Links", vi: "Liên Kết Nhanh" },
  "footer.quickLinks.database": { en: "Player database", vi: "Cơ sở dữ liệu cầu thủ" },
  "footer.quickLinks.builder": { en: "Squad Builder", vi: "Squad Builder" },
  "footer.quickLinks.mySquads": { en: "My squads", vi: "Đội hình của tôi" },
  "footer.quickLinks.news": { en: "News", vi: "Bảng tin" },
  "footer.quickLinks.profile": { en: "Profile", vi: "Trang cá nhân" },
  "footer.contact.title": { en: "Contact Information", vi: "Thông Tin Liên Hệ" },
  "footer.contact.hotline": { en: "Hotline:", vi: "Hotline:" },
  "footer.contact.email": { en: "Contact email:", vi: "Email liên hệ:" },
  "footer.social.title": { en: "Connect With Us", vi: "Kết Nối Với Chúng Tôi" },
  "footer.social.description": { en: "Follow us for the latest updates about FC Mobile and promotional programs.", vi: "Theo dõi chúng tôi để cập nhật thông tin mới nhất về FC Mobile và các chương trình ưu đãi." },
  "footer.developer": { en: "Website developed by", vi: "Website được phát triển bởi" },
  "footer.copyright": { en: "All Rights Reserved.", vi: "All Rights Reserved." },

  // Database page
  "database.title": { en: "FC Mobile Player List", vi: "Danh sách cầu thủ FC Mobile" },
  "database.subtitle": { en: "Discover and search players for your FC Mobile squad", vi: "Khám phá và tìm kiếm cầu thủ cho đội hình FC Mobile của bạn" },
  "database.filters": { en: "Filters", vi: "Bộ lọc" },
  "database.searchByName": { en: "Search by name...", vi: "Tìm theo tên..." },
  "database.showing": { en: "Showing", vi: "Hiển thị" },
  "database.of": { en: "of", vi: "/" },
  "database.players": { en: "players", vi: "cầu thủ" },
  "database.sort": { en: "Sort", vi: "Sắp xếp" },
  "database.sort.newest": { en: "Newest", vi: "Mới nhất" },
  "database.sort.oldest": { en: "Oldest", vi: "Cũ nhất" },
  "database.sort.ratingDesc": { en: "OVR high → low", vi: "OVR cao → thấp" },
  "database.sort.ratingAsc": { en: "OVR low → high", vi: "OVR thấp → cao" },
  "database.sort.nameAsc": { en: "Name A → Z", vi: "Tên A → Z" },
  "database.sort.nameDesc": { en: "Name Z → A", vi: "Tên Z → A" },
  "database.noResults": { en: "No players found", vi: "Không tìm thấy cầu thủ nào" },
  "database.error": { en: "Error loading data", vi: "Có lỗi xảy ra khi tải dữ liệu" },
  "database.loadingMore": { en: "Loading more...", vi: "Đang tải thêm..." },
  "database.loadMore": { en: "Load more players", vi: "Tải thêm cầu thủ" },
  "database.allLoaded": { en: "Showing all", vi: "Đã hiển thị tất cả" },

  // Squad Builder
  "builder.title": { en: "Build FC Mobile Squad", vi: "Xây dựng đội hình FC Mobile" },
  "builder.subtitle": { en: "Create optimal squad for FC Mobile", vi: "Tạo đội hình tối ưu cho FC Mobile" },
  "builder.squadInfo": { en: "Squad information", vi: "Thông tin đội hình" },
  "builder.totalOvr": { en: "Total OVR", vi: "Chỉ số tổng OVR" },
  "builder.squadName": { en: "Squad name", vi: "Tên đội hình" },
  "builder.squadNamePlaceholder": { en: "My squad...", vi: "Đội hình của tôi..." },
  "builder.formation": { en: "Formation", vi: "Sơ đồ chiến thuật" },
  "builder.formationPlaceholder": { en: "Select formation...", vi: "Chọn sơ đồ..." },
  "builder.clearSquad": { en: "Clear squad", vi: "Xóa đội hình" },
  "builder.aiAdvice": { en: "AI Advice", vi: "Tư vấn AI" },
  "builder.saveSquad": { en: "Save squad", vi: "Lưu đội hình" },
  "builder.clickToAdd": { en: "💡 Click on positions to add players to squad", vi: "💡 Nhấp vào vị trí để thêm cầu thủ vào đội hình" },
  "builder.selectFormation": { en: "Select formation", vi: "Chọn sơ đồ" },
  "builder.toast.loginRequired": { en: "Please login to use Squad Builder", vi: "Vui lòng đăng nhập để sử dụng Squad Builder" },
  "builder.toast.formationLoadError": { en: "Cannot load formations", vi: "Không thể tải sơ đồ chiến thuật" },
  "builder.toast.playerAdded": { en: "Added {player} (Rank {rank}, Training {training}) to squad", vi: "Đã thêm {player} (Rank {rank}, Training {training}) vào đội hình" },
  "builder.toast.squadCleared": { en: "Squad cleared", vi: "Đã xóa toàn bộ đội hình" },
  "builder.toast.nameRequired": { en: "Please enter squad name", vi: "Vui lòng nhập tên đội hình" },
  "builder.toast.incomplete": { en: "Squad needs 11 players ({filled}/11)", vi: "Đội hình chưa đủ 11 cầu thủ ({filled}/11)" },
  "builder.toast.loginFirst": { en: "Please login", vi: "Vui lòng đăng nhập" },
  "builder.toast.saveError": { en: "Cannot save squad", vi: "Không thể lưu đội hình" },
  "builder.toast.saveSuccess": { en: "Squad saved!", vi: "Đã lưu đội hình!" },

  // My Squads
  "mySquads.title": { en: "My Squads", vi: "Đội hình của tôi" },
  "mySquads.subtitle": { en: "Manage your created squads", vi: "Quản lý các đội hình bạn đã tạo" },
  "mySquads.createNew": { en: "Create new squad", vi: "Tạo đội hình mới" },
  "mySquads.formation": { en: "Formation:", vi: "Sơ đồ:" },
  "mySquads.playstyle": { en: "Playstyle:", vi: "Lối chơi:" },
  "mySquads.edit": { en: "Edit", vi: "Chỉnh sửa" },
  "mySquads.empty.title": { en: "No squads yet", vi: "Chưa có đội hình nào" },
  "mySquads.empty.subtitle": { en: "Start building your first squad", vi: "Bắt đầu xây dựng đội hình đầu tiên của bạn" },
  "mySquads.empty.createButton": { en: "Create squad", vi: "Tạo đội hình" },
  "mySquads.toast.loadError": { en: "Cannot load squads", vi: "Không thể tải đội hình" },
  "mySquads.toast.deleteSuccess": { en: "Squad deleted", vi: "Đã xóa đội hình" },
  "mySquads.toast.deleteError": { en: "Cannot delete squad", vi: "Không thể xóa đội hình" },

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

  // AI Assistant
  "ai.title": { en: "AI FC Tactics Assistant", vi: "AI Trợ lý FC Tactics" },
  "ai.subtitle": { en: "Search & analyze players", vi: "Tìm kiếm & phân tích cầu thủ" },
  "ai.placeholder": { en: "Ask about players, tactics, squads...", vi: "Hỏi về cầu thủ, chiến thuật, đội hình..." },
  "ai.searching": { en: "Searching...", vi: "Đang tìm kiếm..." },
  "ai.greeting": { en: "Hello! I'm Boped FC Tactics AI assistant. I can help you find players, suggest squads, or answer questions about FC Mobile. How can I help?", vi: "Xin chào! Tôi là trợ lý AI của Boped FC Tactics. Tôi có thể giúp bạn tìm cầu thủ, tư vấn đội hình, hoặc trả lời các câu hỏi về FC Mobile. Bạn cần giúp gì?" },
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
