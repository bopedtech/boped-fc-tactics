import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCountryFlag } from "@/lib/countryUtils";

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
  // Detailed stats
  acceleration?: number;
  sprintSpeed?: number;
  positioning_att?: number;
  finishing?: number;
  shotPower?: number;
  longShots?: number;
  volleys?: number;
  penalties?: number;
  vision?: number;
  crossing?: number;
  fkAccuracy?: number;
  shortPassing?: number;
  longPassing?: number;
  curve?: number;
  agility?: number;
  balance?: number;
  reactions?: number;
  ballControl?: number;
  dribbling_detail?: number;
  composure?: number;
  interceptions?: number;
  headingAccuracy?: number;
  defAwareness?: number;
  standTackle?: number;
  slideTackle?: number;
  jumping?: number;
  stamina?: number;
  strength?: number;
  aggression?: number;
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
  nation?: any;
  club?: any;
  league?: any;
  images?: any;
  stats?: PlayerStats;
  traits?: any;
  workRates?: any;
  potentialPositions?: any;
  height?: number;
  weight?: number;
  weakFoot?: number;
  skillMovesLevel?: number;
  foot?: number;
  avgStats?: any;
  avgGkStats?: any;
  skillMoves?: any;
  skillStyleSkills?: any;
}

const statLabels: Record<string, string> = {
  // Main stats Vietnamese
  pace: "Tốc độ",
  shooting: "Sút",
  passing: "Chuyền",
  dribbling: "Rê dắt",
  defense: "Phòng ngự",
  physicality: "Thể lực",
  
  // Pace
  acceleration: "Tăng Tốc",
  sprintSpeed: "Tốc Độ Chạy",
  
  // Shooting
  positioning_att: "Dứt Điểm",
  finishing: "Dứt Điểm",
  shotPower: "Sút Xa",
  longShots: "Lực Sút",
  volleys: "Chọn Vị Trí",
  penalties: "Vô Lê",
  
  // Passing
  vision: "Phạt Đền",
  crossing: "Chuyền Ngắn",
  fkAccuracy: "Chuyền Dài",
  shortPassing: "Chuyền Ngắn",
  longPassing: "Chuyền Dài",
  curve: "Tầm Nhìn",
  
  // Dribbling
  agility: "Tạt Bóng",
  balance: "Sút xoáy",
  reactions: "Đá Phạt",
  ballControl: "Rê Dắt",
  composure: "Khéo Léo",
  
  // Defense
  interceptions: "Phản Ứng",
  headingAccuracy: "Kiểm Soát Bóng",
  defAwareness: "Rê Dắt",
  standTackle: "Khéo Léo",
  slideTackle: "Xoạc Bóng",
  
  // Physical
  jumping: "Phản Ứng",
  stamina: "Cân Trọng",
  strength: "Sức Mạnh",
  aggression: "Quyết Đoán",
  
  // GK stats
  diving: "Bắt Bóng",
  handling: "Xử Lý",
  kicking: "Sút",
  reflexes: "Phản Xạ",
  speed: "Tốc Độ",
  positioning: "Vị Trí"
};

const detailedStatMapping: Record<string, string[]> = {
  pace: ["acceleration", "sprintSpeed"],
  shooting: ["positioning_att", "finishing", "shotPower", "longShots", "volleys", "penalties"],
  passing: ["vision", "crossing", "fkAccuracy", "shortPassing", "longPassing", "curve"],
  dribbling: ["agility", "balance", "reactions", "ballControl", "composure"],
  defense: ["interceptions", "headingAccuracy", "defAwareness", "standTackle", "slideTackle"],
  physicality: ["jumping", "stamina", "strength", "aggression"]
};

export default function PlayerDetail() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [clubData, setClubData] = useState<any>(null);

  useEffect(() => {
    fetchPlayer();
  }, [assetId]);

  const fetchPlayer = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("assetId", Number(assetId))
        .single();

      if (error) throw error;
      setPlayer(data as any);

      // Fetch club data if exists
      if (data?.club && typeof data.club === 'object' && 'id' in data.club) {
        const clubId = (data.club as any).id;
        const { data: club } = await supabase
          .from("clubs")
          .select("*")
          .eq("clubId", clubId)
          .single();
        setClubData(club);
      }
    } catch (error) {
      console.error("Error fetching player:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto py-8">
          <p className="text-center text-muted-foreground">Không tìm thấy cầu thủ</p>
        </div>
      </div>
    );
  }

  const playerName = player.commonName || player.cardName || `${player.firstName} ${player.lastName}`;
  const imageUrl = (player.images as any)?.portrait || (player.images as any)?.card || "/placeholder.svg";
  const isGK = player.position === "GK";
  
  const avgStatsArray = (player.avgStats as any) || [];
  const avgGkStatsArray = (player.avgGkStats as any) || [];
  const playerStats = (player.stats as any) || {};
  
  const mainStats = isGK 
    ? {
        diving: avgGkStatsArray[0] || playerStats?.diving || 0,
        handling: avgGkStatsArray[1] || playerStats?.handling || 0,
        kicking: avgGkStatsArray[2] || playerStats?.kicking || 0,
        reflexes: avgGkStatsArray[3] || playerStats?.reflexes || 0,
        speed: avgGkStatsArray[4] || playerStats?.speed || 0,
        positioning: avgGkStatsArray[5] || playerStats?.positioning || 0
      }
    : {
        pace: avgStatsArray[0] || playerStats?.pace || 0,
        shooting: avgStatsArray[1] || playerStats?.shooting || 0,
        passing: avgStatsArray[2] || playerStats?.passing || 0,
        dribbling: avgStatsArray[3] || playerStats?.dribbling || 0,
        defense: avgStatsArray[4] || playerStats?.defense || 0,
        physicality: avgStatsArray[5] || playerStats?.physicality || 0
      };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Player Image & Basic Info */}
          <Card className="p-6 lg:col-span-1">
            <div className="space-y-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-b from-primary/20 to-background">
                <img
                  src={imageUrl}
                  alt={playerName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{playerName.toUpperCase()}</h1>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  {player.height && <span>{player.height} cm</span>}
                  {player.weight && <span>{player.weight} kg</span>}
                  {player.foot && <span>Chân {player.foot === 1 ? "thuận" : "trái"}</span>}
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  {player.weakFoot && (
                    <div className="flex items-center gap-1">
                      <span>{player.weakFoot}</span>
                      <span className="text-accent">⭐</span>
                      <span className="text-xs text-muted-foreground">{player.skillMovesLevel || 5}</span>
                    </div>
                  )}
                  
                  {(player.nation as any)?.id && (
                    <div className="flex items-center gap-1">
                      <span className="text-2xl">{getCountryFlag(`${(player.nation as any).id}`)}</span>
                      <span className="text-sm">{(player.nation as any).name || (player.nation as any).label}</span>
                    </div>
                  )}
                  
                  {clubData && (
                    <div className="flex items-center gap-1">
                      {clubData.logoUrl && (
                        <img src={clubData.logoUrl} alt={clubData.name} className="w-6 h-6" />
                      )}
                      <span className="text-sm">{clubData.nameVi || clubData.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Rating */}
              <div className="text-center py-4 border-t border-b">
                <div className="text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                  {player.rating}
                </div>
                <div className="text-sm text-muted-foreground">OVR</div>
              </div>

              {/* Main Stats Overview */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(mainStats).map(([key, value]) => (
                  <div key={key} className="text-center p-2 bg-muted/50 rounded">
                    <div className="text-2xl font-bold text-primary">{value || 0}</div>
                    <div className="text-xs text-muted-foreground">{statLabels[key]}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Right: Detailed Stats */}
          <Card className="p-6 lg:col-span-2">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stats">Chi Số</TabsTrigger>
                <TabsTrigger value="info">Thông Tin</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-6 mt-6">
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
                          const value = playerStats?.[statKey as keyof PlayerStats];
                          return (
                            <div key={statKey} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <span className="text-sm text-muted-foreground">{statLabels[statKey]}</span>
                              <span className="font-semibold">{value || 0}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {isGK && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(mainStats).map(([key, value]) => (
                      <div key={key} className="p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">{statLabels[key]}</div>
                        <div className="text-3xl font-bold text-primary">{value || 0}</div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="info" className="space-y-4 mt-6">
                {/* Skills */}
                {player.skillMoves && Array.isArray((player as any).skillMoves) && (player as any).skillMoves.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Kỹ Năng</h3>
                    <div className="flex flex-wrap gap-2">
                      {((player as any).skillMoves || []).map((skill: any, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {skill.label || skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Traits */}
                {player.traits && Array.isArray((player as any).traits) && (player as any).traits.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Đặc Điểm</h3>
                    <div className="flex flex-wrap gap-2">
                      {((player as any).traits || []).map((trait: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {trait.label || trait.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Rates */}
                {(player as any).workRates && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Tốc Độ Làm Việc</h3>
                    <div className="flex gap-4">
                      {((player as any).workRates as any)?.attWorkRate && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Tấn công: </span>
                          <span className="font-semibold">{((player as any).workRates as any).attWorkRate}</span>
                        </div>
                      )}
                      {((player as any).workRates as any)?.defWorkRate && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phòng thủ: </span>
                          <span className="font-semibold">{((player as any).workRates as any).defWorkRate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Positions */}
                {player.potentialPositions && Array.isArray((player as any).potentialPositions) && (player as any).potentialPositions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Vị Trí</h3>
                    <div className="flex flex-wrap gap-2">
                      {((player as any).potentialPositions || []).map((pos: any, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {pos.label || pos}
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
    </div>
  );
}
