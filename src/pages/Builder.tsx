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
            Squad Builder
          </h1>
          <p className="text-muted-foreground">
            Xây dựng đội hình tối ưu của bạn ({filledCount}/11)
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
            <Card className="p-6 min-h-[700px] bg-pitch-green/20 border-pitch-green/30">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{formation}</h3>
              </div>

              {/* Simple Grid Layout for Players */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                {lineup.map((player, index) => (
                  <div
                    key={index}
                    className={`${
                      index === 0 ? "col-span-4" : "col-span-1"
                    } flex justify-center`}
                  >
                    {player ? (
                      <div className="relative group">
                        <div className="w-32 bg-card/95 rounded-lg p-3 border-2 border-primary/50">
                          <div className="absolute -top-2 -right-2 z-10">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePlayerFromLineup(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {player.ovr}
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {player.position}
                            </div>
                            <div className="text-sm font-semibold truncate">
                              {player.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-28 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-card/50">
                        <div className="text-center text-muted-foreground text-xs">
                          <div className="text-2xl mb-1">+</div>
                          <div>Vị trí {index + 1}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
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
