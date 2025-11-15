import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AISearchBar from "@/components/AISearchBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Users, Zap, Sparkles, TrendingUp, Shield, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [featuredPlayers, setFeaturedPlayers] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    try {
      // Fetch top-rated players
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("is_visible", true)
        .order("rating", { ascending: false })
        .limit(12);

      if (playersError) throw playersError;
      setFeaturedPlayers(players || []);

      // Fetch popular formations
      const { data: formationsData, error: formationsError } = await supabase
        .from("formations")
        .select("*")
        .limit(6);

      if (formationsError) throw formationsError;
      setFormations(formationsData || []);
    } catch (error: any) {
      console.error("Error fetching featured data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      icon: Database,
      title: "Cơ sở dữ liệu",
      description: "Tìm kiếm và phân tích cầu thủ",
      link: "/database",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Zap,
      title: "Squad Builder",
      description: "Xây dựng đội hình tối ưu",
      link: "/builder",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: TrendingUp,
      title: "Đội hình của tôi",
      description: "Quản lý các squad đã lưu",
      link: "/my-squads",
      gradient: "from-orange-500/20 to-red-500/20",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* AI Search Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 gradient-glow opacity-10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Squad Builder</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="gradient-primary bg-clip-text text-transparent">
                BopedFCTactics
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Xây dựng đội hình FC Mobile hoàn hảo với sự trợ giúp của AI
            </p>
          </div>

          <AISearchBar />
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((link, idx) => (
              <Link key={idx} to={link.link}>
                <Card className="card-hover p-6 border-border/50 hover:border-primary/50 transition-all group">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{link.title}</h3>
                  <p className="text-muted-foreground text-sm">{link.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Players */}
      <section className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Cầu thủ nổi bật</h2>
              <p className="text-muted-foreground">Top cầu thủ được đánh giá cao nhất</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/database">
                Xem tất cả
                <Users className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse bg-card rounded-lg h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredPlayers.map((player) => (
                <Card
                  key={player.assetId}
                  className="card-hover p-4 border-border/50 hover:border-primary/50 transition-all group cursor-pointer"
                  onClick={() => toast.info("Chi tiết cầu thủ - Coming soon!")}
                >
                  <div className="relative mb-2">
                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                      {player.rating}
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                      {player.images?.portrait ? (
                        <img
                          src={player.images.portrait}
                          alt={player.commonName || player.lastName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Shield className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm truncate">
                      {player.commonName || player.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{player.position}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Formations */}
      <section className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Sơ đồ chiến thuật phổ biến</h2>
              <p className="text-muted-foreground">Các formation được sử dụng nhiều nhất</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/builder">
                Xây đội hình
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-card rounded-lg h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {formations.map((formation) => (
                <Card
                  key={formation.id}
                  className="card-hover p-4 border-border/50 hover:border-primary/50 transition-all group cursor-pointer"
                  onClick={() => toast.info("Sử dụng formation này trong Builder!")}
                >
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-primary">{formation.nameEn}</div>
                    <p className="text-sm font-medium">{formation.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formation.category}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-16 border-t border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI trợ lý chiến thuật thông minh
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nhận gợi ý cầu thủ, sơ đồ chiến thuật và Manager Mode tối ưu từ AI
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gradient-primary" asChild>
                <Link to="/builder">
                  <Zap className="mr-2 h-5 w-5" />
                  Bắt đầu xây dựng
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/database">
                  <Database className="mr-2 h-5 w-5" />
                  Khám phá cầu thủ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
