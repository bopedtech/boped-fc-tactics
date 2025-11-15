import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

// Mock news data - same as in News.tsx
const allNews = [
  {
    id: 1,
    title: "Ra mắt tính năng AI Squad Builder mới",
    description: "Khám phá công nghệ AI giúp bạn xây dựng đội hình hoàn hảo trong vài giây",
    date: "2024-01-15",
    category: "Tính năng mới",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=600&fit=crop",
    content: `
      <p>Chúng tôi vui mừng giới thiệu tính năng AI Squad Builder - một bước đột phá trong việc xây dựng đội hình FC Mobile.</p>
      
      <h2>Tính năng nổi bật</h2>
      <ul>
        <li>Phân tích tự động hơn 10,000 cầu thủ</li>
        <li>Đề xuất đội hình tối ưu dựa trên chemistry và phong cách chơi</li>
        <li>Tùy chỉnh ngân sách và vị trí ưu tiên</li>
        <li>So sánh nhiều phương án đội hình</li>
      </ul>
      
      <h2>Cách sử dụng</h2>
      <p>1. Truy cập trang Squad Builder</p>
      <p>2. Nhấn nút "AI Gợi ý"</p>
      <p>3. Chọn phong cách chơi và ngân sách</p>
      <p>4. Nhận đề xuất đội hình tối ưu trong vài giây</p>
      
      <h2>Công nghệ AI tiên tiến</h2>
      <p>Hệ thống sử dụng machine learning để phân tích hàng triệu đội hình thành công, từ đó đưa ra gợi ý phù hợp nhất với nhu cầu của bạn.</p>
    `,
  },
  {
    id: 2,
    title: "Cập nhật dữ liệu cầu thủ mùa giải mới",
    description: "Database đã được cập nhật với hơn 10,000 cầu thủ từ mùa giải hiện tại",
    date: "2024-01-14",
    category: "Cập nhật",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&h=600&fit=crop",
    content: `
      <p>Database cầu thủ của chúng tôi đã được cập nhật hoàn toàn với dữ liệu mùa giải mới nhất.</p>
      
      <h2>Những gì đã được cập nhật</h2>
      <ul>
        <li>Hơn 10,000 cầu thủ mới</li>
        <li>Rating và chỉ số cập nhật</li>
        <li>Hình ảnh chân dung mới</li>
        <li>Thông tin câu lạc bộ và giải đấu</li>
      </ul>
      
      <h2>Cách tìm kiếm cầu thủ</h2>
      <p>Sử dụng bộ lọc nâng cao để tìm chính xác cầu thủ bạn cần theo vị trí, rating, quốc tịch và nhiều tiêu chí khác.</p>
    `,
  },
  {
    id: 3,
    title: "Top 10 cầu thủ đáng chú ý tháng 1",
    description: "Danh sách những cầu thủ có phong độ cao nhất trong tháng vừa qua",
    date: "2024-01-13",
    category: "Tin tức",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=600&fit=crop",
    content: `
      <p>Đây là danh sách 10 cầu thủ có phong độ xuất sắc nhất trong tháng 1.</p>
      
      <h2>Top 10 Cầu thủ</h2>
      <ol>
        <li>Erling Haaland - Hiệu suất ghi bàn ấn tượng</li>
        <li>Kylian Mbappé - Tốc độ và kỹ thuật vượt trội</li>
        <li>Kevin De Bruyne - Kiến tạo xuất sắc</li>
        <li>Mohamed Salah - Phong độ ổn định</li>
        <li>Jude Bellingham - Tiềm năng trẻ</li>
      </ol>
      
      <p>Những cầu thủ này đang là lựa chọn hàng đầu cho mọi đội hình trong FC Mobile.</p>
    `,
  },
  {
    id: 4,
    title: "Hướng dẫn tối ưu hóa đội hình",
    description: "Những mẹo và chiến thuật giúp đội hình của bạn mạnh hơn",
    date: "2024-01-12",
    category: "Hướng dẫn",
    image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=1200&h=600&fit=crop",
    content: `
      <p>Tối ưu hóa đội hình là chìa khóa để thành công trong FC Mobile.</p>
      
      <h2>Nguyên tắc cơ bản</h2>
      <ul>
        <li>Chemistry: Đảm bảo chemistry tối thiểu 100</li>
        <li>Balance: Cân bằng giữa tấn công và phòng thủ</li>
        <li>Work Rate: Chú ý đến work rate của từng vị trí</li>
        <li>Position: Đặt cầu thủ đúng vị trí</li>
      </ul>
      
      <h2>Tips nâng cao</h2>
      <p>Kết hợp cầu thủ cùng quốc tịch hoặc cùng giải đấu để tăng chemistry. Sử dụng Manager phù hợp với formation.</p>
    `,
  },
  {
    id: 5,
    title: "Event mới: Săn thẻ cầu thủ Icons",
    description: "Sự kiện đặc biệt với cơ hội nhận thẻ cầu thủ Icons độc quyền",
    date: "2024-01-11",
    category: "Sự kiện",
    image: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=1200&h=600&fit=crop",
    content: `
      <p>Sự kiện đặc biệt với cơ hội sở hữu thẻ Icons của những huyền thoại bóng đá.</p>
      
      <h2>Thời gian sự kiện</h2>
      <p>Từ 15/01 đến 31/01/2024</p>
      
      <h2>Cách tham gia</h2>
      <ul>
        <li>Hoàn thành các nhiệm vụ hàng ngày</li>
        <li>Tham gia các trận đấu sự kiện</li>
        <li>Đổi điểm tích lũy lấy thẻ Icons</li>
      </ul>
      
      <p>Đừng bỏ lỡ cơ hội sở hữu những huyền thoại!</p>
    `,
  },
  {
    id: 6,
    title: "Phân tích đội hình Meta tháng 1",
    description: "Những đội hình được sử dụng nhiều nhất và tỷ lệ thắng cao",
    date: "2024-01-10",
    category: "Phân tích",
    image: "https://images.unsplash.com/photo-1577223625816-7546f8be7816?w=1200&h=600&fit=crop",
    content: `
      <p>Phân tích những đội hình Meta đang thống trị FC Mobile trong tháng 1.</p>
      
      <h2>Top Formation</h2>
      <ol>
        <li>4-3-3 Attack: Tấn công mạnh mẽ</li>
        <li>4-2-3-1: Cân bằng và linh hoạt</li>
        <li>3-5-2: Kiểm soát giữa sân</li>
      </ol>
      
      <h2>Cầu thủ phổ biến</h2>
      <p>Những vị trí ST, CAM và CB đang có giá trị cao nhất trong meta hiện tại.</p>
    `,
  },
  {
    id: 7,
    title: "Tips nâng cao kỹ năng Squad Building",
    description: "Bí quyết xây dựng đội hình từ các chuyên gia",
    date: "2024-01-09",
    category: "Hướng dẫn",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&h=600&fit=crop",
    content: `
      <p>Học hỏi từ các chuyên gia để xây dựng đội hình hoàn hảo.</p>
      
      <h2>Bí quyết từ Pro Players</h2>
      <ul>
        <li>Đầu tư vào khung xương đội hình</li>
        <li>Không cần full team Icons để thành công</li>
        <li>Chú trọng vào chemistry links</li>
        <li>Test nhiều formation khác nhau</li>
      </ul>
      
      <h2>Sai lầm cần tránh</h2>
      <p>Đừng mua cầu thủ quá đắt khi mới bắt đầu. Tập trung vào chemistry trước rating.</p>
    `,
  },
  {
    id: 8,
    title: "Cập nhật Balance Patch mới nhất",
    description: "Những thay đổi quan trọng về cân bằng game và chỉ số cầu thủ",
    date: "2024-01-08",
    category: "Cập nhật",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=600&fit=crop",
    content: `
      <p>Patch mới với nhiều thay đổi quan trọng về gameplay và chỉ số.</p>
      
      <h2>Thay đổi chính</h2>
      <ul>
        <li>Điều chỉnh Pace của một số cầu thủ</li>
        <li>Cân bằng lại Shooting mechanics</li>
        <li>Cải thiện AI phòng thủ</li>
        <li>Fix bugs về chemistry</li>
      </ul>
      
      <h2>Impact lên Meta</h2>
      <p>Những thay đổi này sẽ ảnh hưởng đến cách chơi và lựa chọn cầu thủ trong thời gian tới.</p>
    `,
  },
];

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const newsItem = allNews.find((item) => item.id === Number(id));

  if (!newsItem) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Không tìm thấy bài viết</h1>
            <Button onClick={() => navigate("/news")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại bảng tin
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedNews = allNews
    .filter((item) => item.id !== newsItem.id && item.category === newsItem.category)
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã copy link bài viết");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Back Button */}
        <section className="py-6 border-b border-border/40">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate("/news")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại bảng tin
            </Button>
          </div>
        </section>

        {/* Article Header */}
        <section className="py-8 border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {newsItem.category}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {newsItem.title}
              </h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(newsItem.date).toLocaleDateString("vi-VN", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video overflow-hidden rounded-xl">
                <img
                  src={newsItem.image}
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: newsItem.content }}
              />
            </div>
          </div>
        </section>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <section className="py-12 border-t border-border/40">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Bài viết liên quan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Link key={item.id} to={`/news/${item.id}`}>
                    <Card className="card-hover overflow-hidden border-border/50 hover:border-primary/50 transition-all h-full group">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(item.date).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
