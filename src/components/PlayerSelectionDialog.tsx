import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Player {
  id: number;
  common_name: string;
  rating: number;
  position: string;
  nation?: any;
  club?: any;
  images?: any;
  stats: any;
  potential_positions?: any;
}

interface PlayerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPlayer: (player: Player, rank: number, training: number) => void;
  requiredPosition?: string;
  selectedPlayerIds?: number[];
}

const positions = ["GK", "LB", "LWB", "CB", "RB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST", "LF", "RF"];

export default function PlayerSelectionDialog({ 
  open, 
  onClose, 
  onSelectPlayer,
  requiredPosition,
  selectedPlayerIds = []
}: PlayerSelectionDialogProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState(requiredPosition || "all");
  const [loading, setLoading] = useState(false);
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [selectedTraining, setSelectedTraining] = useState<number>(0);

  useEffect(() => {
    if (requiredPosition) {
      setPositionFilter(requiredPosition);
    }
  }, [requiredPosition]);

  useEffect(() => {
    if (open) {
      fetchPlayers();
    }
  }, [open, positionFilter, selectedRank]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("players")
        .select("*")
        .order("rating", { ascending: false })
        .limit(100);

      if (searchQuery) {
        query = query.ilike("common_name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by position (including potential positions for rank 2+)
      let filteredPlayers = data || [];
      if (positionFilter !== "all") {
        filteredPlayers = filteredPlayers.filter(player => {
          if (player.position === positionFilter) return true;
          
          // Check potential positions for any rank (not just 2+)
          if (player.potential_positions) {
            const altPositions = Array.isArray(player.potential_positions) 
              ? player.potential_positions 
              : [];
            return altPositions.includes(positionFilter);
          }
          
          return false;
        });
      }
      
      setPlayers(filteredPlayers);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPlayers();
  };

  const handleSelectPlayer = (player: Player) => {
    onSelectPlayer(player, selectedRank, selectedTraining);
    onClose();
    // Reset selections
    setSelectedRank(1);
    setSelectedTraining(0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
            Chọn cầu thủ {requiredPosition && `- Vị trí: ${requiredPosition}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="space-y-4 md:col-span-1">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tìm theo tên</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Tên cầu thủ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-card/50"
                />
                <Button size="icon" onClick={handleSearch} className="shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Vị trí</Label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="bg-card/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Chọn Rank</Label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <button
                    key={rank}
                    onClick={() => setSelectedRank(rank)}
                    className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center p-2 ${
                      selectedRank === rank 
                        ? 'border-primary bg-primary/20 scale-105' 
                        : 'border-muted hover:border-primary/50 bg-card/50'
                    }`}
                  >
                    <div className={`w-6 h-6 mb-1 ${
                      rank === 1 ? 'bg-green-500' :
                      rank === 2 ? 'bg-blue-500' :
                      rank === 3 ? 'bg-purple-500' :
                      rank === 4 ? 'bg-red-500' :
                      'bg-orange-500'
                    } clip-hexagon`} />
                    <span className="text-xs font-bold">{rank}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Training Level</Label>
              <Select value={selectedTraining.toString()} onValueChange={(v) => setSelectedTraining(parseInt(v))}>
                <SelectTrigger className="bg-card/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Array.from({ length: 21 }, (_, i) => i).map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      Training Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Đang tải...
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Không tìm thấy cầu thủ
              </div>
            ) : (
              players.map((player) => {
                const isSelected = selectedPlayerIds.includes(player.id);
                const isAlternativePosition = positionFilter !== "all" && player.position !== positionFilter;
                const ovrPenalty = isAlternativePosition && selectedRank < 2 ? 2 : isAlternativePosition ? 1 : 0;
                const displayOvr = player.rating - ovrPenalty;
                
                return (
                <div
                  key={player.id}
                  className={`group bg-card/70 backdrop-blur-sm rounded-lg p-4 border transition-all ${
                    isSelected 
                      ? 'border-muted-foreground/30 opacity-50 cursor-not-allowed' 
                      : 'border-border hover:border-primary/50 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5'
                  } animate-fade-in`}
                  onClick={() => !isSelected && handleSelectPlayer(player)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0">
                      <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
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
                      <div className={`font-bold text-lg truncate transition-colors ${!isSelected && 'group-hover:text-primary'}`}>
                        {player.common_name}
                        {isSelected && <span className="ml-2 text-xs text-muted-foreground">(Đã chọn)</span>}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {player.club?.name} • {player.nation?.name}
                      </div>
                      {isAlternativePosition && selectedRank < 2 && (
                        <div className="text-xs text-orange-500 mt-1 font-medium">
                          ⚠️ Rank {selectedRank}: OVR giảm {ovrPenalty} điểm • Cần Rank 2+ để unlock vị trí phụ
                        </div>
                      )}
                      {isAlternativePosition && selectedRank >= 2 && (
                        <div className="text-xs text-blue-500 mt-1 font-medium">
                          ✓ Rank {selectedRank}: OVR giảm {ovrPenalty} điểm khi chơi vị trí phụ
                        </div>
                      )}
                      {player.potential_positions && player.potential_positions.length > 0 && !isAlternativePosition && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Vị trí phụ: {player.potential_positions.join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="hidden lg:grid grid-cols-6 gap-2 text-xs">
                      {player.position === "GK" ? (
                        <>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">DIV</div>
                            <div className="font-semibold">{player.stats?.diving || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">HAN</div>
                            <div className="font-semibold">{player.stats?.handling || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">KIC</div>
                            <div className="font-semibold">{player.stats?.kicking || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">REF</div>
                            <div className="font-semibold">{player.stats?.reflexes || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">SPD</div>
                            <div className="font-semibold">{player.stats?.speed || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">POS</div>
                            <div className="font-semibold">{player.stats?.positioning || 0}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">PAC</div>
                            <div className="font-semibold">{player.stats?.pace || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">SHO</div>
                            <div className="font-semibold">{player.stats?.shooting || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">PAS</div>
                            <div className="font-semibold">{player.stats?.passing || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">DRI</div>
                            <div className="font-semibold">{player.stats?.dribbling || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">DEF</div>
                            <div className="font-semibold">{player.stats?.defense || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-[10px]">PHY</div>
                            <div className="font-semibold">{player.stats?.physicality || 0}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
