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
  pace: "Tốc độ",
  shooting: "Sút",
  passing: "Chuyền",
  dribbling: "Rê dắt",
  defense: "Phòng ngự",
  physicality: "Thể lực",
  
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

      // Fetch traits data
      const traitIds: number[] = [];
      Object.keys(data || {}).forEach(key => {
        if (key.startsWith('trait_name_')) {
          const id = parseInt(key.replace('trait_name_', ''));
          if (!isNaN(id)) {
            traitIds.push(id);
          }
        }
      });

      if (traitIds.length > 0) {
        const { data: traitsDbData } = await supabase
          .from("traits")
          .select("id, displayName, localizationKeyName, rawData")
          .in("id", traitIds);

        if (traitsDbData) {
          const traitsWithImages = traitsDbData.map(trait => {
            const rawData = trait.rawData as any;
            return {
              name: trait.displayName,
              image: rawData?.traitIconUrl || '',
              category: 'Chỉ Số Ẩn'
            };
          });
          setTraitsData(traitsWithImages);
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

                    <TabsContent value="stats" className="space-y-6 mt-6 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                      {!isGK && Object.entries(mainStats).map(([mainKey, mainValue]) => {
                        const detailedStats = detailedStatMapping[mainKey] || [];
                        
                        return (
                          <div key={mainKey} className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b">
                              <h3 className="text-lg font-semibold">{statLabels[mainKey]}</h3>
                              <span className="text-2xl font-bold text-primary">{mainValue || 0}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {detailedStats.map((statKey) => {
                                const value = playerStats?.[statKey];
                                return (
                                  <div key={statKey} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                    <span className="text-sm text-muted-foreground">{statLabels[statKey] || statKey}</span>
                                    <span className="font-semibold">{value || 0}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      
                      {isGK && (
                        <div className="space-y-3">
                          {Object.entries(mainStats).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                              <span className="text-base font-medium">{statLabels[key]}</span>
                              <span className="text-2xl font-bold text-primary">{value || 0}</span>
                            </div>
                          ))}
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

                      {/* Đặc Điểm Section */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-semibold">Đặc Điểm</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Skill Moves */}
                          {(player as any).skillMoves?.skillMoves && (
                            <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors">
                              <div className="w-16 h-16 flex items-center justify-center">
                                <img 
                                  src={(player as any).skillMoves.skillMoves} 
                                  alt="Skill Move"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold">
                                  {(player as any).skillMoves?.skillMovesName || 'Skill Move'}
                                </div>
                                <div className="text-xs text-muted-foreground">Động Tác Kỹ Thuật</div>
                              </div>
                            </div>
                          )}

                          {/* Celebration */}
                          {(player as any).celebration?.celebrationIconUrl && (
                            <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors">
                              <div className="w-16 h-16 flex items-center justify-center">
                                <img 
                                  src={(player as any).celebration.celebrationIconUrl} 
                                  alt="Celebration"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold">
                                  {(player as any).celebration?.celebrationName || 'Celebration'}
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

                      {/* Traits */}
                      {player.traits && Array.isArray((player as any).traits) && (player as any).traits.length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                          <h3 className="text-sm font-semibold text-muted-foreground">Đặc Điểm</h3>
                          <div className="flex flex-wrap gap-2">
                            {((player as any).traits || []).map((trait: any, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {trait.title || trait.label || trait.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {player.skillMoves && Array.isArray((player as any).skillMoves) && (player as any).skillMoves.length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                          <h3 className="text-sm font-semibold text-muted-foreground">Động Tác Kỹ Thuật</h3>
                          <div className="flex flex-wrap gap-2">
                            {((player as any).skillMoves || []).map((skill: any, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {skill.label || skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
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
