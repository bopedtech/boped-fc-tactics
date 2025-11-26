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

  // Hero/Search
  "hero.title": { en: "Boped FC Tactics", vi: "Boped FC Tactics" },
  "hero.subtitle": { en: "Search FC Mobile players", vi: "Tìm kiếm cầu thủ FC Mobile" },
  "hero.searchPlaceholder": { en: "Search players by name...", vi: "Tìm kiếm cầu thủ theo tên..." },
  "hero.viewMore": { en: "View more search results", vi: "Xem thêm kết quả tìm kiếm" },
  "hero.noPlayers": { en: "No players found", vi: "Không tìm thấy cầu thủ" },

  // AI Search
  "aiSearch.subtitle": { en: "Smart AI assistant for FC Mobile", vi: "AI trợ lý thông minh cho FC Mobile" },
  "aiSearch.placeholder": { en: "Ask AI: 'Find strikers with pace over 90', 'Suggest Tiki-Taka formation'...", vi: "Hỏi AI: 'Tìm tiền đạo có pace trên 90', 'Gợi ý đội hình Tiki-Taka'..." },
  "aiSearch.pleaseEnterQuestion": { en: "Please enter a question", vi: "Vui lòng nhập câu hỏi" },
  "aiSearch.searchingPlayers": { en: "Searching players...", vi: "Đang tìm kiếm cầu thủ..." },
  "aiSearch.openingBuilder": { en: "Opening Squad Builder...", vi: "Mở Squad Builder..." },
  "aiSearch.searching": { en: "Searching...", vi: "Đang tìm kiếm..." },

  // AI Assistant Bubble
  "aiAssistant.greeting1": { en: "Find the fastest players in FC Mobile", vi: "Tìm cầu thủ có tốc độ nhanh nhất FC Mobile" },
  "aiAssistant.greeting2": { en: "Get tactical suggestions for ranked matches", vi: "Bấm để nhận gợi ý về chiến thuật giả lập xếp hạng" },
  "aiAssistant.greeting3": { en: "Find players suitable for Tiki-Taka", vi: "Tìm cầu thủ phù hợp với đội hình Tiki-Taka" },
  "aiAssistant.greeting4": { en: "Best value players by position", vi: "Gợi ý cầu thủ có giá trị tốt nhất theo vị trí" },
  "aiAssistant.greeting5": { en: "Effective counter-attack tactics", vi: "Chiến thuật phòng ngự phản công hiệu quả" },
  "aiAssistant.greeting6": { en: "Compare any 2 players in FC Mobile", vi: "So sánh 2 cầu thủ bất kỳ trong FC Mobile" },
  "aiAssistant.greeting7": { en: "Build the perfect squad for your budget", vi: "Xây dựng đội hình hoàn hảo cho budget của bạn" },
  "aiAssistant.welcome": { en: "Hello! I'm the AI assistant for Boped FC Tactics. I can help you find players, suggest formations, or answer questions about FC Mobile. How can I help you?", vi: "Xin chào! Tôi là trợ lý AI của Boped FC Tactics. Tôi có thể giúp bạn tìm cầu thủ, tư vấn đội hình, hoặc trả lời các câu hỏi về FC Mobile. Bạn cần giúp gì?" },
  "aiAssistant.connectionError": { en: "Connection error", vi: "Lỗi kết nối" },
  "aiAssistant.cannotAnswer": { en: "Sorry, I cannot answer that.", vi: "Xin lỗi, tôi không thể trả lời." },
  "aiAssistant.sendError": { en: "Error sending message", vi: "Lỗi khi gửi tin nhắn" },
  "aiAssistant.title": { en: "AI FC Tactics Assistant", vi: "AI Trợ lý FC Tactics" },
  "aiAssistant.subtitle": { en: "Search & analyze players", vi: "Tìm kiếm & phân tích cầu thủ" },
  "aiAssistant.searching": { en: "Searching...", vi: "Đang tìm kiếm..." },
  "aiAssistant.inputPlaceholder": { en: "Ask about players, tactics, formations...", vi: "Hỏi về cầu thủ, chiến thuật, đội hình..." },

  // AI Advisor
  "aiAdvisor.title": { en: "AI Tactical Advisor", vi: "Trợ lý AI Chiến thuật" },
  "aiAdvisor.description": { en: "Smart FC Mobile Manager Mode setup suggestions for your squad", vi: "Gợi ý thiết lập Manager Mode FC Mobile thông minh cho đội hình của bạn" },
  "aiAdvisor.close": { en: "Close", vi: "Đóng" },
  "aiAdvisor.selectTitle": { en: "Choose your desired playstyle", vi: "Chọn lối chơi mong muốn" },
  "aiAdvisor.selectDescription": { en: "AI will analyze and suggest optimal Manager Mode settings for FC Mobile", vi: "AI sẽ phân tích và đề xuất thiết lập Manager Mode tối ưu cho FC Mobile" },
  "aiAdvisor.playstyleLabel": { en: "Playstyle", vi: "Lối chơi" },
  "aiAdvisor.playstyle.control": { en: "Possession Control", vi: "Kiểm soát bóng (Possession)" },
  "aiAdvisor.playstyle.counter": { en: "Fast Counter", vi: "Phản công nhanh (Counter)" },
  "aiAdvisor.playstyle.pressing": { en: "High Press", vi: "Ép sân cao (High Press)" },
  "aiAdvisor.playstyle.defensive": { en: "Defensive", vi: "Phòng thủ chặt chẽ (Defensive)" },
  "aiAdvisor.selectPlaystyle": { en: "Please select a playstyle", vi: "Vui lòng chọn lối chơi mong muốn" },
  "aiAdvisor.analyzing": { en: "Analyzing...", vi: "Đang phân tích..." },
  "aiAdvisor.analyzeButton": { en: "Analyze with AI", vi: "Phân tích với AI" },
  "aiAdvisor.analysisComplete": { en: "Analysis complete!", vi: "Phân tích hoàn tất!" },

  // Auth
  "auth.description": { en: "Build optimal formations and tactics", vi: "Xây dựng đội hình và chiến thuật tối ưu" },
  "auth.signin": { en: "Sign In", vi: "Đăng nhập" },
  "auth.signup": { en: "Sign Up", vi: "Đăng ký" },
  "auth.email": { en: "Email", vi: "Email" },
  "auth.password": { en: "Password", vi: "Mật khẩu" },
  "auth.passwordPlaceholder": { en: "Minimum 6 characters", vi: "Tối thiểu 6 ký tự" },
  "auth.signingIn": { en: "Signing in...", vi: "Đang đăng nhập..." },
  "auth.signingUp": { en: "Signing up...", vi: "Đang đăng ký..." },
  "auth.orContinueWith": { en: "Or continue with", vi: "Hoặc tiếp tục với" },
  "auth.signupSuccess": { en: "Sign up successful! Please check your email to confirm.", vi: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận." },
  "auth.signupError": { en: "An error occurred during sign up", vi: "Có lỗi xảy ra khi đăng ký" },
  "auth.signinSuccess": { en: "Signed in successfully!", vi: "Đăng nhập thành công!" },
  "auth.signinError": { en: "Email or password is incorrect", vi: "Email hoặc mật khẩu không đúng" },
  "auth.googleError": { en: "An error occurred when signing in with Google", vi: "Có lỗi xảy ra khi đăng nhập với Google" },

  // Filters
  "filters.searchLeague": { en: "Search league...", vi: "Tìm giải đấu..." },
  "filters.searchClub": { en: "Search club...", vi: "Tìm câu lạc bộ..." },
  "filters.searchNation": { en: "Search nation...", vi: "Tìm quốc tịch..." },
  "filters.searchProgram": { en: "Search program...", vi: "Tìm chương trình..." },
  "filters.league": { en: "League", vi: "Giải đấu" },
  "filters.club": { en: "Club", vi: "Câu lạc bộ" },
  "filters.nation": { en: "Nation", vi: "Quốc tịch" },
  "filters.program": { en: "Program/Event", vi: "Chương trình/Sự kiện" },

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

  // Profile page
  "profile.title": { en: "Profile", vi: "Trang cá nhân" },
  "profile.tabs.profile": { en: "Personal information", vi: "Thông tin cá nhân" },
  "profile.tabs.squads": { en: "My squads", vi: "Đội hình của tôi" },
  "profile.card.title": { en: "Personal information", vi: "Thông tin cá nhân" },
  "profile.card.description": { en: "Update your profile information", vi: "Cập nhật thông tin profile của bạn" },
  "profile.uploadAvatar": { en: "Upload avatar", vi: "Tải avatar lên" },
  "profile.uploading": { en: "Uploading...", vi: "Đang tải..." },
  "profile.displayName": { en: "Display name", vi: "Tên hiển thị" },
  "profile.displayName.placeholder": { en: "Display name in app", vi: "Tên hiển thị trong ứng dụng" },
  "profile.fullName": { en: "Full name", vi: "Tên đầy đủ" },
  "profile.fullName.placeholder": { en: "Enter full name", vi: "Nhập tên đầy đủ" },
  "profile.age": { en: "Age", vi: "Tuổi" },
  "profile.age.placeholder": { en: "Age", vi: "Tuổi" },
  "profile.experience": { en: "FC Mobile experience", vi: "Kinh nghiệm FC Mobile" },
  "profile.experience.beginner": { en: "Beginner", vi: "Người mới" },
  "profile.experience.intermediate": { en: "Intermediate", vi: "Trung bình" },
  "profile.experience.experienced": { en: "Experienced", vi: "Có kinh nghiệm" },
  "profile.experience.professional": { en: "Professional", vi: "Chuyên nghiệp" },
  "profile.bio": { en: "Bio", vi: "Giới thiệu" },
  "profile.bio.placeholder": { en: "Write a few lines about yourself...", vi: "Viết một vài dòng về bản thân..." },
  "profile.saveChanges": { en: "Save changes", vi: "Lưu thay đổi" },
  "profile.saving": { en: "Saving...", vi: "Đang lưu..." },
  "profile.cancel": { en: "Cancel", vi: "Hủy" },
  "profile.squads.title": { en: "My squads", vi: "Đội hình của tôi" },
  "profile.squads.description": { en: "Manage your created squads", vi: "Quản lý các đội hình bạn đã tạo" },
  "profile.squads.createNew": { en: "Create new squad", vi: "Tạo đội hình mới" },
  "profile.squads.formation": { en: "Formation:", vi: "Sơ đồ:" },
  "profile.squads.playstyle": { en: "Playstyle:", vi: "Phong cách:" },
  "profile.squads.edit": { en: "Edit", vi: "Chỉnh sửa" },
  "profile.squads.delete": { en: "Delete", vi: "Xóa" },
  "profile.squads.empty": { en: "No squads yet", vi: "Chưa có đội hình nào" },
  "profile.squads.empty.subtitle": { en: "Start building your first squad", vi: "Bắt đầu xây dựng đội hình đầu tiên của bạn" },
  "profile.squads.empty.create": { en: "Create squad", vi: "Tạo đội hình" },
  "profile.toast.loginRequired": { en: "Please login to access this page", vi: "Vui lòng đăng nhập để truy cập trang này" },
  "profile.toast.loadError": { en: "Cannot load profile", vi: "Không thể tải thông tin profile" },
  "profile.toast.avatarUpdated": { en: "Avatar updated!", vi: "Đã cập nhật avatar!" },
  "profile.toast.avatarError": { en: "Cannot upload avatar", vi: "Không thể tải avatar lên" },
  "profile.toast.updateSuccess": { en: "Profile updated successfully!", vi: "Đã cập nhật profile thành công!" },
  "profile.toast.updateError": { en: "Cannot update profile", vi: "Không thể cập nhật profile" },
  "profile.toast.squadDeleted": { en: "Squad deleted", vi: "Đã xóa đội hình" },
  "profile.toast.squadDeleteError": { en: "Cannot delete squad", vi: "Không thể xóa đội hình" },

  // News page
  "news.title": { en: "FC Mobile News", vi: "Bảng tin FC Mobile" },
  "news.subtitle": { en: "Latest news, updates and guides about FC Mobile", vi: "Tin tức, cập nhật và hướng dẫn mới nhất về FC Mobile" },
  "news.search": { en: "Search news...", vi: "Tìm kiếm tin tức..." },
  "news.category.all": { en: "All", vi: "Tất cả" },
  "news.category.news": { en: "News", vi: "Tin tức" },
  "news.category.update": { en: "Update", vi: "Cập nhật" },
  "news.category.guide": { en: "Guide", vi: "Hướng dẫn" },
  "news.category.feature": { en: "New Feature", vi: "Tính năng mới" },
  "news.category.event": { en: "Event", vi: "Sự kiện" },
  "news.category.analysis": { en: "Analysis", vi: "Phân tích" },
  "news.noResults": { en: "No articles found", vi: "Không tìm thấy bài viết nào" },
  "news.backToNews": { en: "Back to news", vi: "Quay lại bảng tin" },
  "news.notFound": { en: "Article not found", vi: "Không tìm thấy bài viết" },
  "news.share": { en: "Share", vi: "Chia sẻ" },
  "news.linkCopied": { en: "Link copied", vi: "Đã copy link bài viết" },
  "news.relatedArticles": { en: "Related articles", vi: "Bài viết liên quan" },

  // Filters
  "filters.title": { en: "Filters", vi: "Bộ lọc" },
  "filters.reset": { en: "Reset all", vi: "Đặt lại tất cả" },
  "filters.rating": { en: "Rating (OVR)", vi: "Chỉ số (OVR)" },
  "filters.position": { en: "Position", vi: "Vị trí" },
  "filters.position.type": { en: "Position type", vi: "Loại vị trí" },
  "filters.position.type.all": { en: "Primary and alternate", vi: "Cả vị trí chính và phụ" },
  "filters.position.type.primary": { en: "Primary only", vi: "Chỉ vị trí chính" },
  "filters.position.type.alternate": { en: "Alternate only", vi: "Chỉ vị trí phụ" },
  "filters.position.select": { en: "Select positions", vi: "Chọn vị trí" },
  "filters.league.search": { en: "Search league...", vi: "Tìm giải đấu..." },
  "filters.club.search": { en: "Search club...", vi: "Tìm câu lạc bộ..." },
  "filters.nation.search": { en: "Search nation...", vi: "Tìm quốc tịch..." },
  "filters.program.search": { en: "Search program...", vi: "Tìm chương trình..." },
  "filters.height": { en: "Height", vi: "Chiều cao" },
  "filters.weight": { en: "Weight", vi: "Cân nặng" },
  "filters.skillMoves": { en: "Skill Moves", vi: "Kỹ năng rê bóng" },
  "filters.weakFoot": { en: "Weak Foot", vi: "Chân yếu" },
  "filters.strongFoot": { en: "Strong Foot", vi: "Chân thuận" },
  "filters.all": { en: "All", vi: "Tất cả" },
  "filters.starsAndAbove": { en: "stars and above", vi: "sao trở lên" },
  "filters.rightFoot": { en: "Right Foot", vi: "Chân phải" },
  "filters.leftFoot": { en: "Left Foot", vi: "Chân trái" },
  "filters.workRates": { en: "Work Rates", vi: "Tốc độ làm việc" },
  "filters.attacking": { en: "Attacking", vi: "Tấn công" },
  "filters.defensive": { en: "Defensive", vi: "Phòng thủ" },
  "filters.low": { en: "Low", vi: "Thấp" },
  "filters.medium": { en: "Medium", vi: "Trung bình" },
  "filters.high": { en: "High", vi: "Cao" },
  "filters.traits": { en: "Traits", vi: "Đặc điểm" },
  "filters.searchTraits": { en: "Search traits...", vi: "Tìm đặc điểm..." },

  // Old AI Advisor keys (keeping non-duplicates)
  "aiAdvisor.subtitle": { en: "Smart Manager Mode setup suggestions for FC Mobile", vi: "Gợi ý thiết lập Manager Mode FC Mobile thông minh cho đội hình của bạn" },
  "aiAdvisor.selectPlaystyle.subtitle": { en: "AI will analyze and suggest optimal Manager Mode setup for FC Mobile", vi: "AI sẽ phân tích và đề xuất thiết lập Manager Mode tối ưu cho FC Mobile" },
  "aiAdvisor.playstyle": { en: "Playstyle", vi: "Lối chơi" },
  "aiAdvisor.playstyle.possession": { en: "Possession Control", vi: "Kiểm soát bóng (Possession)" },
  "aiAdvisor.playstyle.highPress": { en: "High Press", vi: "Ép sân cao (High Press)" },
  "aiAdvisor.analyzeWithAI": { en: "Analyze with AI", vi: "Phân tích với AI" },
  "aiAdvisor.analysis": { en: "Boped AI Analysis", vi: "Phân tích Boped AI" },
  "aiAdvisor.recommendedPlaystyle": { en: "Recommended playstyle:", vi: "Lối chơi đề xuất:" },
  "aiAdvisor.tabs.buildup": { en: "Build-up", vi: "Xây dựng" },
  "aiAdvisor.tabs.offense": { en: "Offense", vi: "Tấn công" },
  "aiAdvisor.tabs.defense": { en: "Defense", vi: "Phòng thủ" },
  "aiAdvisor.tabs.summary": { en: "Summary", vi: "Tổng quan" },
  "aiAdvisor.buildup.title": { en: "Build-up Play Setup", vi: "Thiết lập xây dựng lối chơi (Build-up Play)" },
  "aiAdvisor.buildup.speed": { en: "Build-up Speed", vi: "Tốc độ xây dựng (Build-up Speed)" },
  "aiAdvisor.buildup.distance": { en: "Pass Distance", vi: "Khoảng cách chuyền (Pass Distance)" },
  "aiAdvisor.buildup.positioning": { en: "Player Positioning", vi: "Vị trí cầu thủ (Player Positioning)" },
  "aiAdvisor.buildup.positioning.organized": { en: "Organized", vi: "Tổ chức" },
  "aiAdvisor.buildup.positioning.freeForm": { en: "Free Form", vi: "Tự do" },
  "aiAdvisor.offense.title": { en: "Offensive Play Setup", vi: "Thiết lập tấn công (Offensive Play)" },
  "aiAdvisor.offense.longShots": { en: "Long Shots", vi: "Sút xa (Long Shots)" },
  "aiAdvisor.offense.crossing": { en: "Crossing", vi: "Tạt cánh (Crossing)" },
  "aiAdvisor.offense.passInBox": { en: "Pass in Box", vi: "Chuyền trong vòng cấm (Pass in Box)" },
  "aiAdvisor.defense.title": { en: "Defensive Play Setup", vi: "Thiết lập phòng thủ (Defensive Play)" },
  "aiAdvisor.defense.pressure": { en: "Defensive Pressure", vi: "Áp lực (Defensive Pressure)" },
  "aiAdvisor.defense.aggression": { en: "Defensive Aggression", vi: "Quyết liệt (Defensive Aggression)" },
  "aiAdvisor.defense.width": { en: "Defensive Width", vi: "Độ rộng hàng thủ (Defensive Width)" },
  "aiAdvisor.defense.offsideTrap": { en: "Offside Trap", vi: "Bẫy việt vị (Offside Trap)" },
  "aiAdvisor.defense.offsideTrap.on": { en: "On", vi: "Bật" },
  "aiAdvisor.defense.offsideTrap.off": { en: "Off", vi: "Tắt" },
  "aiAdvisor.summary.title": { en: "Tactical Overview", vi: "Tổng quan chiến thuật" },
  "aiAdvisor.summary.strengths": { en: "Strengths", vi: "✅ Điểm mạnh" },
  "aiAdvisor.summary.considerations": { en: "Considerations", vi: "⚠️ Lưu ý" },
  "aiAdvisor.toast.selectPlaystyle": { en: "Please select desired playstyle", vi: "Vui lòng chọn lối chơi mong muốn" },
  "aiAdvisor.toast.analysisComplete": { en: "Analysis complete!", vi: "Phân tích hoàn tất!" },

  // Admin - Players Management
  "admin.players.title": { en: "Player Management", vi: "Quản Lý Cầu Thủ" },
  "admin.players.subtitle": { en: "Manage and edit player information in database", vi: "Quản lý và chỉnh sửa thông tin cầu thủ trong database" },
  "admin.players.total": { en: "Total Players", vi: "Tổng Cầu Thủ" },
  "admin.players.filtered": { en: "Filtered Results", vi: "Kết Quả Lọc" },
  "admin.players.avgRating": { en: "Average Rating", vi: "Trung Bình Rating" },
  "admin.players.filters.title": { en: "Filters & Search", vi: "Bộ Lọc & Tìm Kiếm" },
  "admin.players.search": { en: "Search by player name...", vi: "Tìm kiếm theo tên cầu thủ..." },
  "admin.players.position.all": { en: "All positions", vi: "Tất cả vị trí" },
  "admin.players.rating.all": { en: "All ratings", vi: "Tất cả rating" },
  "admin.players.visibility.all": { en: "All", vi: "Tất cả" },
  "admin.players.visibility.visible": { en: "Visible", vi: "Đang hiện" },
  "admin.players.visibility.hidden": { en: "Hidden", vi: "Đang ẩn" },
  "admin.players.clearFilters": { en: "Clear filters", vi: "Xóa lọc" },
  "admin.players.list.title": { en: "Player List", vi: "Danh Sách Cầu Thủ" },
  "admin.players.showing": { en: "Showing", vi: "Hiển thị" },
  "admin.players.id": { en: "ID", vi: "ID" },
  "admin.players.player": { en: "Player", vi: "Cầu Thủ" },
  "admin.players.ovr": { en: "OVR", vi: "OVR" },
  "admin.players.nationClub": { en: "Nation & Club", vi: "Quốc gia & CLB" },
  "admin.players.program": { en: "Program", vi: "Program" },
  "admin.players.visibility": { en: "Visibility", vi: "Hiển thị" },
  "admin.players.actions": { en: "Actions", vi: "Thao tác" },
  "admin.players.view": { en: "View", vi: "Xem" },
  "admin.players.delete": { en: "Delete", vi: "Xóa" },
  "admin.players.toast.visibilityUpdated": { en: "Player visibility updated", vi: "Đã cập nhật trạng thái hiển thị" },
  "admin.players.toast.visibilityError": { en: "Cannot update visibility", vi: "Không thể cập nhật trạng thái hiển thị" },
  "admin.players.toast.deleted": { en: "Player deleted successfully", vi: "Đã xóa cầu thủ thành công" },
  "admin.players.toast.deleteError": { en: "Cannot delete player", vi: "Không thể xóa cầu thủ" },
  "admin.players.toast.loadError": { en: "Cannot load player list", vi: "Không thể tải danh sách cầu thủ" },
  "admin.players.toast.visible": { en: "Player shown", vi: "Đã hiển thị cầu thủ" },
  "admin.players.toast.hidden": { en: "Player hidden", vi: "Đã ẩn cầu thủ" },

  // Admin - Users Management
  "admin.users.title": { en: "User Management", vi: "Quản Lý Người Dùng" },
  "admin.users.subtitle": { en: "Manage user accounts and permissions", vi: "Quản lý tài khoản người dùng và phân quyền" },
  "admin.users.totalUsers": { en: "Total Users", vi: "Tổng Users" },
  "admin.users.admins": { en: "Admins", vi: "Admins" },
  "admin.users.withProfile": { en: "With Profile", vi: "Có Profile" },
  "admin.users.activeToday": { en: "Active Today", vi: "Active Today" },
  "admin.users.search": { en: "Search by email or name...", vi: "Tìm kiếm theo email hoặc tên..." },
  "admin.users.list.title": { en: "User List", vi: "Danh Sách Người Dùng" },
  "admin.users.list.count": { en: "users", vi: "người dùng" },
  "admin.users.email": { en: "Email", vi: "Email" },
  "admin.users.displayName": { en: "Display name", vi: "Tên hiển thị" },
  "admin.users.roles": { en: "Roles", vi: "Roles" },
  "admin.users.registered": { en: "Registered", vi: "Đăng ký" },
  "admin.users.lastLogin": { en: "Last login", vi: "Đăng nhập cuối" },
  "admin.users.lastLogin.never": { en: "Never logged in", vi: "Chưa đăng nhập" },
  "admin.users.actions": { en: "Actions", vi: "Thao tác" },
  "admin.users.detail.title": { en: "User Details", vi: "Chi Tiết Người Dùng" },
  "admin.users.detail.userId": { en: "User ID", vi: "User ID" },
  "admin.users.detail.email": { en: "Email", vi: "Email" },
  "admin.users.detail.registered": { en: "Registered", vi: "Ngày đăng ký" },
  "admin.users.detail.lastLogin": { en: "Last login", vi: "Đăng nhập cuối" },
  "admin.users.detail.profileInfo": { en: "Profile Information", vi: "Thông Tin Profile" },
  "admin.users.detail.displayName": { en: "Display name", vi: "Tên hiển thị" },
  "admin.users.detail.fullName": { en: "Full name", vi: "Tên đầy đủ" },
  "admin.users.detail.age": { en: "Age", vi: "Tuổi" },
  "admin.users.detail.experience": { en: "Experience", vi: "Kinh nghiệm" },
  "admin.users.detail.favoriteFormation": { en: "Favorite formation", vi: "Sơ đồ yêu thích" },
  "admin.users.detail.favoritePosition": { en: "Favorite position", vi: "Vị trí yêu thích" },
  "admin.users.detail.bio": { en: "Bio", vi: "Giới thiệu" },
  "admin.users.detail.permissions": { en: "Permissions", vi: "Quyền hạn" },
  "admin.users.toast.loadError": { en: "Cannot load user list", vi: "Không thể tải danh sách người dùng" },

  // Admin - Leagues Management
  "admin.leagues.title": { en: "Leagues & Clubs", vi: "Giải Đấu & Câu Lạc Bộ" },
  "admin.leagues.subtitle": { en: "Manage leagues, clubs and nations", vi: "Quản lý thông tin giải đấu, câu lạc bộ và quốc gia" },
  "admin.leagues.leagues": { en: "Leagues", vi: "Giải Đấu" },
  "admin.leagues.clubs": { en: "Clubs", vi: "Câu Lạc Bộ" },
  "admin.leagues.nations": { en: "Nations", vi: "Quốc Gia" },
  "admin.leagues.search": { en: "Search...", vi: "Tìm kiếm..." },
  "admin.leagues.tab.leagues": { en: "Leagues", vi: "Giải Đấu" },
  "admin.leagues.tab.clubs": { en: "Clubs", vi: "Câu Lạc Bộ" },
  "admin.leagues.tab.nations": { en: "Nations", vi: "Quốc Gia" },
  "admin.leagues.list.leagues": { en: "League List", vi: "Danh Sách Giải Đấu" },
  "admin.leagues.list.clubs": { en: "Club List", vi: "Danh Sách Câu Lạc Bộ" },
  "admin.leagues.list.nations": { en: "Nation List", vi: "Danh Sách Quốc Gia" },
  "admin.leagues.count.leagues": { en: "leagues", vi: "giải đấu" },
  "admin.leagues.count.clubs": { en: "clubs", vi: "câu lạc bộ" },
  "admin.leagues.count.nations": { en: "nations", vi: "quốc gia" },
  "admin.leagues.table.id": { en: "ID", vi: "ID" },
  "admin.leagues.table.name": { en: "Name", vi: "Tên" },
  "admin.leagues.table.leagueId": { en: "League ID", vi: "League ID" },
  "admin.leagues.table.localizationKey": { en: "Localization Key", vi: "Localization Key" },
  "admin.leagues.table.created": { en: "Created", vi: "Ngày tạo" },
  "admin.leagues.toast.loadError": { en: "Cannot load data", vi: "Không thể tải dữ liệu" },

  // Admin - Sync Data
  "admin.sync.title": { en: "Data Synchronization", vi: "Đồng Bộ Dữ Liệu" },
  "admin.sync.subtitle": { en: "Manage data sync from Renderz API and external sources", vi: "Quản lý đồng bộ dữ liệu từ Renderz API và các nguồn bên ngoài" },
  "admin.sync.dict.title": { en: "Import Localization Dictionary", vi: "1. Import Localization Dictionary" },
  "admin.sync.dict.description": { en: "Import localization dictionary to translate Leagues, Clubs, Nations, Programs", vi: "Import từ điển bản địa hóa để dịch tên Leagues, Clubs, Nations, Programs" },
  "admin.sync.dict.selectFile": { en: "Select JSON file", vi: "Chọn file JSON" },
  "admin.sync.dict.fileSelected": { en: "✓ {filename}", vi: "✓ {filename}" },
  "admin.sync.dict.import": { en: "Import Selected File", vi: "Import File Đã Chọn" },
  "admin.sync.dict.importDefault": { en: "Import From Public Folder", vi: "Import Từ Public Folder" },
  "admin.sync.dict.importing": { en: "Importing...", vi: "Đang import..." },
  "admin.sync.translate.title": { en: "Translate Dictionary to Vietnamese", vi: "2. Dịch Từ Điển Sang Tiếng Việt" },
  "admin.sync.translate.description": { en: "Translate entire localization dictionary from English to Vietnamese using AI", vi: "Dịch toàn bộ từ điển bản địa hóa từ tiếng Anh sang tiếng Việt bằng AI" },
  "admin.sync.translate.button": { en: "Translate All to Vietnamese", vi: "Dịch Toàn Bộ Sang Tiếng Việt" },
  "admin.sync.translate.translating": { en: "Translating...", vi: "Đang dịch..." },
  "admin.sync.players.title": { en: "Sync Players", vi: "Đồng Bộ Cầu Thủ" },
  "admin.sync.players.description": { en: "Sync player data from Renderz API", vi: "Đồng bộ dữ liệu cầu thủ từ Renderz API" },
  "admin.sync.players.test": { en: "Test (5 pages)", vi: "Test (5 trang)" },
  "admin.sync.players.full": { en: "Full Sync", vi: "Đồng bộ đầy đủ" },
  "admin.sync.leagues.title": { en: "Sync Leagues", vi: "Đồng Bộ Giải Đấu" },
  "admin.sync.leagues.description": { en: "Sync league data from FIFA API", vi: "Đồng bộ dữ liệu giải đấu từ FIFA API" },
  "admin.sync.leagues.button": { en: "Sync", vi: "Đồng bộ" },
  "admin.sync.nations.title": { en: "Sync Nations", vi: "Đồng Bộ Quốc Gia" },
  "admin.sync.nations.description": { en: "Sync nation data from Renderz", vi: "Đồng bộ dữ liệu quốc gia từ Renderz" },
  "admin.sync.teams.title": { en: "Sync Clubs", vi: "Đồng Bộ Câu Lạc Bộ" },
  "admin.sync.teams.description": { en: "Sync club data from Renderz", vi: "Đồng bộ dữ liệu câu lạc bộ từ Renderz" },
  "admin.sync.traits.title": { en: "Sync Traits", vi: "Đồng Bộ Chỉ Số Ẩn" },
  "admin.sync.traits.description": { en: "Sync hidden stats data from Renderz", vi: "Đồng bộ dữ liệu chỉ số ẩn từ Renderz" },
  "admin.sync.programs.title": { en: "Sync Programs", vi: "Đồng Bộ Chương Trình" },
  "admin.sync.programs.description": { en: "Sync program/event data from Renderz", vi: "Đồng bộ dữ liệu chương trình/sự kiện từ Renderz" },
  "admin.sync.celebrations.title": { en: "Sync Celebrations", vi: "Đồng Bộ Ăn Mừng" },
  "admin.sync.celebrations.description": { en: "Sync celebration data from Renderz", vi: "Đồng bộ dữ liệu ăn mừng từ Renderz" },
  "admin.sync.skillMoves.title": { en: "Sync Skill Moves", vi: "Đồng Bộ Kỹ Năng" },
  "admin.sync.skillMoves.description": { en: "Sync skill move data from Renderz", vi: "Đồng bộ dữ liệu kỹ năng từ Renderz" },
  "admin.sync.syncing": { en: "Syncing...", vi: "Đang đồng bộ..." },
  "admin.sync.success": { en: "✓ Success", vi: "✓ Thành công" },
  "admin.sync.error": { en: "✗ Error", vi: "✗ Lỗi" },

  // Admin - Logs & Activity
  "admin.logs.title": { en: "Logs & Activity", vi: "Logs & Hoạt Động" },
  "admin.logs.subtitle": { en: "Monitor system and user activity", vi: "Theo dõi hoạt động hệ thống và người dùng" },
  "admin.logs.refresh": { en: "Refresh", vi: "Làm mới" },
  "admin.logs.stats.totalPlayers": { en: "Total Players", vi: "Tổng Cầu Thủ" },
  "admin.logs.stats.totalUsers": { en: "Total Users", vi: "Tổng Users" },
  "admin.logs.stats.squads": { en: "Squads", vi: "Đội Hình" },
  "admin.logs.stats.signups24h": { en: "Signups 24h", vi: "Đăng Ký 24h" },
  "admin.logs.activity.title": { en: "Recent Activity", vi: "Hoạt Động Gần Đây" },
  "admin.logs.activity.description": { en: "Track changes in the system", vi: "Theo dõi các thay đổi trong hệ thống" },
  "admin.logs.activity.timeRange.1h": { en: "Last 1 hour", vi: "1 giờ qua" },
  "admin.logs.activity.timeRange.24h": { en: "Last 24 hours", vi: "24 giờ qua" },
  "admin.logs.activity.timeRange.7d": { en: "Last 7 days", vi: "7 ngày qua" },
  "admin.logs.activity.timeRange.30d": { en: "Last 30 days", vi: "30 ngày qua" },
  "admin.logs.activity.empty": { en: "No activity yet", vi: "Chưa có hoạt động nào" },
  "admin.logs.activity.justNow": { en: "Just now", vi: "Vừa xong" },
  "admin.logs.activity.minutesAgo": { en: "{minutes} minutes ago", vi: "{minutes} phút trước" },
  "admin.logs.activity.hoursAgo": { en: "{hours} hours ago", vi: "{hours} giờ trước" },
  "admin.logs.activity.daysAgo": { en: "{days} days ago", vi: "{days} ngày trở" },
  "admin.logs.system.title": { en: "System Health", vi: "Tình Trạng Hệ Thống" },
  "admin.logs.system.description": { en: "Check services and connections", vi: "Kiểm tra các dịch vụ và kết nối" },
  "admin.logs.system.database": { en: "Database", vi: "Database" },
  "admin.logs.system.database.description": { en: "Supabase PostgreSQL", vi: "Supabase PostgreSQL" },
  "admin.logs.system.auth": { en: "Authentication", vi: "Authentication" },
  "admin.logs.system.auth.description": { en: "Supabase Auth", vi: "Supabase Auth" },
  "admin.logs.system.functions": { en: "Edge Functions", vi: "Edge Functions" },
  "admin.logs.system.functions.description": { en: "Serverless Backend", vi: "Serverless Backend" },
  "admin.logs.system.online": { en: "Online", vi: "Online" },
  "admin.logs.toast.loadError": { en: "Cannot load data", vi: "Không thể tải dữ liệu" },
  
  // News Section (Homepage)
  "newsSection.title": { en: "FC Mobile News", vi: "Bảng tin FC Mobile" },
  "newsSection.subtitle": { en: "Latest news and updates", vi: "Tin tức và cập nhật mới nhất" },
  "newsSection.viewAll": { en: "View all", vi: "Xem tất cả" },
  
  // News Section Items
  "news.item1.title": { en: "New AI Squad Builder Feature", vi: "Ra mắt tính năng AI Squad Builder mới" },
  "news.item1.description": { en: "Discover AI technology that helps you build the perfect squad in seconds", vi: "Khám phá công nghệ AI giúp bạn xây dựng đội hình hoàn hảo trong vài giây" },
  "news.item1.category": { en: "New Feature", vi: "Tính năng mới" },
  "news.item2.title": { en: "Player Database Update for New Season", vi: "Cập nhật dữ liệu cầu thủ mùa giải mới" },
  "news.item2.description": { en: "Database updated with over 10,000 players from the current season", vi: "Database đã được cập nhật với hơn 10,000 cầu thủ từ mùa giải hiện tại" },
  "news.item2.category": { en: "Update", vi: "Cập nhật" },
  "news.item3.title": { en: "Top 10 Notable Players in January", vi: "Top 10 cầu thủ đáng chú ý tháng 1" },
  "news.item3.description": { en: "List of players with the highest performance in the past month", vi: "Danh sách những cầu thủ có phong độ cao nhất trong tháng vừa qua" },
  "news.item3.category": { en: "News", vi: "Tin tức" },
  "news.item4.title": { en: "Squad Optimization Guide", vi: "Hướng dẫn tối ưu hóa đội hình" },
  "news.item4.description": { en: "Tips and tactics to make your squad stronger", vi: "Những mẹo và chiến thuật giúp đội hình của bạn mạnh hơn" },
  "news.item4.category": { en: "Guide", vi: "Hướng dẫn" },
  
  // Filter Positions
  "filters.positions.GK": { en: "Goalkeeper", vi: "Thủ môn" },
  "filters.positions.LB": { en: "Left Back", vi: "Hậu vệ trái" },
  "filters.positions.LWB": { en: "Left Wing Back", vi: "Tiền vệ cánh trái" },
  "filters.positions.CB": { en: "Center Back", vi: "Trung vệ" },
  "filters.positions.RB": { en: "Right Back", vi: "Hậu vệ phải" },
  "filters.positions.RWB": { en: "Right Wing Back", vi: "Tiền vệ cánh phải" },
  "filters.positions.CDM": { en: "Defensive Midfielder", vi: "Tiền vệ phòng ngự" },
  "filters.positions.CM": { en: "Center Midfielder", vi: "Tiền vệ trung tâm" },
  "filters.positions.CAM": { en: "Attacking Midfielder", vi: "Tiền vệ tấn công" },
  "filters.positions.LM": { en: "Left Midfielder", vi: "Tiền vệ trái" },
  "filters.positions.RM": { en: "Right Midfielder", vi: "Tiền vệ phải" },
  "filters.positions.LW": { en: "Left Winger", vi: "Tiền đạo cánh trái" },
  "filters.positions.RW": { en: "Right Winger", vi: "Tiền đạo cánh phải" },
  "filters.positions.CF": { en: "Center Forward", vi: "Tiền đạo ảo" },
  "filters.positions.ST": { en: "Striker", vi: "Tiền đạo" },
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
