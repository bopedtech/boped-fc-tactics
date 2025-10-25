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

  // Get program/source info for background
  const programId = player.source;

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
    <Card
      className="card-hover overflow-hidden cursor-pointer relative group"
      onClick={onClick}
    >
      {/* FC24-Style Card Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 via-amber-500/10 to-orange-600/20 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent" />
      
      <div className="relative px-3 py-4">
        {/* Top Row: OVR, Position, Nation Flag */}
        <div className="flex items-start justify-between mb-2">
          {/* OVR and Position */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-amber-400 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {player.rating}
            </div>
            <div className="text-xs font-bold text-amber-300/90 mt-0.5">
              {player.position}
            </div>
          </div>

          {/* Nation Flag */}
          <div className="flex flex-col items-center gap-1">
            {flagImage && (
              <img 
                src={flagImage} 
                alt={nationName}
                className="w-8 h-6 object-cover rounded-sm shadow-lg border border-white/20"
              />
            )}
            {/* League Logo */}
            {leagueImage && (
              <img 
                src={leagueImage} 
                alt={leagueName}
                className="w-6 h-6 object-contain opacity-90"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {/* Club Logo */}
            {teamLogoUrl && (
              <img 
                src={teamLogoUrl} 
                alt={teamName}
                className="w-6 h-6 object-contain opacity-90"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        {/* Player Image - Larger and centered */}
        <div className="flex justify-center items-end h-36 -mt-2">
          {player.images?.playerCardImage ? (
            <img
              src={player.images.playerCardImage}
              alt={player.commonName}
              className="h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.commonName}&background=F59E0B&color=fff&size=160`;
              }}
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
              {player.commonName[0]}
            </div>
          )}
        </div>

        {/* Player Name */}
        <div className="text-center mt-2 mb-3">
          <h3 className="font-black text-base leading-tight truncate text-foreground drop-shadow-sm">
            {player.commonName}
          </h3>
        </div>

        {/* Stats Grid - 6 stats in 2 rows */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          {displayStats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-sm rounded py-1.5 border border-amber-500/20">
              <div className="text-lg font-bold text-amber-300 leading-none">
                {stat.value || 0}
              </div>
              <div className="text-[8px] font-semibold text-amber-200/70 uppercase tracking-wide mt-0.5">
                {stat.name}
              </div>
            </div>
          ))}
        </div>

        {/* Traits */}
        {player.traits && player.traits.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {player.traits.slice(0, 2).map((trait, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-[9px] px-1.5 py-0.5 bg-amber-900/30 text-amber-200 border-amber-500/30"
              >
                {trait.title || trait.name || 'Trait'}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-yellow-500/5 transition-all duration-300 pointer-events-none" />
    </Card>
  );
}
