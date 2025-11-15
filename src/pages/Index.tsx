import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AISearchBar from "@/components/AISearchBar";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import PlayerCard from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Users, Zap, TrendingUp, Shield, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [latestPlayers, setLatestPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    try {
      // Fetch latest 8 players based on createdAt
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("is_visible", true)
        .order("createdAt", { ascending: false })
        .limit(8);

      if (playersError) throw playersError;
      setLatestPlayers(players || []);
    } catch (error: any) {
      console.error("Error fetching latest players:", error);
    } finally {
      setLoading(false);
    }
  };

  const widgets = [
    {
      icon: Database,
      title: "Tìm cầu thủ",
      link: "/database",
    },
    {
      icon: Zap,
      title: "Xây đội hình",
      link: "/builder",
    },
    {
      icon: TrendingUp,
      title: "Đội hình của tôi",
      link: "/my-squads",
    },
    {
      icon: Gift,
      title: "Code FC Mobile",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* AI Search Hero */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 gradient-glow opacity-10" />
        <div className="container relative z-10 mx-auto px-4">
          <AISearchBar />
        </div>
      </section>

      {/* Widgets */}
      <section className="py-8 border-t border-border/40">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Tiện ích</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {widgets.map((widget, idx) => (
              <Link key={idx} to={widget.link}>
                <Card className="card-hover p-6 border-border/50 hover:border-primary/50 transition-all group text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <widget.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm md:text-base">{widget.title}</h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Players */}
      <section className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Cầu thủ mới nhất</h2>
              <p className="text-muted-foreground">Những cầu thủ được cập nhật gần đây</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/database">
                Xem tất cả
                <Users className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-card rounded-lg h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latestPlayers.map((player) => (
                <PlayerCard 
                  key={player.assetId} 
                  player={player}
                  onClick={() => toast.info("Chi tiết cầu thủ - Coming soon!")}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News Section */}
      <NewsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
