import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import PlayerFilters from "@/components/PlayerFilters";
import { usePlayerFilters } from "@/hooks/usePlayerFilters";
import PlayerDetailDialog from "@/components/PlayerDetailDialog";

interface PlayerStats {
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defense?: number;
  physicality?: number;
  diving?: number;
  handling?: number;
  kicking?: number;
  reflexes?: number;
  speed?: number;
  positioning?: number;
}

interface Player {
  assetId: number;
  playerId: number;
  firstName?: string;
  lastName?: string;
  commonName?: string;
  cardName?: string;
  rating: number;
  position?: string;
  nation?: any;
  club?: any;
  league?: any;
  images?: any;
  stats?: PlayerStats;
  traits?: any;
  workRates?: any;
  potentialPositions?: any;
  height?: number;
  weight?: number;
  weakFoot?: number;
  skillMovesLevel?: number;
  foot?: number;
  birthday?: string;
  bio?: string;
  tags?: string;
  priceData?: any;
  avgStats?: any;
  avgGkStats?: any;
  skillMoves?: any;
  skillStyleId?: number;
  skillStyleSkills?: any;
  animation?: any;
  celebration?: any;
  rawData?: any;
  createdAt?: string;
  updatedAt?: string;
}

const PAGE_SIZE = 20;

export default function Database() {
  const queryClient = useQueryClient();
  const [searchName, setSearchName] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [teamsData, setTeamsData] = useState<Array<{ id: number; displayName: string; image?: string }>>([]);
  const [leaguesData, setLeaguesData] = useState<Array<{ id: number; displayName: string; image?: string }>>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedPlayerAssetId, setSelectedPlayerAssetId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const { filters, setFilters, resetFilters: resetFilterState } = usePlayerFilters();

  const handlePlayerClick = (assetId: number) => {
    setSelectedPlayerAssetId(assetId);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchCountries();
    fetchTeams();
    fetchLeagues();
    checkSuperAdminRole();
  }, []);

  const checkSuperAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .single();

      if (data && !error) {
        setIsSuperAdmin(true);
      }
    } catch (error) {
      console.error("Error checking super admin role:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from("nations")
        .select("id, displayName, image")
        .order("displayName", { ascending: true });
      if (error) throw error;
      if (data) setCountriesData(data);
    } catch (error) {
      console.error("Error fetching nations:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("id, displayName, image")
        .order("displayName", { ascending: true });
      if (error) throw error;
      if (data) setTeamsData(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from("leagues")
        .select("id, displayName, image")
        .order("displayName", { ascending: true });
      if (error) throw error;
      if (data) setLeaguesData(data);
    } catch (error) {
      console.error("Error fetching leagues:", error);
    }
  };

  const fetchPlayersPage = async ({ pageParam = 0 }) => {
    let query = supabase
      .from("players")
      .select("*", { count: "exact" })
      .order("rating", { ascending: false })
      .order("assetId", { ascending: false });

    // Apply search filter
    if (searchName.trim()) {
      query = query.or(`commonName.ilike.%${searchName}%,cardName.ilike.%${searchName}%,firstName.ilike.%${searchName}%,lastName.ilike.%${searchName}%`);
    }

    // Apply rating filter
    if (filters.ratingRange[0] > 0) {
      query = query.gte("rating", filters.ratingRange[0]);
    }
    if (filters.ratingRange[1] < 125) {
      query = query.lte("rating", filters.ratingRange[1]);
    }

    // Apply position filter
    if (filters.positionFilter !== "all") {
      query = query.eq("position", filters.positionFilter);
    }

    // Apply nation filter
    if (filters.nations.length > 0) {
      const nationFilters = filters.nations.map(n => `nation->>id.eq.${n}`).join(',');
      query = query.or(nationFilters);
    }

    // Apply club filter
    if (filters.clubs.length > 0) {
      const clubFilters = filters.clubs.map(c => `club->>id.eq.${c}`).join(',');
      query = query.or(clubFilters);
    }

    // Apply league filter
    if (filters.leagues.length > 0) {
      const leagueFilters = filters.leagues.map(l => `league->>id.eq.${l}`).join(',');
      query = query.or(leagueFilters);
    }

    // Pagination
    query = query.range(pageParam, pageParam + PAGE_SIZE - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      players: data || [],
      nextPage: data && data.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
      totalCount: count || 0,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["players", searchName, filters],
    queryFn: fetchPlayersPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const resetFilters = () => {
    setSearchName("");
    resetFilterState();
  };

  const allPlayers = data?.pages.flatMap(page => page.players) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

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
      queryClient.invalidateQueries({ queryKey: ["players"] });
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

        {/* Sync Controls - Only for Super Admin */}
        {isSuperAdmin && (
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
        )}

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
                {allPlayers.length} / {totalCount} cầu thủ
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-96 bg-card animate-pulse rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <p className="text-xl text-destructive">
                  Có lỗi xảy ra khi tải dữ liệu
                </p>
              </div>
            ) : allPlayers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  Không tìm thấy cầu thủ nào
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allPlayers.map((player) => (
                    <PlayerCard 
                      key={player.assetId} 
                      player={player as any} 
                      teamsData={teamsData}
                      nationsData={countriesData as any}
                      leaguesData={leaguesData}
                      onClick={() => handlePlayerClick(player.assetId)}
                    />
                  ))}
                </div>
                
                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="py-8 text-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-muted-foreground">Đang tải thêm...</span>
                    </div>
                  ) : hasNextPage ? (
                    <Button
                      onClick={() => fetchNextPage()}
                      variant="outline"
                      className="min-w-[200px]"
                    >
                      Tải thêm cầu thủ
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">
                      Đã hiển thị tất cả {totalCount} cầu thủ
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <PlayerDetailDialog
        assetId={selectedPlayerAssetId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
