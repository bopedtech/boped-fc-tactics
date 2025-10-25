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
  programsData?: Array<{ id: string; displayName: string; image?: string }>;
}

export default function PlayerCard({ player, onClick, teamsData, nationsData, leaguesData, programsData }: PlayerCardProps) {
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
  const programInfo = programsData?.find(p => p.id === programId);
  const programImage = programInfo?.image;

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
      className="card-hover overflow-hidden cursor-pointer relative group border-0 shadow-xl aspect-[3/4]"
      onClick={onClick}
    >
      {/* Program Background Image */}
      {programImage ? (
        <>
          <img 
            src={programImage} 
            alt="Program background"
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
        {/* Top: OVR + Position at top-left */}
        <div className="absolute top-3 left-3 z-20">
          <div className="flex flex-col items-start">
            <div className="text-5xl font-black text-white leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,1)] tracking-tight">
              {player.rating}
            </div>
            <div className="text-sm font-black text-white -mt-1 drop-shadow-[0_3px_6px_rgba(0,0,0,1)]">
              {player.position}
            </div>
          </div>
        </div>

        {/* Middle: Player Image - takes most space */}
        <div className="flex-1 flex justify-center items-center pt-12 pb-4">
          {player.images?.playerCardImage ? (
            <img
              src={player.images.playerCardImage}
              alt={player.commonName}
              className="h-full max-h-48 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-10"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.commonName}&background=FFA500&color=fff&size=200`;
              }}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl relative z-10">
              {player.commonName[0]}
            </div>
          )}
        </div>

        {/* Bottom Section: Name + Icons */}
        <div className="relative z-10 px-3 pb-4">
          {/* Player Name */}
          <div className="text-center mb-3">
            <h3 className="font-black text-lg leading-tight text-white drop-shadow-[0_3px_6px_rgba(0,0,0,1)] uppercase tracking-wide">
              {player.commonName}
            </h3>
          </div>

          {/* Nation, League, Club Icons - horizontal row */}
          <div className="flex justify-center items-center gap-3">
            {/* Nation Flag */}
            {flagImage && (
              <div className="w-10 h-8 rounded overflow-hidden shadow-lg border-2 border-white/40 bg-white/10">
                <img 
                  src={flagImage} 
                  alt={nationName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* League Logo */}
            {leagueImage && (
              <div className="w-8 h-8 rounded-full bg-white/95 p-1.5 shadow-lg border-2 border-white/60 flex items-center justify-center">
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
            
            {/* Club Logo */}
            {teamLogoUrl && (
              <div className="w-8 h-8 rounded-full bg-white/95 p-1.5 shadow-lg border-2 border-white/60 flex items-center justify-center">
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
  );
}
