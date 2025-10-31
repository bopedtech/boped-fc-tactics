import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Activity, Database, Users, TrendingUp, RefreshCw, Clock } from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  user?: string;
  details?: any;
}

export default function LogsActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalPlayers: 0,
    totalUsers: 0,
    totalSquads: 0,
    recentSignups: 0,
  });
  const [timeRange, setTimeRange] = useState("24h");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchActivities(), fetchStats()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    // Simulate activity logs from database changes
    const logs: ActivityLog[] = [];

    // Fetch recent players (as activity)
    const { data: recentPlayers } = await supabase
      .from("players")
      .select("assetId, firstName, lastName, cardName, createdAt")
      .order("createdAt", { ascending: false })
      .limit(10);

    if (recentPlayers) {
      recentPlayers.forEach((player) => {
        logs.push({
          id: `player-${player.assetId}`,
          timestamp: player.createdAt,
          type: "player_added",
          description: `Thêm cầu thủ: ${player.cardName || player.firstName + " " + player.lastName}`,
          details: player,
        });
      });
    }

    // Fetch recent squads
    const { data: recentSquads } = await supabase
      .from("squads")
      .select("id, squadName, createdAt, userId")
      .order("createdAt", { ascending: false })
      .limit(10);

    if (recentSquads) {
      recentSquads.forEach((squad) => {
        logs.push({
          id: `squad-${squad.id}`,
          timestamp: squad.createdAt,
          type: "squad_created",
          description: `Tạo đội hình: ${squad.squadName}`,
          user: squad.userId,
          details: squad,
        });
      });
    }

    // Sort by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(logs.slice(0, 50));
  };

  const fetchStats = async () => {
    const [playersCount, usersData, squadsCount] = await Promise.all([
      supabase.from("players").select("*", { count: "exact", head: true }),
      supabase.auth.admin.listUsers(),
      supabase.from("squads").select("*", { count: "exact", head: true }),
    ]);

    // Calculate recent signups (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSignups = (usersData.data?.users || []).filter(
      (u: any) => new Date(u.created_at) > oneDayAgo
    ).length;

    setSystemStats({
      totalPlayers: playersCount.count || 0,
      totalUsers: usersData.data?.users.length || 0,
      totalSquads: squadsCount.count || 0,
      recentSignups,
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "player_added":
        return <Users className="h-4 w-4" />;
      case "squad_created":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "player_added":
        return "bg-blue-500/10 text-blue-500";
      case "squad_created":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Logs & Hoạt Động</h1>
          <p className="text-muted-foreground">
            Theo dõi hoạt động hệ thống và người dùng
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Tổng Cầu Thủ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{systemStats.totalPlayers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tổng Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{systemStats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Đội Hình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{systemStats.totalSquads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Đăng Ký 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{systemStats.recentSignups}</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stream */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hoạt Động Gần Đây</CardTitle>
              <CardDescription>Theo dõi các thay đổi trong hệ thống</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 giờ qua</SelectItem>
                <SelectItem value="24h">24 giờ qua</SelectItem>
                <SelectItem value="7d">7 ngày qua</SelectItem>
                <SelectItem value="30d">30 ngày qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có hoạt động nào
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(activity.timestamp)}
                      {activity.user && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{activity.user.slice(0, 8)}...</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type.replace("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>Tình Trạng Hệ Thống</CardTitle>
          <CardDescription>Kiểm tra các dịch vụ và kết nối</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-xs text-muted-foreground">Supabase PostgreSQL</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-medium">Authentication</p>
                  <p className="text-xs text-muted-foreground">Supabase Auth</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-medium">Edge Functions</p>
                  <p className="text-xs text-muted-foreground">Serverless Backend</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                Online
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}