import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import PlayerFilters from "@/components/PlayerFilters";
import { usePlayerFilters } from "@/hooks/usePlayerFilters";

interface Player {
  id: number;
  common_name: string;
  rating: number;
  position: string;
  nation?: any;
  club?: any;
  league?: any;
  images?: any;
  stats: any;
  traits?: any;
  work_rate_att?: number;
  work_rate_def?: number;
  potential_positions?: any;
  height?: number;
  weight?: number;
  weak_foot?: number;
  skill_moves_level?: number;
  foot?: number;
  created_at?: string;
}

export default function Database() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  
  const { filters, setFilters, resetFilters: resetFilterState, applyFiltersToQuery } = usePlayerFilters();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("rating", { ascending: false })
        .limit(500);

      if (error) throw error;
      setAllPlayers(data || []);
      applyFilters(data || []);
    } catch (error: any) {
      toast.error("Không thể tải dữ liệu cầu thủ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (playerList: Player[] = allPlayers) => {
    let filtered = [...playerList];

    // Apply search filter
    if (searchName) {
      filtered = filtered.filter(p =>
        p.common_name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Apply filter component filters
    filtered = applyFiltersToQuery(filtered);

    setDisplayedPlayers(filtered);
  };

  const resetFilters = () => {
    setSearchName("");
    resetFilterState();
    setDisplayedPlayers(allPlayers);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, searchName, allPlayers]);

  const handleSync = async (mode: 'test' | 'full', maxPages: number = 2) => {
    try {
      setSyncing(true);
      setSyncStatus(`Đang đồng bộ dữ liệu (${mode === 'test' ? 'Test' : 'Full'})...`);
      
      const { data, error } = await supabase.functions.invoke('sync-players', {
        body: { mode, maxPages }
      });

      if (error) throw error;

      setSyncStatus(data.message || 'Đồng bộ hoàn tất!');
      toast.success(`Đã đồng bộ ${data.totalPlayers} cầu thủ`);
      
      // Refresh the player list
      await fetchPlayers();
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncStatus('Lỗi khi đồng bộ dữ liệu');
      toast.error('Không thể đồng bộ dữ liệu cầu thủ');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Cơ sở dữ liệu cầu thủ FC Mobile
          </h1>
          <p className="text-muted-foreground">
            Khám phá và tìm kiếm cầu thủ cho đội hình FC Mobile của bạn
          </p>
        </div>

        {/* Sync Controls */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Đồng bộ dữ liệu</h3>
              <p className="text-sm text-muted-foreground">
                Cập nhật cơ sở dữ liệu cầu thủ từ FIFA Renderz
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSync('test', 2)}
                disabled={syncing}
                variant="outline"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Test (2 trang)
              </Button>
              <Button
                onClick={() => handleSync('full', 100)}
                disabled={syncing}
                className="gradient-primary"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Full Sync
              </Button>
            </div>
          </div>
          {syncStatus && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm">{syncStatus}</p>
            </div>
          )}
        </Card>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-card rounded-lg border sticky top-20 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Bộ lọc
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search by Name */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="max-h-[calc(100vh-300px)]">
                <PlayerFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  onReset={resetFilters}
                />
              </div>
            </div>
          </div>

          {/* Player Grid */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center lg:hidden">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
              <p className="text-sm text-muted-foreground">
                {displayedPlayers.length} cầu thủ
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-96 bg-card animate-pulse rounded-lg" />
                ))}
              </div>
            ) : displayedPlayers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  Không tìm thấy cầu thủ nào
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
