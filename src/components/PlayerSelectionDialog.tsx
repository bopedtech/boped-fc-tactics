import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  potential_positions?: any;
  weak_foot?: number;
  skill_moves_level?: number;
  height?: number;
  weight?: number;
  work_rate_att?: number;
  work_rate_def?: number;
  traits?: any[];
}

interface PlayerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPlayer: (player: Player, rank: number, training: number) => void;
  requiredPosition?: string;
  selectedPlayerIds?: number[];
}

const positions = ["GK", "LB", "LWB", "CB", "RB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST", "LF", "RF"];

const positionNames: Record<string, string> = {
  "GK": "Thủ môn",
  "LB": "Hậu vệ trái",
  "LWB": "Tiền vệ cánh trái",
  "CB": "Trung vệ",
  "RB": "Hậu vệ phải", 
  "RWB": "Tiền vệ cánh phải",
  "CDM": "Tiền vệ phòng ngự",
  "CM": "Tiền vệ trung tâm",
  "CAM": "Tiền vệ tấn công",
  "LM": "Tiền vệ trái",
  "RM": "Tiền vệ phải",
  "LW": "Tiền đạo cánh trái",
  "RW": "Tiền đạo cánh phải",
  "CF": "Tiền đạo ảo",
  "ST": "Tiền đạo",
  "LF": "Tiền đạo lệch trái",
  "RF": "Tiền đạo lệch phải"
};

export default function PlayerSelectionDialog({ 
  open, 
  onClose, 
  onSelectPlayer,
  requiredPosition,
  selectedPlayerIds = []
}: PlayerSelectionDialogProps) {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [selectedTraining, setSelectedTraining] = useState<number>(0);
  
  const { filters, setFilters, resetFilters: resetFilterState, applyFiltersToQuery } = usePlayerFilters(requiredPosition);

  useEffect(() => {
    if (open) {
      fetchPlayers();
    }
  }, [open]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("rating", { ascending: false })
        .limit(500);

      if (error) throw error;
      setAllPlayers((data || []) as Player[]);
      applyFilters((data || []) as Player[]);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (playerList: Player[] = allPlayers) => {
    let filtered = [...playerList];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.common_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter component filters
    filtered = applyFiltersToQuery(filtered);

    setDisplayedPlayers(filtered as Player[]);
  };

  const resetFilters = () => {
    setSearchQuery("");
    resetFilterState();
    setDisplayedPlayers(allPlayers);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, allPlayers]);

  const handleSearch = () => {
    applyFilters();
  };

  const handleSelectPlayer = (player: Player) => {
    onSelectPlayer(player, selectedRank, selectedTraining);
    onClose();
    setSelectedRank(1);
    setSelectedTraining(0);
  };
  
  const getClubName = (club: any) => {
    if (!club) return "";
    if (typeof club === 'object' && 'name' in club) return club.name as string;
    return "";
  };
  
  const getNationName = (nation: any) => {
    if (!nation) return "";
    if (typeof nation === 'object' && 'name' in nation) return nation.name as string;
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
            Chọn cầu thủ {requiredPosition && `- Vị trí: ${positionNames[requiredPosition] || requiredPosition}`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Tìm kiếm và chọn cầu thủ cho đội hình của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Filters */}
          <ScrollArea className="w-72 border-r bg-muted/20">
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">BỘ LỌC</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-xs"
                >
                  Đặt lại
                </Button>
              </div>

              {/* Search */}
              <div className="space-y-2 mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tìm theo tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" onClick={handleSearch} className="h-9 px-3">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rank & Training */}
              <div className="space-y-3 pt-4 border-t bg-background p-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Chọn Rank</Label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <button
                        key={rank}
                        onClick={() => setSelectedRank(rank)}
                        className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center p-1 ${
                          selectedRank === rank 
                            ? 'border-primary bg-primary/20 scale-105' 
                            : 'border-muted hover:border-primary/50 bg-card/50'
                        }`}
                      >
                        <div className={`w-5 h-5 mb-0.5 ${
                          rank === 1 ? 'bg-green-500' :
                          rank === 2 ? 'bg-blue-500' :
                          rank === 3 ? 'bg-purple-500' :
                          rank === 4 ? 'bg-red-500' :
                          'bg-orange-500'
                        } clip-hexagon`} />
                        <span className="text-[10px] font-bold">{rank}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Cấp độ Training</Label>
                  <Select value={selectedTraining.toString()} onValueChange={(v) => setSelectedTraining(parseInt(v))}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {Array.from({ length: 21 }, (_, i) => i).map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Cấp {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Right - Player List */}
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Tìm thấy <span className="font-semibold text-foreground">{displayedPlayers.length}</span> cầu thủ
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Đang tải...
                </div>
              ) : displayedPlayers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Không tìm thấy cầu thủ
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {displayedPlayers.map((player) => {
                    const isSelected = selectedPlayerIds.includes(player.id);
                    const isAlternativePosition = requiredPosition && player.position !== requiredPosition;
                    const ovrPenalty = isAlternativePosition && selectedRank < 2 ? 2 : isAlternativePosition ? 1 : 0;
                    const displayOvr = player.rating - ovrPenalty;
                    
                    return (
                      <div
                        key={player.id}
                        className={`group bg-card rounded-lg p-4 border transition-all ${
                          isSelected 
                            ? 'border-muted-foreground/30 opacity-50 cursor-not-allowed' 
                            : 'border-border hover:border-primary/50 cursor-pointer hover:shadow-lg hover:shadow-primary/10'
                        }`}
                        onClick={() => !isSelected && handleSelectPlayer(player)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center shrink-0">
                            <div className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                              {displayOvr}
                              {ovrPenalty > 0 && (
                                <span className="text-xs text-destructive ml-1">-{ovrPenalty}</span>
                              )}
                            </div>
                            <Badge variant={isAlternativePosition ? "outline" : "secondary"} className="text-xs mt-1">
                              {player.position}
                            </Badge>
                            {isAlternativePosition && (
                              <div className="text-[10px] text-orange-500 font-semibold mt-0.5">Vị trí phụ</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={`font-bold text-base truncate transition-colors ${!isSelected && 'group-hover:text-primary'}`}>
                              {player.common_name}
                              {isSelected && <span className="ml-2 text-xs text-muted-foreground">(Đã chọn)</span>}
                            </div>
                            <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                              <span>{getClubName(player.club)}</span>
                              {getClubName(player.club) && getNationName(player.nation) && <span>•</span>}
                              <span>{getNationName(player.nation)}</span>
                            </div>
                            
                            {/* Player attributes */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {player.weak_foot && (
                                <Badge variant="outline" className="text-xs">
                                  Chân thuận: {player.weak_foot}⭐
                                </Badge>
                              )}
                              {player.skill_moves_level && (
                                <Badge variant="outline" className="text-xs">
                                  Kỹ năng: {player.skill_moves_level}⭐
                                </Badge>
                              )}
                              {player.height && (
                                <Badge variant="outline" className="text-xs">
                                  {player.height}cm
                                </Badge>
                              )}
                            </div>

                            {isAlternativePosition && selectedRank < 2 && (
                              <div className="text-xs text-orange-500 mt-2 font-medium">
                                ⚠️ Rank {selectedRank}: OVR giảm {ovrPenalty} • Cần Rank 2+ để mở khóa vị trí phụ
                              </div>
                            )}
                            {isAlternativePosition && selectedRank >= 2 && (
                              <div className="text-xs text-blue-500 mt-2 font-medium">
                                ✓ Rank {selectedRank}: OVR giảm {ovrPenalty} khi chơi vị trí phụ
                              </div>
                            )}
                          </div>

                          {/* Stats preview */}
                          <div className="hidden 2xl:grid grid-cols-3 gap-2 text-xs shrink-0">
                            {player.position === "GK" ? (
                              <>
                                <div className="text-center">
                                  <div className="text-[10px] text-muted-foreground">PHÁ</div>
                                  <div className="font-semibold">{player.stats?.gkd || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] text-muted-foreground">BẮT</div>
                                  <div className="font-semibold">{player.stats?.han || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] text-muted-foreground">PHẢ</div>
                                  <div className="font-semibold">{player.stats?.ref || 0}</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-center">
                                  <div className="text-[10px] text-muted-foreground">TỐC</div>
                                  <div className="font-semibold">{player.stats?.spa || player.stats?.pace || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] text-muted-foreground">SÚT</div>
                                  <div className="font-semibold">{player.stats?.sho || player.stats?.shooting || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] text-muted-foreground">RÊ</div>
                                  <div className="font-semibold">{player.stats?.dri || player.stats?.dribbling || 0}</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
