import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import PlayerCard from "@/components/PlayerCard";

interface PlayerStats {
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defense?: number;
  physicality?: number;
  diving?: number;
  handling?: number;
  kicking?: number;
  reflexes?: number;
  speed?: number;
  positioning?: number;
}

interface Player {
  assetId: number;
  playerId: number;
  firstName?: string;
  lastName?: string;
  commonName?: string;
  cardName?: string;
  rating: number;
  position?: string;
  nation?: unknown;
  club?: unknown;
  league?: unknown;
  images?: unknown;
  stats?: unknown;
  traits?: unknown;
  workRates?: unknown;
  potentialPositions?: unknown;
  height?: number;
  weight?: number;
  weakFoot?: number;
  skillMovesLevel?: number;
  foot?: number;
  avgStats?: unknown;
  avgGkStats?: unknown;
  skillMoves?: unknown;
  skillStyleSkills?: unknown;
  added?: string;
  [key: string]: unknown;
}

const statLabels: Record<string, string> = {
  // Main stats Vietnamese
  pace: "Tốc Độ",
  shooting: "Sút",
  passing: "Chuyền",
  dribbling: "Rê Dắt",
  defense: "Phòng Ngự",
  physicality: "Thể Lực",
  
  // Pace (keys from DB)
  acc: "Tăng Tốc",
  spd: "Tốc Độ Chạy",
  
  // Shooting (keys from DB)
  pos: "Chọn Vị Trí",
  fin: "Dứt Điểm",
  sho: "Lực Sút",
  lsa: "Sút Xa",
  vol: "Vô Lê",
  pen: "Phạt Đền",
  
  // Passing (keys from DB)
  vis: "Tầm Nhìn",
  cro: "Tạt Bóng",
  frk: "Đá Phạt",
  spa: "Chuyền Ngắn",
  lpa: "Chuyền Dài",
  cur: "Sút Xoáy",
  
  // Dribbling (keys from DB)
  agi: "Khéo Léo",
  bal: "Cân Bằng",
  rea: "Phản Ứng",
  bac: "Kiểm Soát Bóng",
  dri: "Rê Dắt",
  awr: "Bình Tĩnh",
  
  // Defense (keys from DB)
  mrk: "Cắt Bóng",
  hea: "Đánh Đầu",
  stt: "Tranh Bóng Đứng",
  slt: "Xoạc Bóng",
  
  // Physical (keys from DB)
  jmp: "Nhảy",
  sta: "Sức Bền",
  str: "Sức Mạnh",
  agg: "Quyết Đoán",
  
  // GK stats (keys from DB)
  diving: "Đỗ Ngươi",
  handling: "Xử Lý",
  kicking: "Phát Bóng",
  reflexes: "Phản Xạ",
  speed: "Thể Lực",
  positioning: "Chọn Vị Trí",
  gkd: "Bắt Bóng",
  han: "Xử Lý",
  gkk: "Sút",
  ref: "Phản Xạ",
  gkp: "Vị Trí"
};

const detailedStatMapping: Record<string, string[]> = {
  pace: ["acc", "spd"],
  shooting: ["pos", "fin", "sho", "lsa", "vol", "pen"],
  passing: ["vis", "cro", "frk", "spa", "lpa", "cur"],
  dribbling: ["agi", "bal", "rea", "bac", "dri", "awr"],
  defense: ["mrk", "hea", "awr", "stt", "slt"],
  physicality: ["jmp", "sta", "str", "agg"]
};

interface PlayerDetailDialogProps {
  assetId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlayerDetailDialog({ assetId, open, onOpenChange }: PlayerDetailDialogProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [nationInfo, setNationInfo] = useState<{ displayName: string; image?: string } | null>(null);
  const [leagueInfo, setLeagueInfo] = useState<{ id: number; displayName: string; image?: string } | null>(null);
  const [clubInfo, setClubInfo] = useState<{ displayName: string; image?: string } | null>(null);
  const [traitsData, setTraitsData] = useState<Array<{ name: string; image: string; category: string }>>([]);
  const [skillMoveInfo, setSkillMoveInfo] = useState<{ displayName: string; image?: string } | null>(null);
  const [celebrationInfo, setCelebrationInfo] = useState<{ displayName: string; image?: string } | null>(null);

  useEffect(() => {
    if (open && assetId) {
      fetchPlayer();
    }
  }, [assetId, open]);

  const fetchPlayer = async () => {
    if (!assetId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("assetId", Number(assetId))
        .single();

      if (error) throw error;
      setPlayer(data);

      console.log("Player data:", data);
      console.log("Skill Moves:", data?.skillMoves);
      console.log("Celebration:", data?.celebration);
      console.log("Traits data:", data?.traits);

      // Fetch traits from traits table
      if (data?.traits && Array.isArray(data.traits)) {
        const traitIds = data.traits.map((trait: any) => trait.id).filter(Boolean);
        
        if (traitIds.length > 0) {
          const { data: traitsDataFromDb } = await supabase
            .from("traits")
            .select("id, displayName")
            .in("id", traitIds);
          
          if (traitsDataFromDb && traitsDataFromDb.length > 0) {
            const traitsMap = new Map(traitsDataFromDb.map(t => [t.id, t.displayName]));
            
            const traitsWithImages = data.traits.map((trait: any) => ({
              name: traitsMap.get(trait.id) || trait.title || '',
              image: trait.image || '',
              category: 'Chỉ Số Ẩn'
            }));
            setTraitsData(traitsWithImages);
          }
        }
      }

      // Fetch nation data if exists
      if (data?.nation && typeof data.nation === 'object' && 'id' in data.nation) {
        const nationId = (data.nation as Record<string, unknown>).id;
        if (nationId && typeof nationId === 'number') {
          const { data: nationData } = await supabase
            .from("nations")
            .select("displayName, image")
            .eq("id", nationId)
            .maybeSingle();
          
          if (nationData) {
            setNationInfo(nationData);
          }
        }
      }

      // Fetch league info from leagues table
      if (data?.league && typeof data.league === 'object' && 'id' in data.league) {
        const leagueId = (data.league as Record<string, unknown>).id;
        if (leagueId && typeof leagueId === 'number') {
          const { data: leagueData } = await supabase
            .from("leagues")
            .select("id, displayName, image")
            .eq("id", leagueId)
            .single();
          
          if (leagueData) {
            setLeagueInfo(leagueData);
          }
        }
      }

      // Fetch club info from teams table
      if (data?.club && typeof data.club === 'object' && 'id' in data.club) {
        const clubId = (data.club as Record<string, unknown>).id;
        if (clubId && typeof clubId === 'number') {
          const { data: clubData } = await supabase
            .from("teams")
            .select("displayName, image")
            .eq("id", clubId)
            .maybeSingle();
          
          if (clubData) {
            setClubInfo(clubData);
          }
        }
      }

      // Fetch skill move info from skillmoves table
      if (data?.skillMoves && typeof data.skillMoves === 'object' && 'id' in data.skillMoves) {
        const skillMoveId = (data.skillMoves as Record<string, unknown>).id;
        if (skillMoveId && typeof skillMoveId === 'number') {
          const { data: skillMoveData } = await supabase
            .from("skillmoves")
            .select("displayName, mediaUrl")
            .eq("id", skillMoveId)
            .maybeSingle();
          
          if (skillMoveData) {
            setSkillMoveInfo({
              displayName: skillMoveData.displayName,
              image: skillMoveData.mediaUrl || (data.skillMoves as any).image
            });
          }
        }
      }

      // Fetch celebration info from celebrations table
      if (data?.celebration && typeof data.celebration === 'object' && 'id' in data.celebration) {
        const celebrationId = (data.celebration as Record<string, unknown>).id;
        if (celebrationId && typeof celebrationId === 'number') {
          const { data: celebrationData } = await supabase
            .from("celebrations")
            .select("displayName, mediaUrl")
            .eq("id", celebrationId)
            .maybeSingle();
          
          if (celebrationData) {
            setCelebrationInfo({
              displayName: celebrationData.displayName,
              image: celebrationData.mediaUrl || (data.celebration as any).image
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching player:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!player && !loading) {
    return null;
  }

  const playerName = (player?.firstName && player?.lastName ? `${player?.firstName} ${player?.lastName}` : player?.cardName || player?.commonName);
  const imageUrl = (player?.images as any)?.playerCardImage || (player?.images as any)?.portrait || (player?.images as any)?.card || "/placeholder.svg";
  const isGK = player?.position === "GK";
  
  // Get avgStats from database (object with avg1-avg6 keys)
  const avgStatsObj = (player?.avgStats as any) || {};
  const avgGkStatsObj = (player?.avgGkStats as any) || {};
  const playerStats = (player?.stats as any) || {};
  
  // Convert to array
  const avgStatsArray = [
    avgStatsObj.avg1 || 0,
    avgStatsObj.avg2 || 0,
    avgStatsObj.avg3 || 0,
    avgStatsObj.avg4 || 0,
    avgStatsObj.avg5 || 0,
    avgStatsObj.avg6 || 0
  ];
  
  const avgGkStatsArray = [
    avgGkStatsObj.avg1 || 0,
    avgGkStatsObj.avg2 || 0,
    avgGkStatsObj.avg3 || 0,
    avgGkStatsObj.avg4 || 0,
    avgGkStatsObj.avg5 || 0,
    avgGkStatsObj.avg6 || 0
  ];
  
  const mainStats = isGK 
    ? {
        diving: avgGkStatsArray[0] || 0,
        positioning: avgGkStatsArray[5] || 0,
        handling: avgGkStatsArray[1] || 0,
        reflexes: avgGkStatsArray[3] || 0,
        kicking: avgGkStatsArray[2] || 0,
        speed: avgGkStatsArray[4] || 0
      }
    : {
        pace: avgStatsArray[0] || 0,
        shooting: avgStatsArray[1] || 0,
        passing: avgStatsArray[2] || 0,
        dribbling: avgStatsArray[3] || 0,
        defense: avgStatsArray[4] || 0,
        physicality: avgStatsArray[5] || 0
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : player ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{playerName.toUpperCase()}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              {/* Left: Player Card */}
              <div className="lg:col-span-1">
                <div className="max-w-[280px] mx-auto">
                  <PlayerCard player={player as any} variant="detail" />
                </div>
              </div>

              {/* Right: Detailed Stats */}
              <div className="lg:col-span-2">
                <Card className="p-4">
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Thông Tin</TabsTrigger>
                      <TabsTrigger value="stats">Chỉ Số</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats" className="mt-6 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                      {!isGK && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {Object.entries(mainStats).map(([mainKey, mainValue]) => {
                            const detailedStats = detailedStatMapping[mainKey] || [];
                            const getStatColor = (value: number) => {
                              if (value >= 80) return 'hsl(120, 70%, 45%)';
                              if (value >= 70) return 'hsl(90, 70%, 45%)';
                              if (value >= 60) return 'hsl(60, 70%, 45%)';
                              if (value >= 50) return 'hsl(30, 70%, 45%)';
                              return 'hsl(0, 70%, 45%)';
                            };
                            
                            return (
                              <div key={mainKey} className="flex flex-col space-y-3 p-3 bg-muted/20 rounded-lg min-w-0">
                                <div className="text-center space-y-2 pb-3 border-b border-border/40">
                                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{statLabels[mainKey]}</h3>
                                  <div 
                                    className="text-4xl font-bold"
                                    style={{ color: getStatColor(mainValue as number) }}
                                  >
                                    {mainValue || 0}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  {detailedStats.map((statKey) => {
                                    const value = playerStats?.[statKey] || 0;
                                    return (
                                      <div key={statKey} className="flex items-center justify-between text-xs gap-2">
                                        <span className="text-muted-foreground whitespace-nowrap">{statLabels[statKey] || statKey}</span>
                                        <span 
                                          className="font-semibold tabular-nums"
                                          style={{ color: getStatColor(value) }}
                                        >
                                          {value}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {isGK && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(mainStats).map(([key, value]) => {
                            const getStatColor = (val: number) => {
                              if (val >= 80) return 'hsl(120, 70%, 45%)';
                              if (val >= 70) return 'hsl(90, 70%, 45%)';
                              if (val >= 60) return 'hsl(60, 70%, 45%)';
                              if (val >= 50) return 'hsl(30, 70%, 45%)';
                              return 'hsl(0, 70%, 45%)';
                            };
                            
                            return (
                              <div key={key} className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg space-y-2">
                                <span className="text-sm font-semibold text-muted-foreground uppercase">{statLabels[key]}</span>
                                <span 
                                  className="text-3xl font-bold"
                                  style={{ color: getStatColor(value as number) }}
                                >
                                  {value || 0}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="info" className="space-y-6 mt-6 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                      {/* Player Details Card */}
                      <Card className="p-6 bg-muted/20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {/* Height */}
                          {player.height && (
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Chiều Cao</h3>
                              <div className="text-2xl font-bold">{player.height} <span className="text-sm text-muted-foreground">cm</span></div>
                            </div>
                          )}
                          
                          {/* Weight */}
                          {player.weight && (
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Cân Nặng</h3>
                              <div className="text-2xl font-bold">{player.weight} <span className="text-sm text-muted-foreground">kg</span></div>
                            </div>
                          )}
                          
                          {/* Weak Foot */}
                          {player.weakFoot && (
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Chân Phụ</h3>
                              <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold">{player.weakFoot}</span>
                                <div className="flex">
                                  {Array.from({ length: player.weakFoot }).map((_, i) => (
                                    <span key={i} className="text-primary text-lg">★</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Skill Moves */}
                          {player.skillMovesLevel && (
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Kỹ Năng</h3>
                              <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold">{player.skillMovesLevel}</span>
                                <div className="flex">
                                  {Array.from({ length: player.skillMovesLevel }).map((_, i) => (
                                    <span key={i} className="text-primary text-lg">★</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team */}
                        {clubInfo && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground">Câu Lạc Bộ</h3>
                            <div className="flex items-center gap-2">
                              {clubInfo.image && (
                                <img src={clubInfo.image} alt={clubInfo.displayName} className="w-8 h-8 object-contain" />
                              )}
                              <span className="font-medium">{clubInfo.displayName}</span>
                            </div>
                          </div>
                        )}

                        {/* League */}
                        {player.league && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground">Giải Đấu</h3>
                            <div className="flex items-center gap-2">
                              {leagueInfo?.image && (
                                <img 
                                  src={leagueInfo.image} 
                                  alt={leagueInfo.displayName} 
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="font-medium">{leagueInfo?.displayName || (player.league as any).name}</span>
                            </div>
                          </div>
                        )}

                        {/* Nation */}
                        {nationInfo && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground">Quốc Tịch</h3>
                            <div className="flex items-center gap-2">
                              {nationInfo.image && (
                                <img 
                                  src={nationInfo.image} 
                                  alt={nationInfo.displayName}
                                  className="w-8 h-6 object-cover rounded-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="font-medium">{nationInfo.displayName}</span>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Work Rates */}
                      {(player as any).workRates && (
                        <div className="space-y-2 pt-4 border-t">
                          <h3 className="text-sm font-semibold text-muted-foreground">Tốc Độ Làm Việc</h3>
                          <div className="flex gap-6">
                            {((player as any).workRates as any)?.attWorkRate && (
                              <div>
                                <span className="text-muted-foreground text-sm">Tấn công: </span>
                                <span className="font-semibold">{((player as any).workRates as any).attWorkRate}</span>
                              </div>
                            )}
                            {((player as any).workRates as any)?.defWorkRate && (
                              <div>
                                <span className="text-muted-foreground text-sm">Phòng thủ: </span>
                                <span className="font-semibold">{((player as any).workRates as any).defWorkRate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Alternative Positions */}
                      {player.potentialPositions && Array.isArray((player as any).potentialPositions) && (player as any).potentialPositions.length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                          <h3 className="text-sm font-semibold text-muted-foreground">Vị Trí Thay Thế</h3>
                          <div className="flex flex-wrap gap-2">
                            {((player as any).potentialPositions || []).map((pos: any, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {pos.label || pos}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Đặc Điểm */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-semibold text-muted-foreground">Đặc Điểm</h3>
                        {(skillMoveInfo || celebrationInfo || (player as any).skillMoves?.image || (player as any).celebration?.image || traitsData.length > 0) ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Skill Moves */}
                            {(skillMoveInfo || (player as any).skillMoves?.image) && (
                              <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors">
                                <div className="w-16 h-16 flex items-center justify-center">
                                  <img 
                                    src={skillMoveInfo?.image || (player as any).skillMoves.image} 
                                    alt="Skill Move"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold">
                                    {skillMoveInfo?.displayName || (player as any).skillMoves?.title || 'Skill Move'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Động Tác Kỹ Thuật</div>
                                </div>
                              </div>
                            )}

                            {/* Celebration */}
                            {(celebrationInfo || (player as any).celebration?.image) && (
                              <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors">
                                <div className="w-16 h-16 flex items-center justify-center">
                                  <img 
                                    src={celebrationInfo?.image || (player as any).celebration.image} 
                                    alt="Celebration"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold">
                                    {celebrationInfo?.displayName || (player as any).celebration?.title || 'Celebration'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Ăn Mừng</div>
                                </div>
                              </div>
                            )}

                            {/* Traits */}
                            {traitsData.map((trait, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors">
                                <div className="w-16 h-16 flex items-center justify-center">
                                  <img 
                                    src={trait.image} 
                                    alt={trait.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold">{trait.name}</div>
                                  <div className="text-xs text-muted-foreground">{trait.category}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
