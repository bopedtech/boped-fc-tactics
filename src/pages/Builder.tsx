import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AIAdvisor from "@/components/AIAdvisor";
import PlayerSelectionDialog from "@/components/PlayerSelectionDialog";
import PlayerCard from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";
import { TEXT } from "@/constants/text";
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
import { toast } from "sonner";
import { Save, Sparkles, Trash2, Calculator } from "lucide-react";
import { useT } from "@/contexts/LocalizationContext";

interface Player {
  assetId: number;
  commonName: string;
  rating: number;
  position: string;
  nation?: any;
  club?: any;
  images?: any;
  stats: any;
  traits?: any;
  rank?: number;
  training?: number;
}

interface Formation {
  id: number;
  name: string;
  nameEn: string;
  category: string;
  positions: string[];
}

// Helper function to calculate formation layout positions
const calculateFormationLayout = (positions: string[]): Array<{ top: string; left: string; position: string }> => {
  const layout: Array<{ top: string; left: string; position: string }> = [];
  
  // Định nghĩa thứ tự Y cho từng loại vị trí (từ cao xuống thấp = từ tấn công về phòng thủ)
  const positionHierarchy: Record<string, number> = {
    // Attackers (cao nhất)
    'ST': 10,
    'CF': 14,
    'LW': 18,
    'RW': 18,
    'LF': 18,
    'RF': 18,
    
    // Attacking midfielders (CAM cao hơn LM/RM)
    'CAM': 32,
    
    // Wing attackers/midfielders
    'LM': 44,
    'RM': 44,
    
    // Central midfielders
    'CM': 54,
    
    // Defensive midfielders
    'CDM': 64,
    
    // Wing backs
    'LWB': 71,
    'RWB': 71,
    
    // Full backs
    'LB': 77,
    'RB': 77,
    
    // Center backs
    'CB': 83,
    
    // Goalkeeper
    'GK': 92
  };
  
  // Định nghĩa vị trí X cho từng loại vị trí
  const positionLateralType: Record<string, 'left' | 'center' | 'right'> = {
    'LW': 'left',
    'LF': 'left',
    'LM': 'left',
    'LWB': 'left',
    'LB': 'left',
    
    'RW': 'right',
    'RF': 'right',
    'RM': 'right',
    'RWB': 'right',
    'RB': 'right',
    
    'ST': 'center',
    'CF': 'center',
    'CAM': 'center',
    'CM': 'center',
    'CDM': 'center',
    'CB': 'center',
    'GK': 'center'
  };
  
  // Nhóm các vị trí theo thứ bậc Y
  const positionsByLevel: Record<number, { pos: string; lateral: 'left' | 'center' | 'right' }[]> = {};
  
  positions.forEach(pos => {
    const yLevel = positionHierarchy[pos] || 50;
    const lateral = positionLateralType[pos] || 'center';
    
    if (!positionsByLevel[yLevel]) {
      positionsByLevel[yLevel] = [];
    }
    positionsByLevel[yLevel].push({ pos, lateral });
  });
  
  // Tính toán vị trí cho từng level
  Object.entries(positionsByLevel).forEach(([yLevel, posArray]) => {
    const y = `${yLevel}%`;
    
    // Nhóm theo lateral (left, center, right)
    const leftPositions = posArray.filter(p => p.lateral === 'left');
    const centerPositions = posArray.filter(p => p.lateral === 'center');
    const rightPositions = posArray.filter(p => p.lateral === 'right');
    
    // Xử lý vị trí bên trái
    if (leftPositions.length === 1) {
      layout.push({ top: y, left: '12%', position: leftPositions[0].pos });
    } else if (leftPositions.length > 1) {
      leftPositions.forEach((p, idx) => {
        const leftX = 8 + (idx * 8);
        layout.push({ top: y, left: `${leftX}%`, position: p.pos });
      });
    }
    
    // Xử lý vị trí trung tâm (giãn khoảng cách hơn)
    if (centerPositions.length === 1) {
      layout.push({ top: y, left: '50%', position: centerPositions[0].pos });
    } else if (centerPositions.length === 2) {
      layout.push({ top: y, left: '35%', position: centerPositions[0].pos });
      layout.push({ top: y, left: '65%', position: centerPositions[1].pos });
    } else if (centerPositions.length === 3) {
      layout.push({ top: y, left: '25%', position: centerPositions[0].pos });
      layout.push({ top: y, left: '50%', position: centerPositions[1].pos });
      layout.push({ top: y, left: '75%', position: centerPositions[2].pos });
    } else if (centerPositions.length === 4) {
      layout.push({ top: y, left: '20%', position: centerPositions[0].pos });
      layout.push({ top: y, left: '40%', position: centerPositions[1].pos });
      layout.push({ top: y, left: '60%', position: centerPositions[2].pos });
      layout.push({ top: y, left: '80%', position: centerPositions[3].pos });
    } else if (centerPositions.length === 5) {
      layout.push({ top: y, left: '15%', position: centerPositions[0].pos });
      layout.push({ top: y, left: '32%', position: centerPositions[1].pos });
      layout.push({ top: y, left: '50%', position: centerPositions[2].pos });
      layout.push({ top: y, left: '68%', position: centerPositions[3].pos });
      layout.push({ top: y, left: '85%', position: centerPositions[4].pos });
    }
    
    // Xử lý vị trí bên phải
    if (rightPositions.length === 1) {
      layout.push({ top: y, left: '88%', position: rightPositions[0].pos });
    } else if (rightPositions.length > 1) {
      rightPositions.forEach((p, idx) => {
        const rightX = 84 + (idx * 8);
        layout.push({ top: y, left: `${rightX}%`, position: p.pos });
      });
    }
  });
  
  return layout;
};

export default function Builder() {
  const { t } = useT();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [squadName, setSquadName] = useState("");
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  
  // Squad lineup (11 positions)
  const [lineup, setLineup] = useState<(Player | null)[]>(Array(11).fill(null));

  useEffect(() => {
    checkUser();
    fetchFormations();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error(t("builder.toast.loginRequired", "Vui lòng đăng nhập để sử dụng Squad Builder"));
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchFormations = async () => {
    try {
      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("id", { ascending: true });
      
      if (error) throw error;
      
      const formattedFormations = (data || []).map(f => ({
        ...f,
        positions: typeof f.positions === 'string' ? JSON.parse(f.positions) : f.positions
      }));
      
      setFormations(formattedFormations);
      if (formattedFormations.length > 0) {
        setSelectedFormation(formattedFormations[0]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(t("builder.toast.formationLoadError", "Không thể tải sơ đồ chiến thuật"));
    }
  };

  const handleOpenPlayerDialog = (index: number) => {
    setSelectedSlotIndex(index);
    setShowPlayerDialog(true);
  };

  const handleSelectPlayer = (player: Player, rank: number, training: number) => {
    if (selectedSlotIndex !== null) {
      const newLineup = [...lineup];
      newLineup[selectedSlotIndex] = { ...player, rank, training };
      setLineup(newLineup);
      toast.success(t("builder.toast.playerAdded", "Đã thêm {player} (Rank {rank}, Training {training}) vào đội hình")
        .replace("{player}", player.commonName)
        .replace("{rank}", String(rank))
        .replace("{training}", String(training)));
    }
  };

  const removePlayerFromLineup = (index: number) => {
    const newLineup = [...lineup];
    newLineup[index] = null;
    setLineup(newLineup);
  };

  const clearLineup = () => {
    setLineup(Array(11).fill(null));
    toast.success(t("builder.toast.squadCleared", "Đã xóa toàn bộ đội hình"));
  };

  const handleFormationChange = (formationId: string) => {
    const formation = formations.find(f => f.id === parseInt(formationId));
    if (formation) {
      setSelectedFormation(formation);
      // Clear lineup when changing formation
      setLineup(Array(11).fill(null));
    }
  };

  const handleSave = async () => {
    if (!squadName.trim()) {
      toast.error(t("builder.toast.nameRequired", "Vui lòng nhập tên đội hình"));
      return;
    }

    const filledPositions = lineup.filter((p) => p !== null).length;
    if (filledPositions < 11) {
      toast.error(t("builder.toast.incomplete", "Đội hình chưa đủ 11 cầu thủ ({filled}/11)").replace("{filled}", String(filledPositions)));
      return;
    }

    if (!user) {
      toast.error(t("builder.toast.loginFirst", "Vui lòng đăng nhập"));
      navigate("/auth");
      return;
    }

    try {
      setSaving(true);

      const lineupData = {
        formation: selectedFormation?.name || "",
        players: lineup.map((player, index) => ({
          position: index,
          playerId: player?.assetId,
          playerName: player?.commonName,
          playerOvr: player?.rating,
        })),
      };

      const { error } = await supabase.from("squads").insert({
        userId: user.id,
        squadName: squadName,
        formation: selectedFormation?.name || "",
        lineup: lineupData,
      });

      if (error) throw error;

      toast.success(t("builder.toast.saveSuccess", "Đã lưu đội hình!"));
      navigate("/my-squads");
    } catch (error: any) {
      toast.error(t("builder.toast.saveError", "Không thể lưu đội hình"));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filledCount = lineup.filter((p) => p !== null).length;
  const totalOVR = Math.round(
    lineup.reduce((sum, player) => sum + (player?.rating || 0), 0) / 11
  );

  const formationLayout = selectedFormation 
    ? calculateFormationLayout(selectedFormation.positions)
    : [];

  const getRequiredPosition = (index: number) => {
    return formationLayout[index]?.position || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      {showAIAdvisor && (
        <AIAdvisor
          onClose={() => setShowAIAdvisor(false)}
          squadData={lineup}
        />
      )}

      {showPlayerDialog && (
        <PlayerSelectionDialog
          open={showPlayerDialog}
          onClose={() => setShowPlayerDialog(false)}
          onSelectPlayer={handleSelectPlayer}
          requiredPosition={selectedSlotIndex !== null ? getRequiredPosition(selectedSlotIndex) : undefined}
          selectedPlayerIds={lineup.filter(p => p !== null).map(p => p!.assetId)}
        />
      )}

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            {t("builder.title", "Xây dựng đội hình FC Mobile")}
          </h1>
          <p className="text-muted-foreground">
            {t("builder.subtitle", "Tạo đội hình tối ưu cho FC Mobile")} ({filledCount}/11 {t("database.players", "cầu thủ")})
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Left: Pitch */}
          <div className="space-y-4 animate-fade-in">
            <Card className="p-6 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-2">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  {selectedFormation?.name || t("builder.selectFormation", "Chọn sơ đồ")}
                </h3>
              </div>

              {/* Football Pitch */}
              <div className="relative w-full aspect-[3/4] max-h-[700px] bg-gradient-to-b from-green-800/40 via-green-700/30 to-green-800/40 rounded-xl border-4 border-green-600/20 shadow-2xl overflow-hidden">
                {/* Pitch markings */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[12%] border-2 border-white/20 rounded-b-2xl" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[12%] border-2 border-white/20 rounded-t-2xl" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white/20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30" />
                </div>

                {/* Player positions */}
                {formationLayout.map((pos, index) => {
                  const player = lineup[index];
                  return (
                    <div
                      key={index}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                      style={{ top: pos.top, left: pos.left }}
                    >
                      <PlayerCard
                        player={player}
                        position={pos.position}
                        variant="small"
                        onClick={() => handleOpenPlayerDialog(index)}
                        onRemove={player ? () => removePlayerFromLineup(index) : undefined}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("builder.clickToAdd", "💡 Nhấp vào vị trí để thêm cầu thủ vào đội hình")}
                </p>
              </div>
            </Card>
          </div>

          {/* Right: Team Info & Controls */}
          <div className="space-y-4 animate-fade-in">
            <Card className="p-6 bg-gradient-to-br from-card/95 to-primary/5 backdrop-blur-sm border-2 sticky top-4">
              <h3 className="text-xl font-bold mb-6 gradient-primary bg-clip-text text-transparent">
                {t("builder.squadInfo", "Thông tin đội hình")}
              </h3>

              {/* Team OVR */}
              <div className="text-center mb-6 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="text-6xl font-black gradient-primary bg-clip-text text-transparent mb-2">
                  {totalOVR || 0}
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("builder.totalOvr", "Chỉ số tổng OVR")}
                </div>
              </div>

              {/* Squad Name */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="squad-name" className="text-sm font-semibold">
                  {t("builder.squadName", "Tên đội hình")}
                </Label>
                <Input
                  id="squad-name"
                  placeholder={t("builder.squadNamePlaceholder", "Đội hình của tôi...")}
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              {/* Formation Select */}
              <div className="space-y-2 mb-6">
                <Label className="text-sm font-semibold">{t("builder.formation", "Sơ đồ chiến thuật")}</Label>
                <Select 
                  value={selectedFormation?.id.toString()} 
                  onValueChange={handleFormationChange}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder={t("builder.formationPlaceholder", "Chọn sơ đồ...")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {formations.reduce((acc: any[], formation) => {
                      const lastCategory = acc[acc.length - 1];
                      if (!lastCategory || lastCategory.category !== formation.category) {
                        acc.push({ category: formation.category, items: [formation] });
                      } else {
                        lastCategory.items.push(formation);
                      }
                      return acc;
                    }, []).map((group) => (
                      <div key={group.category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          {group.category}
                        </div>
                        {group.items.map((f: Formation) => (
                          <SelectItem key={f.id} value={f.id.toString()}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={clearLineup}
                  variant="outline"
                  className="w-full border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                  disabled={filledCount === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("builder.clearSquad", "Xóa đội hình")}
                </Button>

                <Button
                  onClick={() => setShowAIAdvisor(true)}
                  disabled={filledCount < 11}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("builder.aiAdvice", "Phân tích AI")}
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving || filledCount < 11}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  size="lg"
                >
                  <Save className="mr-2 h-5 w-5" />
                  {saving ? "Đang lưu..." : t("builder.saveSquad", "Lưu đội hình")}
                </Button>
              </div>

              {filledCount < 11 && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Cần thêm {11 - filledCount} {t("database.players", "cầu thủ")} để hoàn thành đội hình
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
