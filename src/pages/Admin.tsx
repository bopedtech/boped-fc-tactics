import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Users, Play, Trophy } from "lucide-react";
import Header from "@/components/Header";

export default function Admin() {
  const [syncingPlayers, setSyncingPlayers] = useState(false);
  const [playersResult, setPlayersResult] = useState<any>(null);
  const [syncingLeagues, setSyncingLeagues] = useState(false);
  const [leaguesResult, setLeaguesResult] = useState<any>(null);

  const handleSyncPlayers = async (mode: 'test' | 'full' = 'test') => {
    try {
      setSyncingPlayers(true);
      setPlayersResult(null);
      toast.info(`Đang đồng bộ cầu thủ (${mode === 'test' ? '5 trang test' : 'toàn bộ'})...`);

      const { data, error } = await supabase.functions.invoke('sync-players', {
        body: { 
          mode: mode,
          maxPages: 5
        }
      });

      if (error) throw error;

      setPlayersResult(data);
      toast.success("Đồng bộ cầu thủ thành công!");
    } catch (error) {
      console.error("Error syncing players:", error);
      toast.error("Lỗi khi đồng bộ cầu thủ: " + (error as Error).message);
    } finally {
      setSyncingPlayers(false);
    }
  };

  const handleSyncLeagues = async () => {
    try {
      setSyncingLeagues(true);
      setLeaguesResult(null);
      toast.info('Đang đồng bộ dữ liệu giải đấu toàn cục...');

      const { data, error } = await supabase.functions.invoke('sync-leagues');

      if (error) throw error;

      setLeaguesResult(data);
      toast.success("Đồng bộ giải đấu thành công!");
    } catch (error) {
      console.error("Error syncing leagues:", error);
      toast.error("Lỗi khi đồng bộ giải đấu: " + (error as Error).message);
    } finally {
      setSyncingLeagues(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Quản Trị Hệ Thống</h1>
          <p className="text-muted-foreground">Quản lý đồng bộ dữ liệu từ Renderz API</p>
        </div>

        <div className="space-y-6">
          {/* Sync Players Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <CardTitle>Đồng Bộ Cầu Thủ</CardTitle>
              </div>
              <CardDescription>
                Đồng bộ dữ liệu cầu thủ từ mùa 24, 25, 26
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSyncPlayers('test')}
                  disabled={syncingPlayers}
                  variant="outline"
                  className="flex-1"
                >
                  {syncingPlayers ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Test (5 trang)
                </Button>
                <Button 
                  onClick={() => handleSyncPlayers('full')}
                  disabled={syncingPlayers}
                  className="flex-1"
                >
                  {syncingPlayers ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Toàn Bộ
                </Button>
              </div>

              {playersResult && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-green-600">✅ {playersResult.message}</p>
                  <div className="text-xs space-y-1">
                    <p>• Tổng cầu thủ: {playersResult.totalPlayers}</p>
                    <p>• Tổng trang: {playersResult.totalPages}</p>
                    <p>• Chế độ: {playersResult.mode}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Leagues Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <CardTitle>Đồng Bộ Giải Đấu</CardTitle>
              </div>
              <CardDescription>
                Đồng bộ dữ liệu giải đấu toàn cục (Universal Data - không phụ thuộc mùa)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSyncLeagues}
                disabled={syncingLeagues}
                className="w-full"
              >
                {syncingLeagues ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Đồng Bộ Leagues
              </Button>

              {leaguesResult && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-green-600">✅ {leaguesResult.message}</p>
                  <div className="text-xs space-y-1">
                    <p>• Tổng giải đấu: {leaguesResult.totalLeagues}</p>
                    {leaguesResult.reference && (
                      <p className="text-muted-foreground italic">• {leaguesResult.reference}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Hướng Dẫn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>1. Test đồng bộ cầu thủ:</strong> Chạy test mode (5 trang ~50 cầu thủ) để kiểm tra.</p>
            <p><strong>2. Đồng bộ toàn bộ:</strong> Sau khi test thành công, chạy full sync để lấy toàn bộ dữ liệu.</p>
            <p className="text-yellow-600 mt-4"><strong>⚠️ Lưu ý:</strong> Full sync có thể mất vài phút. Không tắt trình duyệt trong lúc đồng bộ.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
