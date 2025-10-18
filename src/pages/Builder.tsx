import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import AIAdvisor from "@/components/AIAdvisor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Sparkles, Search, X } from "lucide-react";

interface Player {
  id: number;
  name: string;
  ovr: number;
  position: string;
  nation?: string;
  club?: string;
  image_url?: string;
  stats: any;
  traits?: any;
}

const formations = [
  "4-3-3 Attack",
  "4-4-2",
  "4-3-3 Defend",
  "4-2-3-1",
  "4-1-2-1-2",
  "3-5-2",
  "5-3-2",
  "4-3-2-1",
];

const positions = ["GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"];

// Formation layouts - positions are percentages from top and left
const formationLayouts: Record<string, Array<{ top: string; left: string; position: string }>> = {
  "4-3-3 Attack": [
    { top: "85%", left: "50%", position: "GK" },
    { top: "65%", left: "15%", position: "LB" },
    { top: "65%", left: "38%", position: "CB" },
    { top: "65%", left: "62%", position: "CB" },
    { top: "65%", left: "85%", position: "RB" },
    { top: "45%", left: "30%", position: "CM" },
    { top: "45%", left: "50%", position: "CM" },
    { top: "45%", left: "70%", position: "CM" },
    { top: "15%", left: "20%", position: "LW" },
    { top: "15%", left: "50%", position: "ST" },
    { top: "15%", left: "80%", position: "RW" },
  ],
  "4-4-2": [
    { top: "85%", left: "50%", position: "GK" },
    { top: "65%", left: "15%", position: "LB" },
    { top: "65%", left: "38%", position: "CB" },
    { top: "65%", left: "62%", position: "CB" },
    { top: "65%", left: "85%", position: "RB" },
    { top: "45%", left: "20%", position: "LM" },
    { top: "45%", left: "40%", position: "CM" },
    { top: "45%", left: "60%", position: "CM" },
    { top: "45%", left: "80%", position: "RM" },
    { top: "15%", left: "38%", position: "ST" },
    { top: "15%", left: "62%", position: "ST" },
  ],
  "4-3-3 Defend": [
    { top: "85%", left: "50%", position: "GK" },
    { top: "65%", left: "15%", position: "LB" },
    { top: "65%", left: "38%", position: "CB" },
    { top: "65%", left: "62%", position: "CB" },
    { top: "65%", left: "85%", position: "RB" },
    { top: "50%", left: "50%", position: "CDM" },
    { top: "35%", left: "35%", position: "CM" },
    { top: "35%", left: "65%", position: "CM" },
    { top: "15%", left: "20%", position: "LW" },
    { top: "15%", left: "50%", position: "ST" },
    { top: "15%", left: "80%", position: "RW" },
  ],
  "4-2-3-1": [
    { top: "85%", left: "50%", position: "GK" },
    { top: "65%", left: "15%", position: "LB" },
    { top: "65%", left: "38%", position: "CB" },
    { top: "65%", left: "62%", position: "CB" },
    { top: "65%", left: "85%", position: "RB" },
    { top: "50%", left: "38%", position: "CDM" },
    { top: "50%", left: "62%", position: "CDM" },
    { top: "30%", left: "20%", position: "LM" },
    { top: "30%", left: "50%", position: "CAM" },
    { top: "30%", left: "80%", position: "RM" },
    { top: "10%", left: "50%", position: "ST" },
  ],
  "4-1-2-1-2": [
    { top: "85%", left: "50%", position: "GK" },
    { top: "65%", left: "15%", position: "LB" },
    { top: "65%", left: "38%", position: "CB" },
    { top: "65%", left: "62%", position: "CB" },
    { top: "65%", left: "85%", position: "RB" },
    { top: "52%", left: "50%", position: "CDM" },
    { top: "38%", left: "35%", position: "CM" },
    { top: "38%", left: "65%", position: "CM" },
    { top: "24%", left: "50%", position: "CAM" },
    { top: "10%", left: "38%", position: "ST" },
    { top: "10%", left: "62%", position: "ST" },
  ],
  "3-5-2": [
    { top: "85%", left: "50%", position: "GK" },
    { top: "65%", left: "25%", position: "CB" },
    { top: "65%", left: "50%", position: "CB" },
    { top: "65%", left: "75%", position: "CB" },
    { top: "45%", left: "10%", position: "LM" },
    { top: "45%", left: "32%", position: "CM" },
    { top: "45%", left: "50%", position: "CM" },
    { top: "45%", left: "68%", position: "CM" },
    { top: "45%", left: "90%", position: "RM" },
    { top: "15%", left: "38%", position: "ST" },
    { top: "15%", left: "62%", position: "ST" },
  ],
  "5-3-2": [
    { top: "85%", left: "50%", position: "GK" },
    { top: "65%", left: "10%", position: "LWB" },
    { top: "65%", left: "30%", position: "CB" },
    { top: "65%", left: "50%", position: "CB" },
    { top: "65%", left: "70%", position: "CB" },
    { top: "65%", left: "90%", position: "RWB" },
    { top: "40%", left: "32%", position: "CM" },
    { top: "40%", left: "50%", position: "CM" },
    { top: "40%", left: "68%", position: "CM" },
    { top: "15%", left: "38%", position: "ST" },
    { top: "15%", left: "62%", position: "ST" },
  ],
  "4-3-2-1": [
    { top: "85%", left: "50%", position: "GK" },
    { top: "65%", left: "15%", position: "LB" },
    { top: "65%", left: "38%", position: "CB" },
    { top: "65%", left: "62%", position: "CB" },
    { top: "65%", left: "85%", position: "RB" },
    { top: "48%", left: "30%", position: "CM" },
    { top: "48%", left: "50%", position: "CM" },
    { top: "48%", left: "70%", position: "CM" },
    { top: "28%", left: "35%", position: "CAM" },
    { top: "28%", left: "65%", position: "CAM" },
    { top: "10%", left: "50%", position: "ST" },
  ],
};

export default function Builder() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [squadName, setSquadName] = useState("");
  const [formation, setFormation] = useState("4-3-3 Attack");
  const [saving, setSaving] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  
  // Player Pool
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  
  // Squad lineup (11 positions)
  const [lineup, setLineup] = useState<(Player | null)[]>(Array(11).fill(null));

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [positionFilter]);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Vui lòng đăng nhập để sử dụng Squad Builder");
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("players")
        .select("*")
        .order("ovr", { ascending: false })
        .limit(20);

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

  const addPlayerToLineup = (player: Player, index: number) => {
    const newLineup = [...lineup];
    newLineup[index] = player;
    setLineup(newLineup);
    toast.success(`Đã thêm ${player.name} vào đội hình`);
  };

  const removePlayerFromLineup = (index: number) => {
    const newLineup = [...lineup];
    newLineup[index] = null;
    setLineup(newLineup);
  };

  const handleSave = async () => {
    if (!squadName.trim()) {
      toast.error("Vui lòng nhập tên đội hình");
      return;
    }

    const filledPositions = lineup.filter((p) => p !== null).length;
    if (filledPositions < 11) {
      toast.error(`Đội hình chưa đủ 11 cầu thủ (${filledPositions}/11)`);
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập");
      navigate("/auth");
      return;
    }

    try {
      setSaving(true);

      const lineupData = {
        formation,
        players: lineup.map((player, index) => ({
          position: index,
          player_id: player?.id,
          player_name: player?.name,
          player_ovr: player?.ovr,
        })),
      };

      const { error } = await supabase.from("squads").insert({
        user_id: user.id,
        squad_name: squadName,
        formation,
        lineup: lineupData,
      });

      if (error) throw error;

      toast.success("Đã lưu đội hình!");
      navigate("/my-squads");
    } catch (error: any) {
      toast.error("Không thể lưu đội hình");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filledCount = lineup.filter((p) => p !== null).length;

  return (
    <div className="min-h-screen">
      <Header />

      {showAIAdvisor && (
        <AIAdvisor
          onClose={() => setShowAIAdvisor(false)}
          squadData={lineup}
        />
      )}

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Xây dựng đội hình FC Mobile
          </h1>
          <p className="text-muted-foreground">
            Tạo đội hình tối ưu cho FC Mobile ({filledCount}/11 cầu thủ)
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Controls + Pitch */}
          <div className="lg:col-span-2 space-y-4">
            {/* Controls */}
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="squad-name">Tên đội hình</Label>
                  <Input
                    id="squad-name"
                    placeholder="Đội hình của tôi..."
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sơ đồ chiến thuật</Label>
                  <Select value={formation} onValueChange={setFormation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {formations.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving || filledCount < 11}
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu đội hình"}
                </Button>
                <Button
                  onClick={() => setShowAIAdvisor(true)}
                  disabled={filledCount < 11}
                  className="flex-1 gradient-primary"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Phân tích AI
                </Button>
              </div>
            </Card>

            {/* Pitch View */}
            <Card className="p-6 min-h-[700px] bg-pitch-green/20 border-pitch-green/30 relative">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{formation}</h3>
              </div>

              {/* Football Pitch with Formation Layout */}
              <div className="relative w-full h-[600px] bg-gradient-to-b from-pitch-green/30 to-pitch-green/10 rounded-lg border-2 border-pitch-green/40">
                {/* Pitch markings */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-pitch-green/30 rounded-b-lg" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-pitch-green/30 rounded-t-lg" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-pitch-green/30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-pitch-green/30" />

                {/* Player positions based on formation */}
                {formationLayouts[formation]?.map((pos, index) => {
                  const player = lineup[index];
                  return (
                    <div
                      key={index}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ top: pos.top, left: pos.left }}
                    >
                      {player ? (
                        <div className="relative group">
                          <div className="w-28 bg-card/95 backdrop-blur-sm rounded-lg p-2.5 border-2 border-primary/60 shadow-lg hover:scale-105 transition-transform">
                            <div className="absolute -top-2 -right-2 z-10">
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removePlayerFromLineup(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary mb-0.5">
                                {player.ovr}
                              </div>
                              <div className="text-[10px] text-muted-foreground mb-1 font-semibold">
                                {pos.position}
                              </div>
                              <div className="text-xs font-semibold truncate text-foreground">
                                {player.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-28 h-24 border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-primary/40 transition-colors">
                          <div className="text-center text-muted-foreground text-xs">
                            <div className="text-xl mb-0.5">+</div>
                            <div className="font-semibold">{pos.position}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>💡 Nhấp vào cầu thủ từ danh sách bên phải để thêm vào đội hình</p>
              </div>
            </Card>
          </div>

          {/* Right: Player Pool */}
          <div className="space-y-4">
            <Card className="p-6 sticky top-20">
              <h3 className="text-lg font-bold mb-4">Tìm kiếm cầu thủ</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tìm theo tên</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tên cầu thủ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button size="icon" onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vị trí</Label>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
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

              <div className="mt-6 space-y-3 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Đang tải...
                  </div>
                ) : players.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không tìm thấy cầu thủ
                  </div>
                ) : (
                  players.map((player) => {
                    const availableSlot = lineup.findIndex((p) => p === null);
                    return (
                      <div
                        key={player.id}
                        className="bg-card/50 rounded-lg p-3 border hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (availableSlot !== -1) {
                            addPlayerToLineup(player, availableSlot);
                          } else {
                            toast.error("Đội hình đã đủ 11 cầu thủ");
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xl font-bold text-primary">
                              {player.ovr}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {player.position}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">
                              {player.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {player.club}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
