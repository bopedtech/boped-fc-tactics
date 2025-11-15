import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Search } from "lucide-react";

// Mock news data
const allNews = [
  {
    id: 1,
    title: "Ra mắt tính năng AI Squad Builder mới",
    description: "Khám phá công nghệ AI giúp bạn xây dựng đội hình hoàn hảo trong vài giây. Tính năng mới này sử dụng machine learning để phân tích và đề xuất đội hình tối ưu.",
    date: "2024-01-15",
    category: "Tính năng mới",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Cập nhật dữ liệu cầu thủ mùa giải mới",
    description: "Database đã được cập nhật với hơn 10,000 cầu thủ từ mùa giải hiện tại. Bao gồm tất cả các chỉ số mới nhất và rating cập nhật.",
    date: "2024-01-14",
    category: "Cập nhật",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Top 10 cầu thủ đáng chú ý tháng 1",
    description: "Danh sách những cầu thủ có phong độ cao nhất trong tháng vừa qua. Phân tích chi tiết về hiệu suất và những pha bóng xuất sắc.",
    date: "2024-01-13",
    category: "Tin tức",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop",
  },
  {
    id: 4,
    title: "Hướng dẫn tối ưu hóa đội hình",
    description: "Những mẹo và chiến thuật giúp đội hình của bạn mạnh hơn. Tìm hiểu cách phối hợp các vị trí và tối đa hóa chemistry.",
    date: "2024-01-12",
    category: "Hướng dẫn",
    image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&h=400&fit=crop",
  },
  {
    id: 5,
    title: "Event mới: Săn thẻ cầu thủ Icons",
    description: "Sự kiện đặc biệt với cơ hội nhận thẻ cầu thủ Icons độc quyền. Tham gia ngay để không bỏ lỡ!",
    date: "2024-01-11",
    category: "Sự kiện",
    image: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&h=400&fit=crop",
  },
  {
    id: 6,
    title: "Phân tích đội hình Meta tháng 1",
    description: "Những đội hình được sử dụng nhiều nhất và tỷ lệ thắng cao. Cập nhật xu hướng mới nhất từ cộng đồng.",
    date: "2024-01-10",
    category: "Phân tích",
    image: "https://images.unsplash.com/photo-1577223625816-7546f8be7816?w=800&h=400&fit=crop",
  },
  {
    id: 7,
    title: "Tips nâng cao kỹ năng Squad Building",
    description: "Bí quyết xây dựng đội hình từ các chuyên gia. Học cách cân đối giữa tấn công và phòng thủ.",
    date: "2024-01-09",
    category: "Hướng dẫn",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=400&fit=crop",
  },
  {
    id: 8,
    title: "Cập nhật Balance Patch mới nhất",
    description: "Những thay đổi quan trọng về cân bằng game và chỉ số cầu thủ. Xem chi tiết những điều chỉnh mới.",
    date: "2024-01-08",
    category: "Cập nhật",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=400&fit=crop",
  },
];

const News = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Tất cả", "Tin tức", "Cập nhật", "Hướng dẫn", "Tính năng mới", "Sự kiện", "Phân tích"];

  const filteredNews = allNews.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "Tất cả" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16 border-b border-border/40">
          <div className="absolute inset-0 gradient-glow opacity-10" />
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Bảng tin FC Mobile
              </h1>
              <p className="text-lg text-muted-foreground">
                Tin tức, cập nhật và hướng dẫn mới nhất về FC Mobile
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tin tức..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-6 border-b border-border/40 sticky top-16 bg-background/95 backdrop-blur-sm z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category || (!selectedCategory && category === "Tất cả") ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSelectedCategory(category === "Tất cả" ? null : category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không tìm thấy bài viết nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item) => (
                  <Link key={item.id} to={`/news/${item.id}`}>
                    <Card className="card-hover overflow-hidden border-border/50 hover:border-primary/50 transition-all h-full group">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6 space-y-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {item.category}
                        </Badge>
                        <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(item.date).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default News;
