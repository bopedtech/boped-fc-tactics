import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added Link
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AIAdvisor from "@/components/AIAdvisor";
import PlayerSelectionDialog from "@/components/PlayerSelectionDialog";
import PlayerCard from "@/components/PlayerCard";
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
import { toast } from "sonner";
import { Save, Sparkles, Trash2, Globe, Lock } from "lucide-react";
import { useT } from "@/contexts/LocalizationContext";
import { Switch } from "@/components/ui/switch";

// New Components
import TacticsEditor, { DEFAULT_TACTICS, TacticsData } from "@/components/builder/TacticsEditor";
import SquadHistorySidebar from "@/components/builder/SquadHistorySidebar";
import CommunitySquads from "@/components/builder/CommunitySquads";
import OCRScanner from "@/components/builder/OCRControl";

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
  id: string;
  name: string;
  nameEn?: string;
  category?: string;
  positions: string[];
}

// ... (keep calculateFormationLayout helper) ...
const calculateFormationLayout = (positions: string[]): Array<{ top: string; left: string; position: string }> => {
  const layout: Array<{ top: string; left: string; position: string }> = [];

  const positionHierarchy: Record<string, number> = {
    'ST': 10, 'CF': 14, 'LW': 18, 'RW': 18, 'LF': 18, 'RF': 18,
    'CAM': 32,
    'LM': 44, 'RM': 44,
    'CM': 54,
    'CDM': 64,
    'LWB': 71, 'RWB': 71,
    'LB': 77, 'RB': 77,
    'CB': 83,
    'GK': 92
  };

  const positionLateralType: Record<string, 'left' | 'center' | 'right'> = {
    'LW': 'left', 'LF': 'left', 'LM': 'left', 'LWB': 'left', 'LB': 'left',
    'RW': 'right', 'RF': 'right', 'RM': 'right', 'RWB': 'right', 'RB': 'right',
    'ST': 'center', 'CF': 'center', 'CAM': 'center', 'CM': 'center',
    'CDM': 'center', 'CB': 'center', 'GK': 'center'
  };

  const positionsByLevel: Record<number, { pos: string; lateral: 'left' | 'center' | 'right' }[]> = {};

  positions.forEach(pos => {
    const yLevel = positionHierarchy[pos] || 50;
    const lateral = positionLateralType[pos] || 'center';
    if (!positionsByLevel[yLevel]) positionsByLevel[yLevel] = [];
    positionsByLevel[yLevel].push({ pos, lateral });
  });

  Object.entries(positionsByLevel).forEach(([yLevel, posArray]) => {
    const y = `${yLevel}%`;
    const leftPositions = posArray.filter(p => p.lateral === 'left');
    const centerPositions = posArray.filter(p => p.lateral === 'center');
    const rightPositions = posArray.filter(p => p.lateral === 'right');

    if (leftPositions.length === 1) {
      layout.push({ top: y, left: '12%', position: leftPositions[0].pos });
    } else if (leftPositions.length > 1) {
      leftPositions.forEach((p, idx) => {
        const leftX = 8 + (idx * 8);
        layout.push({ top: y, left: `${leftX}%`, position: p.pos });
      });
    }

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
  const { t, locale } = useT();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // State
  const [squadId, setSquadId] = useState<string | null>(null);
  const [squadName, setSquadName] = useState("");
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [lineup, setLineup] = useState<(Player | null)[]>(Array(11).fill(null));
  
  // New States
  const [tactics, setTactics] = useState<TacticsData>(DEFAULT_TACTICS);
  const [isPublic, setIsPublic] = useState(false);
  
  // UI States
  const [saving, setSaving] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  useEffect(() => {
    checkUser();
    fetchFormations();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUser(session.user);
  };

  const fetchFormations = async () => {
    try {
      const { data, error } = await supabase.from("formations").select("*").order("id", { ascending: true });
      if (error) throw error;
      const formatted = (data || []).map(f => ({
        ...f,
        positions: typeof f.positions === 'string' ? JSON.parse(f.positions) : f.positions
      }));
      setFormations(formatted);
      if (formatted.length > 0) setSelectedFormation(formatted[0]);
    } catch (error) { console.error(error); }
  };

  const loadSquad = (squad: any) => {
      setSquadId(squad.id);
      setSquadName(squad.squadName);
      
      // Load Lineup
      const formation = formations.find(f => f.name === squad.formation);
      if (formation) setSelectedFormation(formation);
      
      const loadedLineup = Array(11).fill(null);
      const squadData = typeof squad.lineup === 'string' ? JSON.parse(squad.lineup) : squad.lineup;
      
      if (squadData?.players) {
         squadData.players.forEach((p: any) => {
             loadedLineup[p.position] = {
                 assetId: p.playerId,
                 commonName: p.playerName,
                 rating: p.playerOvr,
                 // Mock other missing data if needed as we only stored basics
                 position: "UNKNOWN"
             };
         });
      }
      setLineup(loadedLineup);

      // Load Tactics
      if (squad.tactics) {
         setTactics(typeof squad.tactics === 'string' ? JSON.parse(squad.tactics) : squad.tactics);
      } else {
         setTactics(DEFAULT_TACTICS);
      }
      setIsPublic(squad.is_public || false);
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
      toast.success(`Đã thêm ${player.commonName}`);
    }
  };

  const handleOCRResult = (players: any[]) => {
      // Very basic merging login: fill empty slots first
      const newLineup = [...lineup];
      let matchCount = 0;
      players.forEach((p, idx) => {
          if (idx < 11 && !newLineup[idx]) {
             newLineup[idx] = p;
             matchCount++;
          }
      });
      setLineup(newLineup);
      toast.success(`Đã tự động điền ${matchCount} cầu thủ`);
  };

  const removePlayerFromLineup = (index: number) => {
    const newLineup = [...lineup];
    newLineup[index] = null;
    setLineup(newLineup);
  };

  const handleFormationChange = (value: string) => {
    const formation = formations.find(f => f.id.toString() === value);
    if (formation) {
      setSelectedFormation(formation);
      setLineup(Array(11).fill(null));
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error(t("builder.toast.loginFirst", "Vui lòng đăng nhập để lưu"));
      navigate("/auth");
      return;
    }
    if (!squadName.trim()) return toast.error("Vui lòng nhập tên đội hình");

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

      const payload = {
        userId: user.id,
        squadName: squadName,
        formation: selectedFormation?.name || "",
        lineup: lineupData,
      };

      let error;
      if (squadId) {
         const { error: err } = await supabase.from("squads").update(payload).eq("id", squadId);
         error = err;
      } else {
         const { error: err } = await supabase.from("squads").insert(payload);
         error = err;
      }

      if (error) throw error;
      toast.success("Đã lưu đội hình!");
      // Optionally refresh history list here via context or callback if we had one
    } catch (error: any) {
      toast.error("Lỗi lưu đội hình");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filledCount = lineup.filter((p) => p !== null).length;
  const totalOVR = Math.round(lineup.reduce((sum, player) => sum + (player?.rating || 0), 0) / 11) || 0;
  const formationLayout = selectedFormation ? calculateFormationLayout(selectedFormation.positions) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Layout: 3 Columns */}
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_320px] gap-6 h-[calc(100vh-140px)]">
          
          {/* Column 1: History Sidebar */}
          <div className="hidden lg:block h-full overflow-hidden">
             <SquadHistorySidebar user={user} onSelectSquad={loadSquad} currentSquadId={squadId || undefined} />
          </div>

          {/* Column 2: Pitch & Main Controls */}
          <div className="flex flex-col space-y-4 h-full overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                   {squadName || "New Squad"}
                </h2>
                <OCRScanner onScanComplete={handleOCRResult} />
             </div>

            <Card className="flex-1 relative bg-gradient-to-b from-green-900 to-green-800 border-4 border-green-700/50 shadow-2xl rounded-xl overflow-hidden min-h-[600px]">
                 {/* Pitch Markings */}
                 <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[12%] border-2 border-white rounded-b-2xl" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[12%] border-2 border-white rounded-t-2xl" />
                    <div className="absolute top-1/2 w-full h-0.5 bg-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white" />
                 </div>

                 {/* Players */}
                 {formationLayout.map((pos, index) => (
                    <div
                      key={index}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out z-10"
                      style={{ top: pos.top, left: pos.left }}
                    >
                       <PlayerCard
                         player={lineup[index]}
                         position={pos.position}
                         variant="small"
                         onClick={() => handleOpenPlayerDialog(index)}
                         onRemove={lineup[index] ? () => removePlayerFromLineup(index) : undefined}
                       />
                    </div>
                 ))}
                 
                 <div className="absolute bottom-4 right-4 z-20 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs">
                    {filledCount}/11 Players
                 </div>
             </Card>
          </div>

          {/* Column 3: Tactics & Settings */}
          <div className="h-full overflow-hidden flex flex-col space-y-4">
             {/* Info Card */}
             <Card className="p-4 bg-muted/20">
                <div className="flex justify-between items-center mb-4">
                   <div className="text-4xl font-black gradient-primary bg-clip-text text-transparent">{totalOVR}</div>
                   <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase">Team OVR</div>
                      <div className="font-bold">{selectedFormation?.name}</div>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="space-y-1">
                      <Label className="text-xs">Tên đội hình</Label>
                      <Input value={squadName} onChange={(e) => setSquadName(e.target.value)} placeholder="Nhập tên..." className="h-8" />
                   </div>
                   
                   <div className="space-y-1">
                      <Label className="text-xs">Sơ đồ</Label>
                      <Select value={selectedFormation?.id.toString()} onValueChange={handleFormationChange}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                           {formations.map(f => (
                              <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                   </div>
                   
                   <div className="flex items-center justify-between pt-2">
                      <Label className="text-xs flex items-center gap-2">
                         {isPublic ? <Globe className="w-3 h-3 text-blue-500" /> : <Lock className="w-3 h-3" />}
                         {isPublic ? "Công khai" : "Riêng tư"}
                      </Label>
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                   <Button variant="outline" size="sm" onClick={() => setLineup(Array(11).fill(null))}>
                      <Trash2 className="w-3 h-3 mr-1" /> Xóa
                   </Button>
                   <Button size="sm" onClick={handleSave} disabled={saving} className="gradient-primary">
                      <Save className="w-3 h-3 mr-1" /> Lưu
                   </Button>
                </div>
                 
                <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => setShowAIAdvisor(true)}>
                   <Sparkles className="w-3 h-3 mr-1" /> AI Gợi ý
                </Button>
             </Card>

             {/* Tactics Editor (Takes remaining space) */}
             <div className="flex-1 overflow-hidden rounded-xl border border-border/50">
                <TacticsEditor tactics={tactics} onChange={setTactics} />
             </div>
          </div>
        </div>

        {/* Community Section (Below the fold) */}
        <CommunitySquads />
      </div>
      
      {/* Dialogs */}
      {showPlayerDialog && (
         <PlayerSelectionDialog
           open={showPlayerDialog}
           onClose={() => setShowPlayerDialog(false)}
           onSelectPlayer={handleSelectPlayer}
           requiredPosition={selectedSlotIndex !== null ? formationLayout[selectedSlotIndex]?.position : undefined}
           selectedPlayerIds={lineup.filter(p => p !== null).map(p => p!.assetId)}
         />
      )}
      
      {showAIAdvisor && <AIAdvisor onClose={() => setShowAIAdvisor(false)} squadData={lineup} />}
    </div>
  );
}
