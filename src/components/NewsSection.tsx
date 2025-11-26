import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "@/contexts/LocalizationContext";

const NewsSection = () => {
  const { t, locale } = useT();
  // Mock news data - in production this would come from an API or database
  const news = [
    {
      id: 1,
      titleKey: "news.item1.title",
      titleFallback: "New AI Squad Builder Feature",
      descriptionKey: "news.item1.description",
      descriptionFallback: "Discover AI technology that helps you build the perfect squad in seconds",
      date: "2024-01-15",
      categoryKey: "news.item1.category",
      categoryFallback: "New Feature",
    },
    {
      id: 2,
      titleKey: "news.item2.title",
      titleFallback: "Player Database Update for New Season",
      descriptionKey: "news.item2.description",
      descriptionFallback: "Database updated with over 10,000 players from the current season",
      date: "2024-01-14",
      categoryKey: "news.item2.category",
      categoryFallback: "Update",
    },
    {
      id: 3,
      titleKey: "news.item3.title",
      titleFallback: "Top 10 Notable Players in January",
      descriptionKey: "news.item3.description",
      descriptionFallback: "List of players with the highest performance in the past month",
      date: "2024-01-13",
      categoryKey: "news.item3.category",
      categoryFallback: "News",
    },
    {
      id: 4,
      titleKey: "news.item4.title",
      titleFallback: "Squad Optimization Guide",
      descriptionKey: "news.item4.description",
      descriptionFallback: "Tips and tactics to make your squad stronger",
      date: "2024-01-12",
      categoryKey: "news.item4.category",
      categoryFallback: "Guide",
    },
  ];

  return (
    <section className="py-12 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {t("newsSection.title", "Bảng tin FC Mobile")}
            </h2>
            <p className="text-muted-foreground">
              {t("newsSection.subtitle", "Tin tức và cập nhật mới nhất")}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/news">
              {t("newsSection.viewAll", "Xem tất cả")}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((item) => (
            <Link key={item.id} to={`/news/${item.id}`}>
              <Card
                className="card-hover p-6 border-border/50 hover:border-primary/50 transition-all cursor-pointer h-full"
              >
              <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {t(item.categoryKey, item.categoryFallback)}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{t(item.titleKey, item.titleFallback)}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {t(item.descriptionKey, item.descriptionFallback)}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(item.date).toLocaleDateString(locale === "en" ? "en-US" : "vi-VN")}</span>
              </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
