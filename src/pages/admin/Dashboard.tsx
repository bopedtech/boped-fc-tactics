import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Database, Trophy, TrendingUp, Activity, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalUsers: 0,
    totalSquads: 0,
    totalLeagues: 0,
    totalTeams: 0,
    totalNations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [
        playersCount,
        usersCount,
        squadsCount,
        leaguesCount,
        teamsCount,
        nationsCount,
      ] = await Promise.all([
        supabase.from("players").select("*", { count: "exact", head: true }),
        supabase.auth.admin.listUsers(),
        supabase.from("squads").select("*", { count: "exact", head: true }),
        supabase.from("leagues").select("*", { count: "exact", head: true }),
        supabase.from("teams").select("*", { count: "exact", head: true }),
        supabase.from("nations").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalPlayers: playersCount.count || 0,
        totalUsers: usersCount.data?.users.length || 0,
        totalSquads: squadsCount.count || 0,
        totalLeagues: leaguesCount.count || 0,
        totalTeams: teamsCount.count || 0,
        totalNations: nationsCount.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Tổng Cầu Thủ",
      value: stats.totalPlayers.toLocaleString(),
      description: "Cầu thủ trong database",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Người Dùng",
      value: stats.totalUsers.toLocaleString(),
      description: "Tài khoản đã đăng ký",
      icon: Shield,
      color: "text-green-500",
    },
    {
      title: "Đội Hình",
      value: stats.totalSquads.toLocaleString(),
      description: "Đội hình đã tạo",
      icon: Activity,
      color: "text-purple-500",
    },
    {
      title: "Giải Đấu",
      value: stats.totalLeagues.toLocaleString(),
      description: "Giải đấu trong hệ thống",
      icon: Trophy,
      color: "text-yellow-500",
    },
    {
      title: "Câu Lạc Bộ",
      value: stats.totalTeams.toLocaleString(),
      description: "CLB trong database",
      icon: Database,
      color: "text-red-500",
    },
    {
      title: "Quốc Gia",
      value: stats.totalNations.toLocaleString(),
      description: "Quốc gia trong hệ thống",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống và thống kê nhanh
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt Động Gần Đây</CardTitle>
          <CardDescription>
            Theo dõi các hoạt động quan trọng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <Activity className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Hệ thống đang hoạt động bình thường</p>
                <p className="text-xs text-muted-foreground">Tất cả dịch vụ đang online</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <Database className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Database đã được cập nhật</p>
                <p className="text-xs text-muted-foreground">Dữ liệu cầu thủ mới nhất</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}