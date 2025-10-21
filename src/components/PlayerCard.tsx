import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCountryFlag, getCountryNameVi, getClubInfo, getNationCode } from "@/lib/countryUtils";

interface PlayerStats {
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defense?: number;
  physicality?: number;
  // GK stats
  diving?: number;
  handling?: number;
  kicking?: number;
  reflexes?: number;
  speed?: number;
  positioning?: number;
}

interface Player {
  assetId: number;
  commonName: string;
  rating: number;
  position: string;
  nation?: any;
  club?: any;
  league?: any;
  images?: any;
  stats: PlayerStats;
  traits?: any[];
}

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  clubsData?: Array<{ clubId: number; nameVi: string; logoUrl: string }>;
  countriesData?: Array<{ countryCode: string; nameVi: string; nameEn: string }>;
  leaguesData?: Array<{ id: number; name: string; image?: string }>;
}

export default function PlayerCard({ player, onClick, clubsData, countriesData, leaguesData }: PlayerCardProps) {
  const isGK = player.position === "GK";
  
  // Lấy thông tin club
  const clubInfo = player.club?.id ? getClubInfo(player.club.id, clubsData) : null;
  const clubLogoUrl = clubInfo?.logoUrl;
  const clubName = clubInfo?.nameVi || player.club?.name;
  
  // Lấy thông tin league
  const leagueInfo = leaguesData?.find(l => l.id === player.league?.id);
  const leagueName = leagueInfo?.name || player.league?.name;
  const leagueImage = leagueInfo?.image || player.league?.image;
  
  // Lấy flag và tên từ player data
  const flagImage = player.images?.flagImage;
  const countryNameVi = player.nation?.name;

  // Get avgStats object (avg1-avg6 for stats)
  const avgStatsObj = (player as any).avgStats || {};
  const avgGkStatsObj = (player as any).avgGkStats || {};
  
  // Convert object to array [avg1, avg2, avg3, avg4, avg5, avg6]
  const avgStats = [
    avgStatsObj.avg1 || 0,
    avgStatsObj.avg2 || 0,
    avgStatsObj.avg3 || 0,
    avgStatsObj.avg4 || 0,
    avgStatsObj.avg5 || 0,
    avgStatsObj.avg6 || 0
  ];
  
  const avgGkStats = [
    avgGkStatsObj.avg1 || 0,
    avgGkStatsObj.avg2 || 0,
    avgGkStatsObj.avg3 || 0,
    avgGkStatsObj.avg4 || 0,
    avgGkStatsObj.avg5 || 0,
    avgGkStatsObj.avg6 || 0
  ];
  
  // Map avgStats to Vietnamese stat labels
  const statLabels = isGK 
    ? ["Bắt Bóng", "Xử Lý", "Sút", "Phản Xạ", "Tốc Độ", "Vị Trí"]
    : ["Tốc Độ", "Sút", "Chuyền", "Rê Dắt", "Phòng Ngự", "Thể Lực"];
  
  const statsToShow = isGK ? avgGkStats : avgStats;

  const statColors: Record<string, string> = {
    pace: "text-stat-pace",
    shooting: "text-stat-shooting",
    passing: "text-stat-passing",
    dribbling: "text-stat-dribbling",
    defense: "text-stat-defense",
    physicality: "text-stat-physical",
    diving: "text-stat-pace",
    handling: "text-stat-shooting",
    kicking: "text-stat-passing",
    reflexes: "text-stat-dribbling",
    speed: "text-stat-defense",
    positioning: "text-stat-physical",
  };

  const displayStats = statLabels.map((label, index) => ({
    name: label,
    value: statsToShow[index] || 0
  }));

  return (
    <Card
      className="card-hover overflow-hidden cursor-pointer bg-card border-border/50"
      onClick={onClick}
    >
      <div className="relative p-4">
        {/* OVR and Position */}
        <div className="absolute top-2 left-2 z-10">
          <div className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            {player.rating}
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            {player.position}
          </div>
        </div>

        {/* Player Image */}
        <div className="flex justify-center items-center h-32 mt-4">
          {player.images?.playerCardImage ? (
            <img
              src={player.images.playerCardImage}
              alt={player.commonName}
              className="h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.commonName}&background=38B2AC&color=fff&size=128`;
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-white">
              {player.commonName[0]}
            </div>
          )}
        </div>

        {/* Player Name */}
        <h3 className="text-center font-bold text-lg mt-2 truncate">
          {player.commonName}
        </h3>

        {/* Club, League and Nation */}
        <div className="flex justify-center gap-3 mt-2 text-xs items-center flex-wrap">
          {/* Club */}
          {clubName && (
            <div className="flex items-center gap-1.5">
              {clubLogoUrl && (
                <img 
                  src={clubLogoUrl} 
                  alt={clubName}
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-muted-foreground">{clubName}</span>
            </div>
          )}
          
          {/* League */}
          {leagueName && (
            <div className="flex items-center gap-1.5">
              {leagueImage && (
                <img 
                  src={leagueImage} 
                  alt={leagueName}
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-muted-foreground text-[10px]">{leagueName}</span>
            </div>
          )}
          
          {/* Nation */}
          {countryNameVi && (
            <div className="flex items-center gap-1.5">
              {flagImage && (
                <img 
                  src={flagImage} 
                  alt={countryNameVi}
                  className="w-5 h-4 object-cover rounded-sm"
                />
              )}
              <span className="text-muted-foreground">{countryNameVi}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 mt-4">
          {displayStats.map((stat, idx) => (
            <div key={idx} className="text-center bg-muted/30 rounded p-1.5">
              <div className="text-sm font-bold text-primary">
                {stat.value || 0}
              </div>
              <div className="text-[9px] text-muted-foreground leading-tight">{stat.name}</div>
            </div>
          ))}
        </div>

        {/* Traits */}
        {player.traits && player.traits.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1 justify-center">
            {player.traits.slice(0, 2).map((trait, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs"
              >
                {trait.title || trait.name || 'Trait'}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
