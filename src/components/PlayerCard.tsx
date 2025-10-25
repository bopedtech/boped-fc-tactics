import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCountryFlag, getNationInfo, getTeamInfo } from "@/lib/countryUtils";

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
  cardName?: string;
  rating: number;
  position: string;
  nation?: any;
  club?: any;
  league?: any;
  images?: any;
  stats: PlayerStats;
  traits?: any[];
  source?: string;
}

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  teamsData?: Array<{ id: number; displayName: string; image?: string }>;
  nationsData?: Array<{ id: number; displayName: string; image?: string }>;
  leaguesData?: Array<{ id: number; displayName: string; image?: string }>;
}

export default function PlayerCard({ player, onClick, teamsData, nationsData, leaguesData }: PlayerCardProps) {
  const isGK = player.position === "GK";
  
  // Lấy thông tin team/club
  const teamInfo = player.club?.id ? getTeamInfo(player.club.id, teamsData) : null;
  const teamLogoUrl = teamInfo?.image || player.club?.image;
  const teamName = teamInfo?.displayName || player.club?.name;
  
  // Lấy thông tin league
  const leagueInfo = leaguesData?.find(l => l.id === player.league?.id);
  const leagueName = leagueInfo?.displayName || player.league?.name;
  const leagueImage = leagueInfo?.image || player.league?.image;
  
  // Lấy thông tin nation
  const nationInfo = player.nation?.id ? getNationInfo(player.nation.id, nationsData) : null;
  const nationName = nationInfo?.displayName || player.nation?.name;
  const flagImage = player.images?.flagImage;

  // Get card background from player images
  const cardBackground = player.images?.playerCardBackground;

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
    ? ["BẮT", "XỬ LÝ", "SÚT", "PHẢN XẠ", "TỐC ĐỘ", "VỊ TRÍ"]
    : ["TỐC ĐỘ", "SÚT", "CHUYỀN", "RÊ DẮT", "PHÒNG NGỰ", "THỂ LỰC"];
  
  const statsToShow = isGK ? avgGkStats : avgStats;

  const displayStats = statLabels.map((label, index) => ({
    name: label,
    value: statsToShow[index] || 0
  }));

  return (
    <div className="flex flex-col gap-3">
      {/* Card Container */}
      <Card
        className="card-hover overflow-hidden cursor-pointer relative group border-0 shadow-2xl aspect-[3/4.2]"
        onClick={onClick}
      >
        {/* Card Background Image */}
        {cardBackground ? (
          <>
            <img 
              src={cardBackground} 
              alt="Card background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300/20 via-transparent to-black/40" />
          </>
        )}
        
        <div className="relative h-full flex flex-col">
          {/* Top: OVR + Position - No background, white text, smaller */}
          <div className="absolute top-2 left-2 z-20">
            <div className="flex flex-col items-start">
              <div className="text-3xl font-black text-white leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,1)]">
                {player.rating}
              </div>
              <div className="text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] -mt-0.5">
                {player.position}
              </div>
            </div>
          </div>

          {/* Middle: Player Image - FULL SIZE from top to name */}
          <div className="absolute inset-x-0 top-0 bottom-16 flex items-stretch justify-center">
            {player.images?.playerCardImage ? (
              <img
                src={player.images.playerCardImage}
                alt={player.cardName || player.commonName}
                className="w-full h-full object-contain object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.commonName}&background=FFA500&color=fff&size=256`;
                }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl self-center">
                {player.commonName[0]}
              </div>
            )}
          </div>

          {/* Bottom Section: Name + Icons - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-3 px-3">
            {/* Player Name */}
            <div className="text-center mb-2">
              <h3 className="font-black text-base leading-none text-white drop-shadow-[0_3px_6px_rgba(0,0,0,1)] uppercase tracking-wider">
                {player.cardName || player.commonName}
              </h3>
            </div>

            {/* Nation, League, Club Icons */}
            <div className="flex justify-center items-center gap-2">
              {flagImage && (
                <div className="w-9 h-7 rounded overflow-hidden shadow-lg">
                  <img 
                    src={flagImage} 
                    alt={nationName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {leagueImage && (
                <div className="w-7 h-7 rounded-full bg-white/95 p-1 shadow-lg border border-white/40 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={leagueImage} 
                    alt={leagueName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {teamLogoUrl && (
                <div className="w-7 h-7 rounded-full bg-white/95 p-1 shadow-lg border border-white/40 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={teamLogoUrl} 
                    alt={teamName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/20 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-lg" />
      </Card>

      {/* Stats Section - Below Card */}
      <div className="grid grid-cols-3 gap-1.5">
        {displayStats.slice(0, 6).map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-gradient-to-br from-card to-card/60 backdrop-blur-sm rounded-lg p-2.5 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl font-black text-primary leading-none mb-1">
                {stat.value || 0}
              </div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide leading-tight">
                {stat.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Traits - Below Stats */}
      {player.traits && player.traits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {player.traits.slice(0, 2).map((trait, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="text-[10px] px-2.5 py-0.5 font-semibold border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {trait.title || trait.name || 'Trait'}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
