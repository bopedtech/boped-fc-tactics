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
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Player {
  assetId: number;
  commonName: string | null;
  firstName: string | null;
  lastName: string | null;
  rating: number;
  position: string | null;
  images: any;
}

const PlayerSearchBar = () => {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchPlayers = async () => {
      if (query.trim().length < 2) {
        setPlayers([]);
        setIsOpen(false);
        return;
      }

      const { data, error } = await supabase
        .from("players")
        .select("assetId, commonName, firstName, lastName, rating, position, images")
        .or(`commonName.ilike.%${query}%,firstName.ilike.%${query}%,lastName.ilike.%${query}%`)
        .eq("is_visible", true)
        .order("rating", { ascending: false })
        .limit(8);

      if (!error && data) {
        setPlayers(data);
        setIsOpen(data.length > 0);
      }
    };

    const timeoutId = setTimeout(searchPlayers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePlayerClick = (assetId: number) => {
    setQuery("");
    setIsOpen(false);
    navigate(`/database?player=${assetId}`);
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
          Boped FC Tactics
        </h1>
        <p className="text-muted-foreground text-lg">Tìm kiếm cầu thủ FC Mobile</p>
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
              placeholder="Tìm kiếm cầu thủ theo tên..."
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
          <div className="absolute top-full mt-4 w-full z-50">
            <Command className="rounded-2xl border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm">
              <CommandList>
                <CommandGroup>
                  {players.map((player) => (
                    <CommandItem
                      key={player.assetId}
                      onSelect={() => handlePlayerClick(player.assetId)}
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-primary/10 rounded-lg m-2"
                    >
                      <div className="w-14 h-20 flex-shrink-0 bg-gradient-to-b from-amber-400 to-amber-600 rounded-lg overflow-hidden shadow-lg">
                        {getPlayerImage(player) ? (
                          <img
                            src={getPlayerImage(player)!}
                            alt={getPlayerName(player)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                            {player.rating}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base truncate">
                          {getPlayerName(player)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="font-bold text-primary text-lg">{player.rating}</span>
                          <span>•</span>
                          <span className="font-medium">{player.position || "N/A"}</span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {players.length === 8 && (
                  <div className="p-3 text-center text-sm text-muted-foreground border-t border-border/50">
                    Hiển thị 8 kết quả đầu tiên
                  </div>
                )}
              </CommandList>
            </Command>
          </div>
        )}

        {isOpen && query.length >= 2 && players.length === 0 && (
          <div className="absolute top-full mt-4 w-full z-50">
            <Command className="rounded-2xl border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm">
              <CommandList>
                <CommandEmpty className="py-6 text-center text-muted-foreground">
                  Không tìm thấy cầu thủ
                </CommandEmpty>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSearchBar;
