import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Squad {
  id: string;
  squadName: string;
  formation: string;
  lineup: any;
  playstyle?: string;
  createdAt: string;
}

export default function MySquads() {
  const navigate = useNavigate();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    fetchSquads(session.user.id);
  };

  const fetchSquads = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("squads")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      setSquads(data || []);
    } catch (error: any) {
      toast.error("Không thể tải đội hình");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSquad = async (id: string) => {
    try {
      const { error } = await supabase.from("squads").delete().eq("id", id);

      if (error) throw error;

      setSquads(squads.filter((s) => s.id !== id));
      toast.success("Đã xóa đội hình");
    } catch (error: any) {
      toast.error("Không thể xóa đội hình");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
              Đội hình của tôi
            </h1>
            <p className="text-muted-foreground">
              Quản lý các đội hình bạn đã tạo
            </p>
          </div>
          <Button
            className="gradient-primary"
            onClick={() => navigate("/builder")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo đội hình mới
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        ) : squads.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4 text-6xl">⚽</div>
            <h2 className="text-2xl font-bold mb-2">Chưa có đội hình nào</h2>
            <p className="text-muted-foreground mb-6">
              Bắt đầu xây dựng đội hình đầu tiên của bạn
            </p>
            <Button
              className="gradient-primary"
              onClick={() => navigate("/builder")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo đội hình
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {squads.map((squad) => (
              <Card key={squad.id} className="p-6 card-hover">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1">{squad.squadName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Sơ đồ: {squad.formation}
                  </p>
                  {squad.playstyle && (
                    <p className="text-sm text-accent mt-1">
                      Lối chơi: {squad.playstyle}
                    </p>
                  )}
                </div>

                <div className="bg-pitch-green rounded-lg p-4 mb-4 aspect-video relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white/20 text-4xl font-bold">
                    {squad.formation}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/builder?squad=${squad.id}`)}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteSquad(squad.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
