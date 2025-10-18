import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState(requiredPosition || "all");
  const [loading, setLoading] = useState(false);
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [selectedTraining, setSelectedTraining] = useState<number>(0);
  
  // Advanced filters
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 125]);
  const [weakFootFilter, setWeakFootFilter] = useState<number>(0);
  const [skillMovesFilter, setSkillMovesFilter] = useState<number>(0);
  const [heightRange, setHeightRange] = useState<[number, number]>([150, 210]);
  
  // Collapsible states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    rating: true,
    position: true,
    skills: false,
    physical: false
  });

  useEffect(() => {
    if (requiredPosition) {
      setPositionFilter(requiredPosition);
    }
  }, [requiredPosition]);

  useEffect(() => {
    if (open) {
      fetchPlayers();
    }
  }, [open, positionFilter, selectedRank, ratingRange, weakFootFilter, skillMovesFilter, heightRange]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("players")
        .select("*")
        .order("rating", { ascending: false })
        .limit(200);

      if (searchQuery) {
        query = query.ilike("common_name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Apply all filters
      let filteredPlayers = data || [];
      
      // Position filter
      if (positionFilter !== "all") {
        filteredPlayers = filteredPlayers.filter(player => {
          if (player.position === positionFilter) return true;
          if (player.potential_positions) {
            const altPositions = Array.isArray(player.potential_positions) 
              ? player.potential_positions 
              : [];
            return altPositions.includes(positionFilter);
          }
          return false;
        });
      }
      
      // Rating filter
      filteredPlayers = filteredPlayers.filter(p => 
        p.rating >= ratingRange[0] && p.rating <= ratingRange[1]
      );
      
      // Weak foot filter
      if (weakFootFilter > 0) {
        filteredPlayers = filteredPlayers.filter(p => 
          (p.weak_foot || 0) >= weakFootFilter
        );
      }
      
      // Skill moves filter
      if (skillMovesFilter > 0) {
        filteredPlayers = filteredPlayers.filter(p => 
          (p.skill_moves_level || 0) >= skillMovesFilter
        );
      }
      
      // Height filter
      filteredPlayers = filteredPlayers.filter(p => 
        (p.height || 175) >= heightRange[0] && (p.height || 175) <= heightRange[1]
      );
      
      setPlayers(filteredPlayers as Player[]);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const resetFilters = () => {
    setRatingRange([0, 125]);
    setWeakFootFilter(0);
    setSkillMovesFilter(0);
    setHeightRange([150, 210]);
    setPositionFilter(requiredPosition || "all");
    setSearchQuery("");
  };
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSearch = () => {
    fetchPlayers();
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

              {/* Rating Filter */}
              <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 hover:bg-muted rounded-md">
                  <span className="font-medium text-sm">Chỉ số (OVR)</span>
                  {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 py-3 space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{ratingRange[0]}</span>
                    <span>{ratingRange[1]}</span>
                  </div>
                  <Slider
                    min={0}
                    max={125}
                    step={1}
                    value={ratingRange}
                    onValueChange={(val) => setRatingRange(val as [number, number])}
                    className="w-full"
                  />
                </CollapsibleContent>
              </Collapsible>

              {/* Position Filter */}
              <Collapsible open={openSections.position} onOpenChange={() => toggleSection('position')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 hover:bg-muted rounded-md">
                  <span className="font-medium text-sm">Vị trí</span>
                  {openSections.position ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 py-2">
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {positionNames[pos]} ({pos})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>

              {/* Skills Filter */}
              <Collapsible open={openSections.skills} onOpenChange={() => toggleSection('skills')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 hover:bg-muted rounded-md">
                  <span className="font-medium text-sm">Kỹ năng</span>
                  {openSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 py-2 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Chân thuận tối thiểu</Label>
                    <Select value={weakFootFilter.toString()} onValueChange={(v) => setWeakFootFilter(parseInt(v))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tất cả</SelectItem>
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <SelectItem key={stars} value={stars.toString()}>
                            {stars} sao trở lên
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Kỹ năng rê bóng tối thiểu</Label>
                    <Select value={skillMovesFilter.toString()} onValueChange={(v) => setSkillMovesFilter(parseInt(v))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tất cả</SelectItem>
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <SelectItem key={stars} value={stars.toString()}>
                            {stars} sao trở lên
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Physical Filter */}
              <Collapsible open={openSections.physical} onOpenChange={() => toggleSection('physical')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 hover:bg-muted rounded-md">
                  <span className="font-medium text-sm">Thể chất</span>
                  {openSections.physical ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 py-3 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Chiều cao (cm)</Label>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{heightRange[0]} cm</span>
                      <span>{heightRange[1]} cm</span>
                    </div>
                    <Slider
                      min={150}
                      max={210}
                      step={1}
                      value={heightRange}
                      onValueChange={(val) => setHeightRange(val as [number, number])}
                      className="w-full"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Rank & Training */}
              <div className="space-y-3 pt-4 border-t">
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
                  Tìm thấy <span className="font-semibold text-foreground">{players.length}</span> cầu thủ
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Đang tải...
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Không tìm thấy cầu thủ
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {players.map((player) => {
                    const isSelected = selectedPlayerIds.includes(player.id);
                    const isAlternativePosition = positionFilter !== "all" && player.position !== positionFilter;
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
