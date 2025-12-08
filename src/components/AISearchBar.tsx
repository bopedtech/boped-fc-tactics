import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useT } from "@/contexts/LocalizationContext";

import { useUserTierContext } from "@/contexts/UserTierContext";

import { AIChatIntroDialog } from "./AIChatIntroDialog";

const AISearchBar = () => {
  const { t } = useT();
  const { user, isAdmin } = useUserTierContext();
  const [query, setQuery] = useState("");
  const [showIntro, setShowIntro] = useState(false);
  const navigate = useNavigate();

  const handleGuestInteraction = () => {
    // Force blur if focused
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setShowIntro(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict guest check
    if (!user) {
      setShowIntro(true);
      return;
    }

    if (!query.trim()) {
      toast.error(t("aiSearch.pleaseEnterQuestion", "Vui lòng nhập câu hỏi"));
      return;
    }

    // Check daily limits
    const TODAY = new Date().toISOString().split('T')[0];
    const limit = 3; // 3 for users (guests are blocked by interaction handler)
    const usageKey = `ai_usage_${user?.id}_${TODAY}`;
    const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');

    if (!isAdmin && currentUsage >= limit) {
      toast.error(
        t("aiSearch.limitUser", "Bạn đã dùng hết 3 câu hỏi hôm nay!"),
        {
          description: t("aiSearch.upgradeDesc", "Nâng cấp gói Premium để chat không giới hạn."),
          action: {
            label: t("common.upgrade", "Nâng cấp"),
            onClick: () => navigate("/pricing")
          },
          duration: 5000,
        }
      );
      return;
    }

    // Increment usage
    localStorage.setItem(usageKey, (currentUsage + 1).toString());

    // AI search logic - for now, navigate to database with query
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("cầu thủ") || lowerQuery.includes("player")) {
      navigate("/database");
      toast.success(t("aiSearch.searchingPlayers", "Đang tìm kiếm cầu thủ..."));
    } else if (lowerQuery.includes("đội hình") || lowerQuery.includes("squad")) {
      navigate("/builder");
      toast.success(t("aiSearch.openingBuilder", "Mở Squad Builder..."));
    } else {
      navigate("/database");
      toast.success(t("aiSearch.searching", "Đang tìm kiếm..."));
    }

    setQuery("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
          {t("hero.title", "Boped FC Tactics")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("aiSearch.subtitle", "AI trợ lý thông minh cho FC Mobile")}</p>
      </div>

      {/* AI Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-2 bg-card/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl px-6 py-4 shadow-lg">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              // Remove direct handlers on Input to avoid event swallowing issues
              // readOnly={!user} <-- Removed readOnly to ensure keyboard doesn't flash
              placeholder={t("aiSearch.placeholder", "Hỏi AI: 'Tìm tiền đạo có pace trên 90', 'Gợi ý đội hình Tiki-Taka'...")}
              className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
            <Button type="submit" size="sm" className="gradient-primary" disabled={!user}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Guest Overlay - Absolute positioning to catch ALL interactions */}
          {!user && (
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={handleGuestInteraction}
              onFocus={handleGuestInteraction}
              role="button"
              tabIndex={0}
            />
          )}
        </div>
      </form>

      <AIChatIntroDialog open={showIntro} onOpenChange={setShowIntro} />
    </div>
  );
};

export default AISearchBar;
