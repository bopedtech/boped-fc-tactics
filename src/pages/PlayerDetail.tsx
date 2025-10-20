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
  added?: string;
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
  diving: "Bắt Bóng",
  handling: "Xử Lý",
  kicking: "Sút",
  reflexes: "Phản Xạ",
  speed: "Tốc Độ",
  positioning: "Vị Trí",
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

export default function PlayerDetail() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [clubData, setClubData] = useState<any>(null);
  const [countryCode, setCountryCode] = useState<string>("");

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

      // Fetch country code if nation exists
      if (data?.nation && typeof data.nation === 'object' && 'name' in data.nation) {
        const nationName = (data.nation as any).name || (data.nation as any).label;
        if (nationName) {
          const { data: countries } = await supabase
            .from("countries_vi")
            .select("countryCode, nameEn")
            .ilike("nameEn", nationName)
            .limit(1)
            .single();
          
          if (countries?.countryCode) {
            setCountryCode(countries.countryCode);
          }
        }
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
  const imageUrl = (player.images as any)?.playerCardImage || (player.images as any)?.portrait || (player.images as any)?.card || "/placeholder.svg";
  const isGK = player.position === "GK";
  
  // Get avgStats from database (object with avg1-avg6 keys)
  const avgStatsObj = (player.avgStats as any) || {};
  const avgGkStatsObj = (player.avgGkStats as any) || {};
  const playerStats = (player.stats as any) || {};
  
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
        handling: avgGkStatsArray[1] || 0,
        kicking: avgGkStatsArray[2] || 0,
        reflexes: avgGkStatsArray[3] || 0,
        speed: avgGkStatsArray[4] || 0,
        positioning: avgGkStatsArray[5] || 0
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
                </div>
                
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {/* Weak Foot & Skill Moves */}
                  {(player.weakFoot || player.skillMovesLevel) && (
                    <div className="flex items-center gap-2">
                      {/* Strong Foot Icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
                        <path d="M10 3C10 3 9 4 9 6C9 8 10 9 10 9M14 3C14 3 15 4 15 6C15 8 14 9 14 9M12 3V9M8 9C8 9 7 10 7 12C7 14 8 15 8 15M16 9C16 9 17 10 17 12C17 14 16 15 16 15M12 9V15M6 15C6 15 5 16 5 18C5 20 6 21 6 21M18 15C18 15 19 16 19 18C19 20 18 21 18 21M12 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      {/* Weak Foot Stars */}
                      {player.weakFoot && (
                        <div className="flex items-center gap-0.5">
                          <span className="font-semibold text-primary">{player.weakFoot}</span>
                          {[...Array(player.weakFoot)].map((_, i) => (
                            <span key={i} className="text-primary text-sm">★</span>
                          ))}
                        </div>
                      )}
                      {/* Weak Foot Icon (grey) */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                        <path d="M10 3C10 3 9 4 9 6C9 8 10 9 10 9M14 3C14 3 15 4 15 6C15 8 14 9 14 9M12 3V9M8 9C8 9 7 10 7 12C7 14 8 15 8 15M16 9C16 9 17 10 17 12C17 14 16 15 16 15M12 9V15M6 15C6 15 5 16 5 18C5 20 6 21 6 21M18 15C18 15 19 16 19 18C19 20 18 21 18 21M12 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      {/* Skill Moves Stars */}
                      {player.skillMovesLevel && (
                        <div className="flex items-center gap-0.5">
                          <span className="font-semibold text-primary">{player.skillMovesLevel}</span>
                          {[...Array(player.skillMovesLevel)].map((_, i) => (
                            <span key={i} className="text-primary text-sm">★</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {countryCode && (
                    <div className="flex items-center gap-1">
                      <span className="text-2xl">{getCountryFlag(countryCode)}</span>
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

              <TabsContent value="info" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team */}
                  {clubData && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">Đội Bóng</h3>
                      <div className="flex items-center gap-2">
                        {clubData.logoUrl && (
                          <img src={clubData.logoUrl} alt={clubData.name} className="w-8 h-8" />
                        )}
                        <span className="font-medium">{clubData.nameVi || clubData.name}</span>
                      </div>
                    </div>
                  )}

                  {/* League */}
                  {player.league && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">Giải Đấu</h3>
                      <div className="flex items-center gap-2">
                        {(player.images as any)?.leagueImage && (
                          <img src={(player.images as any).leagueImage} alt="League" className="w-8 h-8" />
                        )}
                        <span className="font-medium">{(player.league as any).name}</span>
                      </div>
                    </div>
                  )}

                  {/* Nation */}
                  {player.nation && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">Quốc Tịch</h3>
                      <div className="flex items-center gap-2">
                        {countryCode && (
                          <span className="text-2xl">{getCountryFlag(countryCode)}</span>
                        )}
                        <span className="font-medium">{(player.nation as any).name || (player.nation as any).label}</span>
                      </div>
                    </div>
                  )}


                  {/* Added Date */}
                  {player.added && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">Ngày Thêm</h3>
                      <div className="font-medium">
                        {new Date(player.added).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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
    </div>
  );
}
