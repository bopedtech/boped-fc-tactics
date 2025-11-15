import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AISearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
          Boped FC Tactics
        </h1>
        <p className="text-muted-foreground text-lg">AI trợ lý thông minh cho FC Mobile</p>
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
              placeholder="Hỏi AI: 'Tìm tiền đạo có pace trên 90', 'Gợi ý đội hình Tiki-Taka'..."
              className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
            <Button type="submit" size="sm" className="gradient-primary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AISearchBar;
