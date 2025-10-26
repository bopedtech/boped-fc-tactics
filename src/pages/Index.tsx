import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Database, Users, Zap, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-glow opacity-20" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-primary bg-clip-text text-transparent">
                BopedFCTactics
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Xây dựng đội hình FC Mobile tối ưu với AI
            </p>
            <p className="text-lg text-foreground/80 mb-12 max-w-2xl mx-auto">
              Công cụ phân tích chiến thuật thông minh giúp bạn tạo ra đội hình hoàn hảo 
              cho FC Mobile, với gợi ý từ AI về lối chơi và thiết lập Manager Mode tùy chỉnh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary text-lg px-8" asChild>
                <Link to="/builder">
                  <Zap className="mr-2 h-5 w-5" />
                  Bắt đầu xây dựng
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/database">
                  <Database className="mr-2 h-5 w-5" />
                  Khám phá cầu thủ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Tính năng nổi bật
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-hover bg-card rounded-lg p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Danh sách cầu thủ</h3>
              <p className="text-muted-foreground">
                Tra cứu và lọc hàng trăm cầu thủ với thông tin chi tiết về chỉ số và đặc điểm.
              </p>
            </div>

            <div className="card-hover bg-card rounded-lg p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Xây dựng đội hình</h3>
              <p className="text-muted-foreground">
                Xây dựng đội hình FC Mobile với giao diện kéo thả trực quan, hỗ trợ nhiều sơ đồ chiến thuật phổ biến.
              </p>
            </div>

            <div className="card-hover bg-card rounded-lg p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trợ lý AI chiến thuật</h3>
              <p className="text-muted-foreground">
                Nhận gợi ý Manager Mode thông minh dựa trên đội hình và lối chơi bạn chọn, tối ưu cho FC Mobile.
              </p>
            </div>

            <div className="card-hover bg-card rounded-lg p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Phân tích chi tiết</h3>
              <p className="text-muted-foreground">
                Nhận phân tích sâu về điểm mạnh, điểm yếu và cách tối ưu hóa đội hình.
              </p>
            </div>

            <div className="card-hover bg-card rounded-lg p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-white"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Lưu trữ đội hình</h3>
              <p className="text-muted-foreground">
                Lưu và quản lý nhiều đội hình khác nhau cho các trận đấu và giải đấu.
              </p>
            </div>

            <div className="card-hover bg-card rounded-lg p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-white"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Cập nhật liên tục</h3>
              <p className="text-muted-foreground">
                Dữ liệu cầu thủ và tính năng được cập nhật thường xuyên theo mùa giải.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/40">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng xây dựng đội hình chiến thắng?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tham gia ngay để trải nghiệm công cụ quản lý đội hình thông minh nhất
          </p>
          <Button size="lg" className="gradient-primary text-lg px-8" asChild>
            <Link to="/auth">
              Bắt đầu miễn phí
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
