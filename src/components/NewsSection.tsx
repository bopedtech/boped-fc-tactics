import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";

const NewsSection = () => {
  // Mock news data - in production this would come from an API or database
  const news = [
    {
      id: 1,
      title: "Ra mắt tính năng AI Squad Builder mới",
      description: "Khám phá công nghệ AI giúp bạn xây dựng đội hình hoàn hảo trong vài giây",
      date: "2024-01-15",
      category: "Tính năng mới",
    },
    {
      id: 2,
      title: "Cập nhật dữ liệu cầu thủ mùa giải mới",
      description: "Database đã được cập nhật với hơn 10,000 cầu thủ từ mùa giải hiện tại",
      date: "2024-01-14",
      category: "Cập nhật",
    },
    {
      id: 3,
      title: "Top 10 cầu thủ đáng chú ý tháng 1",
      description: "Danh sách những cầu thủ có phong độ cao nhất trong tháng vừa qua",
      date: "2024-01-13",
      category: "Tin tức",
    },
    {
      id: 4,
      title: "Hướng dẫn tối ưu hóa đội hình",
      description: "Những mẹo và chiến thuật giúp đội hình của bạn mạnh hơn",
      date: "2024-01-12",
      category: "Hướng dẫn",
    },
  ];

  return (
    <section className="py-12 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Bảng tin FC Mobile</h2>
            <p className="text-muted-foreground">Tin tức và cập nhật mới nhất</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((item) => (
            <Card
              key={item.id}
              className="card-hover p-6 border-border/50 hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {item.category}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(item.date).toLocaleDateString("vi-VN")}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
