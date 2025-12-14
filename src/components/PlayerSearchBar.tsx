import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import PlayerCard from "@/components/PlayerCard";
import PlayerDetailDialog from "@/components/PlayerDetailDialog";
import { TEXT } from "@/constants/text";
import { useT } from "@/contexts/LocalizationContext";

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
  playerId?: number;
  commonName: string | null;
  firstName: string | null;
  lastName: string | null;
  rating: number;
  position: string | null;
  images: any;
  stats: PlayerStats;
  club?: any;
  nation?: any;
  league?: any;
  cardName?: string | null;
  avgStats?: any;
  avgGkStats?: any;
  foot?: number;
  skillMovesLevel?: number;
  weakFoot?: number;
  height?: number;
  weight?: number;
  workRates?: any;
  traits?: any[];
  source?: string;
  auctionable?: boolean;
}

const PlayerSearchBar = () => {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const PLAYERS_PER_PAGE = 10;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Khi đang mở popup chi tiết cầu thủ thì không ẩn danh sách tìm kiếm
      if (selectedPlayer) return;

      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedPlayer]);

  useEffect(() => {
    const searchPlayers = async () => {
      if (query.trim().length < 2) {
        setPlayers([]);
        setIsOpen(false);
        setHasMoreResults(false);
        setTotalCount(0);
        return;
      }

      // Try smart search RPC first (accent-insensitive)
      let data: any[] | null = null;
      let count: number | null = null;
      let error: any = null;

      const rpcResult = await (supabase.rpc as any)('search_players_smart', {
        search_query: query.trim(),
        page_limit: PLAYERS_PER_PAGE,
        page_offset: 0,
        sort_by: 'rating',
        sort_order: 'DESC'
      });
      const rpcData = rpcResult.data as any[] | null;
      const rpcError = rpcResult.error;

      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        data = rpcData;
        count = rpcData[0]?.total_count || rpcData.length;
      } else {
        // Fallback to original search if RPC fails
        const result = await supabase
          .from("players")
          .select("*", { count: 'exact' })
          .or(`commonName.ilike.%${query}%,firstName.ilike.%${query}%,lastName.ilike.%${query}%`)
          .eq("is_visible", true)
          .order("rating", { ascending: false })
          .range(0, PLAYERS_PER_PAGE - 1);
        
        data = result.data;
        count = result.count;
        error = result.error;
      }

      if (!error && data) {
        const mappedPlayers = data.map(p => ({
          assetId: p.assetId,
          playerId: p.playerId,
          commonName: p.commonName,
          firstName: p.firstName,
          lastName: p.lastName,
          rating: p.rating,
          position: p.position,
          images: p.images,
          stats: (p.stats || {}) as PlayerStats,
          club: p.club,
          nation: p.nation,
          league: p.league,
          cardName: p.cardName,
          avgStats: p.avgStats,
          avgGkStats: p.avgGkStats,
          foot: p.foot,
          skillMovesLevel: p.skillMovesLevel,
          weakFoot: p.weakFoot,
          height: p.height,
          weight: p.weight,
          workRates: p.workRates,
          traits: Array.isArray(p.traits) ? p.traits : [],
          source: p.source,
          auctionable: p.auctionable
        }));
        setPlayers(mappedPlayers);
        setTotalCount(count || 0);
        setHasMoreResults((count || 0) > PLAYERS_PER_PAGE);
        setIsOpen(data.length > 0);
      }
    };

    const timeoutId = setTimeout(searchPlayers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const loadMorePlayers = async () => {
    if (loadingMore || !hasMoreResults) return;
    
    setLoadingMore(true);
    try {
      const nextOffset = players.length;
      
      // Try smart search RPC for load more
      const rpcResult = await (supabase.rpc as any)('search_players_smart', {
        search_query: query.trim(),
        page_limit: PLAYERS_PER_PAGE,
        page_offset: nextOffset,
        sort_by: 'rating',
        sort_order: 'DESC'
      });
      const rpcData = rpcResult.data as any[] | null;
      const rpcError = rpcResult.error;

      let data: any[] | null = null;
      let error: any = null;

      if (!rpcError && rpcData && Array.isArray(rpcData)) {
        data = rpcData;
      } else {
        // Fallback to original search
        const result = await supabase
          .from("players")
          .select("*")
          .or(`commonName.ilike.%${query}%,firstName.ilike.%${query}%,lastName.ilike.%${query}%`)
          .eq("is_visible", true)
          .order("rating", { ascending: false })
          .range(nextOffset, nextOffset + PLAYERS_PER_PAGE - 1);
        
        data = result.data;
        error = result.error;
      }

      if (!error && data) {
        const newPlayers = data.map(p => ({
          assetId: p.assetId,
          playerId: p.playerId,
          commonName: p.commonName,
          firstName: p.firstName,
          lastName: p.lastName,
          rating: p.rating,
          position: p.position,
          images: p.images,
          stats: (p.stats || {}) as PlayerStats,
          club: p.club,
          nation: p.nation,
          league: p.league,
          cardName: p.cardName,
          avgStats: p.avgStats,
          avgGkStats: p.avgGkStats,
          foot: p.foot,
          skillMovesLevel: p.skillMovesLevel,
          weakFoot: p.weakFoot,
          height: p.height,
          weight: p.weight,
          workRates: p.workRates,
          traits: Array.isArray(p.traits) ? p.traits : [],
          source: p.source,
          auctionable: p.auctionable
        }));
        setPlayers(prev => [...prev, ...newPlayers]);
        setHasMoreResults(players.length + newPlayers.length < totalCount);
      }
    } catch (error) {
      console.error("Error loading more players:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlayerClick = (assetId: number) => {
    setSelectedPlayer(assetId);
  };

  const getPlayerImage = (player: Player) => {
    if (player.images && typeof player.images === 'object') {
      return (player.images as any).small || (player.images as any).medium || null;
    }
    return null;
  };

  const getPlayerName = (player: Player) => {
    return player.commonName || `${player.firstName || ""} ${player.lastName || ""}`.trim();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
          {t("hero.title", "Boped FC Tactics")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("hero.subtitle", "Tìm kiếm cầu thủ FC Mobile")}</p>
      </div>

      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-2 bg-card/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl px-6 py-4 shadow-lg">
            <Search className="h-5 w-5 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("hero.searchPlaceholder", "Tìm kiếm cầu thủ theo tên...")}
              className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
              onFocus={() => query.length >= 2 && setIsOpen(true)}
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Results dropdown */}
        {isOpen && players.length > 0 && (
          <div className="mt-4 w-full">
            <div className="rounded-2xl border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <div 
                    key={player.assetId}
                    className="max-w-[280px] mx-auto cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => handlePlayerClick(player.assetId)}
                  >
                    <PlayerCard 
                      player={player} 
                    />
                  </div>
                ))}
              </div>
              {hasMoreResults && (
                <div className="mt-6 pt-4 text-center border-t border-border/50">
                  <Button
                    onClick={loadMorePlayers}
                    variant="outline"
                    className="w-full"
                    disabled={loadingMore}
                  >
                    {loadingMore 
                      ? t("hero.loading", "Đang tải...") 
                      : t("hero.loadMore", "Tải thêm")
                    }
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {isOpen && query.length >= 2 && players.length === 0 && (
          <div className="mt-4 w-full">
            <div className="rounded-2xl border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm p-6">
              <p className="text-center text-muted-foreground">
                {t("hero.noPlayers", "Không tìm thấy cầu thủ")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Player Detail Dialog */}
      <PlayerDetailDialog
        assetId={selectedPlayer}
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      />
    </div>
  );
};

export default PlayerSearchBar;
