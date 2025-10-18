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
  name: string;
  ovr: number;
  position: string;
  nation?: string;
  club?: string;
  image_url?: string;
  stats: any;
}

interface PlayerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPlayer: (player: Player) => void;
  requiredPosition?: string;
}

const positions = ["GK", "LB", "LWB", "CB", "RB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST", "LF", "RF"];

export default function PlayerSelectionDialog({ 
  open, 
  onClose, 
  onSelectPlayer,
  requiredPosition 
}: PlayerSelectionDialogProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState(requiredPosition || "all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (requiredPosition) {
      setPositionFilter(requiredPosition);
    }
  }, [requiredPosition]);

  useEffect(() => {
    if (open) {
      fetchPlayers();
    }
  }, [open, positionFilter]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("players")
        .select("*")
        .order("ovr", { ascending: false })
        .limit(50);

      if (positionFilter !== "all") {
        query = query.eq("position", positionFilter);
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPlayers(data || []);
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
    onSelectPlayer(player);
    onClose();
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
              players.map((player) => (
                <div
                  key={player.id}
                  className="group bg-card/70 backdrop-blur-sm rounded-lg p-4 border border-border hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 animate-fade-in"
                  onClick={() => handleSelectPlayer(player)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0">
                      <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                        {player.ovr}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {player.position}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                        {player.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {player.club} • {player.nation}
                      </div>
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
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
