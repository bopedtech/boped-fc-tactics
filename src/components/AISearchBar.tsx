import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Zap, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AISearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Users,
      label: "Tìm cầu thủ",
      action: () => navigate("/database"),
    },
    {
      icon: Zap,
      label: "Xây đội hình",
      action: () => navigate("/builder"),
    },
    {
      icon: TrendingUp,
      label: "Đội hình của tôi",
      action: () => navigate("/my-squads"),
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Vui lòng nhập câu hỏi");
      return;
    }
    
    // AI search logic - for now, navigate to database with query
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("cầu thủ") || lowerQuery.includes("player")) {
      navigate("/database");
      toast.success("Đang tìm kiếm cầu thủ...");
    } else if (lowerQuery.includes("đội hình") || lowerQuery.includes("squad")) {
      navigate("/builder");
      toast.success("Mở Squad Builder...");
    } else {
      navigate("/database");
      toast.success("Đang tìm kiếm...");
    }
    
    setQuery("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* AI Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-2 bg-card/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl px-6 py-4 shadow-lg">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hỏi AI: 'Tìm tiền đạo có pace trên 90', 'Gợi ý đội hình Tiki-Taka'..."
              className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
            <Button type="submit" size="sm" className="gradient-primary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {quickActions.map((action, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={action.action}
            className="gap-2 hover:border-primary/50 hover:bg-primary/5"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AISearchBar;
