import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface HeaderPlayerSearchProps {
  isMobile?: boolean;
}

export default function HeaderPlayerSearch({ isMobile = false }: HeaderPlayerSearchProps) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(isMobile);
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
    setShowSearch(isMobile); // On mobile, keep it open
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

  if (!isMobile && !showSearch) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSearch(true)}
        className="text-black hover:text-primary"
      >
        <Search className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div ref={searchRef} className={cn("relative", isMobile ? "w-full" : "w-64")}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm cầu thủ..."
            className="pl-9 pr-9 h-9 bg-background"
            onFocus={() => query.length >= 2 && setIsOpen(true)}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSearch(false);
              setQuery("");
              setIsOpen(false);
            }}
            className="h-9 w-9 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && players.length > 0 && (
        <div className="absolute top-full mt-2 w-full z-50">
          <Command className="rounded-lg border shadow-lg bg-popover">
            <CommandList>
              <CommandGroup>
                {players.map((player) => (
                  <CommandItem
                    key={player.assetId}
                    onSelect={() => handlePlayerClick(player.assetId)}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                  >
                    <div className="w-12 h-16 flex-shrink-0 bg-gradient-to-b from-amber-400 to-amber-600 rounded overflow-hidden">
                      {getPlayerImage(player) ? (
                        <img
                          src={getPlayerImage(player)!}
                          alt={getPlayerName(player)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {player.rating}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {getPlayerName(player)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-bold text-primary">{player.rating}</span>
                        <span>•</span>
                        <span>{player.position || "N/A"}</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {players.length === 8 && (
                <div className="p-2 text-center text-xs text-muted-foreground border-t">
                  Hiển thị 8 kết quả đầu tiên
                </div>
              )}
            </CommandList>
          </Command>
        </div>
      )}

      {isOpen && query.length >= 2 && players.length === 0 && (
        <div className="absolute top-full mt-2 w-full z-50">
          <Command className="rounded-lg border shadow-lg bg-popover">
            <CommandList>
              <CommandEmpty>Không tìm thấy cầu thủ</CommandEmpty>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
