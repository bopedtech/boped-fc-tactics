import { useEffect, useState, useRef, useCallback, Fragment } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TEXT } from "@/constants/text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Loader2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import PlayerFilters from "@/components/PlayerFilters";
import { usePlayerFilters } from "@/hooks/usePlayerFilters";
import PlayerDetailDialog from "@/components/PlayerDetailDialog";
import { useT } from "@/contexts/LocalizationContext";
import { useUserTierContext } from "@/contexts/UserTierContext";
import { NativeAdCard } from "@/components/ads/NativeAdCard";
import { AnchorAd } from "@/components/ads/AnchorAd";

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
  const { t } = useT();
  const { tier } = useUserTierContext();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [searchName, setSearchName] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [teamsData, setTeamsData] = useState<Array<{ id: number; displayName: string; image?: string }>>([]);
  const [leaguesData, setLeaguesData] = useState<Array<{ id: number; displayName: string; image?: string }>>([]);
  const [selectedPlayerAssetId, setSelectedPlayerAssetId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { filters, setFilters, resetFilters: resetFilterState, applyFiltersToQuery } = usePlayerFilters();

  // Get search query from URL parameter
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchName(searchQuery);
    }
  }, [searchParams]);

  // Auto switch to rating_desc when search or filter is active
  useEffect(() => {
    const hasSearch = searchName.trim().length > 0;
    const hasFilters =
      filters.ratingRange[0] > 40 || filters.ratingRange[1] < 125 ||
      filters.positionFilter !== "all" ||
      filters.positions.length > 0 ||
      filters.leagues.length > 0 ||
      filters.clubs.length > 0 ||
      filters.nations.length > 0 ||
      filters.programs.length > 0 ||
      filters.heightRange[0] > 150 || filters.heightRange[1] < 210 ||
      filters.weightRange[0] > 50 || filters.weightRange[1] < 110 ||
      filters.skillMovesLevel > 0 ||
      filters.weakFoot > 0 ||
      filters.strongFoot !== "all" ||
      filters.workRateAtt > 0 ||
      filters.workRateDef > 0 ||
      filters.traits.length > 0;

    if ((hasSearch || hasFilters) && sortBy === "newest") {
      setSortBy("rating_desc");
    }
  }, [searchName, filters, sortBy]);

  const handlePlayerClick = (assetId: number) => {
    setSelectedPlayerAssetId(assetId);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchCountries();
    fetchTeams();
    fetchLeagues();
  }, []);

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
      .select("assetId, commonName, cardName, firstName, lastName, rating, position, nation, club, league, images, avgStats, avgGkStats, auctionable, rank, createdAt, source, height, weight, skillMovesLevel, weakFoot, foot, workRates, traits, potentialPositions", { count: "exact" })
      .eq("is_visible", true); // Only show visible players to users

    // Apply sorting
    switch (sortBy) {
      case "rating_desc":
        query = query.order("rating", { ascending: false });
        break;
      case "rating_asc":
        query = query.order("rating", { ascending: true });
        break;
      case "name_asc":
        query = query.order("commonName", { ascending: true, nullsFirst: false });
        break;
      case "name_desc":
        query = query.order("commonName", { ascending: false, nullsFirst: false });
        break;
      case "oldest":
        query = query.order("createdAt", { ascending: true, nullsFirst: false });
        break;
      case "newest":
      default:
        query = query.order("createdAt", { ascending: false, nullsFirst: false });
        break;
    }

    // Add secondary sort by assetId for consistency
    query = query.order("assetId", { ascending: false });

    // Apply search filter
    if (searchName.trim()) {
      query = query.or(`commonName.ilike.%${searchName}%,cardName.ilike.%${searchName}%,firstName.ilike.%${searchName}%,lastName.ilike.%${searchName}%`);
    }

    // Apply rating filter at database level
    if (filters.ratingRange[0] > 40 || filters.ratingRange[1] < 125) {
      query = query.gte("rating", filters.ratingRange[0]);
      query = query.lte("rating", filters.ratingRange[1]);
    }

    // Apply position filter at database level
    if (filters.positions.length > 0) {
      if (filters.positionType === "primary") {
        // Only check primary position
        query = query.in("position", filters.positions);
      } else if (filters.positionType === "alternate") {
        // Only check alternate positions (potentialPositions is JSONB array)
        const alternateFilters = filters.positions.map(pos =>
          `potentialPositions.cs.["${pos}"]`
        ).join(',');
        query = query.or(alternateFilters);
      } else {
        // "all" type - check both primary AND alternate positions
        // Build OR: primary position matches OR any alternate position matches
        const primaryFilter = filters.positions.map(pos => `position.eq.${pos}`).join(',');
        const alternateFilters = filters.positions.map(pos =>
          `potentialPositions.cs.["${pos}"]`
        ).join(',');
        query = query.or(`${primaryFilter},${alternateFilters}`);
      }
    } else if (filters.positionFilter !== "all") {
      // Old single position filter for backward compatibility
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

    // Apply program filter (source column)
    if (filters.programs.length > 0) {
      query = query.in("source", filters.programs);
    }

    // Apply height filter at database level
    if (filters.heightRange[0] > 150 || filters.heightRange[1] < 210) {
      query = query.gte("height", filters.heightRange[0]);
      query = query.lte("height", filters.heightRange[1]);
    }

    // Apply weight filter at database level
    if (filters.weightRange[0] > 50 || filters.weightRange[1] < 110) {
      query = query.gte("weight", filters.weightRange[0]);
      query = query.lte("weight", filters.weightRange[1]);
    }

    // Apply skill moves filter at database level
    if (filters.skillMovesLevel > 0) {
      query = query.gte("skillMovesLevel", filters.skillMovesLevel);
    }

    // Apply weak foot filter at database level
    if (filters.weakFoot > 0) {
      query = query.gte("weakFoot", filters.weakFoot);
    }

    // Apply strong foot filter at database level
    if (filters.strongFoot !== "all") {
      query = query.eq("foot", parseInt(filters.strongFoot));
    }

    // Apply work rate attack filter at database level (JSONB)
    if (filters.workRateAtt > 0) {
      // workRates is JSONB like {attack: 2, defense: 1} or {att: 2, def: 1}
      query = query.or(`workRates->attack.eq.${filters.workRateAtt},workRates->att.eq.${filters.workRateAtt}`);
    }

    // Apply work rate defense filter at database level (JSONB)
    if (filters.workRateDef > 0) {
      query = query.or(`workRates->defense.eq.${filters.workRateDef},workRates->def.eq.${filters.workRateDef}`);
    }

    // Apply traits filter at database level (JSONB array)
    if (filters.traits.length > 0) {
      // Build OR conditions for each trait - traits is array of {id, ...} objects
      const traitFilters = filters.traits.map(traitId =>
        `traits.cs.[{"id":${traitId}}]`
      ).join(',');
      query = query.or(traitFilters);
    }

    // Pagination - always fetch PAGE_SIZE
    query = query.range(pageParam, pageParam + PAGE_SIZE - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // All filters are now applied at database level
    const filteredPlayers = data || [];

    return {
      players: filteredPlayers,
      nextPage: filteredPlayers.length > 0 && (data?.length || 0) === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
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
    queryKey: ["players", searchName, filters, sortBy],
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

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            {t("database.title", "Danh sách cầu thủ FC Mobile")}
          </h1>
          <p className="text-muted-foreground">
            {t("database.subtitle", "Khám phá và tìm kiếm cầu thủ cho đội hình FC Mobile của bạn")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-card rounded-lg border sticky top-20 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {t("database.filters", "Bộ lọc")}
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
                    placeholder={t("database.searchByName", "Tìm theo tên...")}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <PlayerFilters
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
              />
            </div>
          </div>

          {/* Player Grid */}
          <div className="flex-1">
            {/* Mobile header */}
            <div className="mb-4 flex justify-between items-center lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("database.filters", "Bộ lọc")}
              </Button>
              <p className="text-sm text-muted-foreground">
                {allPlayers.length} {t("database.of", "/")} {totalCount} {t("database.players", "cầu thủ")}
              </p>
            </div>

            {/* Desktop header with sort */}
            <div className="mb-4 hidden lg:flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {t("database.showing", "Hiển thị")} {allPlayers.length} {t("database.of", "/")} {totalCount} {t("database.players", "cầu thủ")}
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("database.sort", "Sắp xếp")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t("database.sort.newest", "Mới nhất")}</SelectItem>
                    <SelectItem value="oldest">{t("database.sort.oldest", "Cũ nhất")}</SelectItem>
                    <SelectItem value="rating_desc">{t("database.sort.ratingDesc", "OVR cao → thấp")}</SelectItem>
                    <SelectItem value="rating_asc">{t("database.sort.ratingAsc", "OVR thấp → cao")}</SelectItem>
                    <SelectItem value="name_asc">{t("database.sort.nameAsc", "Tên A → Z")}</SelectItem>
                    <SelectItem value="name_desc">{t("database.sort.nameDesc", "Tên Z → A")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile sort */}
            <div className="mb-4 flex lg:hidden items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("database.sort", "Sắp xếp")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("database.sort.newest", "Mới nhất")}</SelectItem>
                  <SelectItem value="oldest">{t("database.sort.oldest", "Cũ nhất")}</SelectItem>
                  <SelectItem value="rating_desc">{t("database.sort.ratingDesc", "OVR cao → thấp")}</SelectItem>
                  <SelectItem value="rating_asc">{t("database.sort.ratingAsc", "OVR thấp → cao")}</SelectItem>
                  <SelectItem value="name_asc">{t("database.sort.nameAsc", "Tên A → Z")}</SelectItem>
                  <SelectItem value="name_desc">{t("database.sort.nameDesc", "Tên Z → A")}</SelectItem>
                </SelectContent>
              </Select>
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
                  {t("database.error", "Có lỗi xảy ra khi tải dữ liệu")}
                </p>
              </div>
            ) : allPlayers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  {t("database.noResults", "Không tìm thấy cầu thủ nào")}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allPlayers.map((player, index) => (
                    <Fragment key={player.assetId}>
                      <div className="max-w-[280px] mx-auto">
                        <PlayerCard
                          player={player as any}
                          onClick={() => handlePlayerClick(player.assetId)}
                        />
                      </div>

                      {/* Insert Native Ad every 15 players for FREE tier */}
                      {tier === 'FREE' && (index + 1) % 15 === 0 && (
                        <div className="max-w-[280px] mx-auto">
                          <NativeAdCard adUnitId={`native-ad-database-${Math.floor(index / 15)}`} />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="py-8 text-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-muted-foreground">{t("database.loadingMore", "Đang tải thêm...")}</span>
                    </div>
                  ) : hasNextPage ? (
                    <Button
                      onClick={() => fetchNextPage()}
                      variant="outline"
                      className="min-w-[200px]"
                    >
                      {t("database.loadMore", "Tải thêm cầu thủ")}
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("database.allLoaded", "Đã hiển thị tất cả")} {totalCount} {t("database.players", "cầu thủ")}
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

      {/* Anchor Ad for FREE tier users */}
      {tier === 'FREE' && <AnchorAd adUnitId="anchor-ad-database" />}
    </div>
  );
}
