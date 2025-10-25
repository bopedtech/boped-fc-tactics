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
      className="card-hover overflow-hidden cursor-pointer relative group border-0 shadow-lg"
      onClick={onClick}
    >
      {/* FC Mobile Style Background - gradient based on rating/program */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300/20 via-transparent to-black/40" />
      
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
      }} />
      
      <div className="relative h-full flex flex-col">
        {/* Top Section: OVR + Position | Flags */}
        <div className="flex justify-between items-start p-3 pb-0">
          {/* Left: OVR and Position */}
          <div className="flex flex-col items-start -mt-1">
            <div className="text-5xl font-black text-white leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] tracking-tight">
              {player.rating}
            </div>
            <div className="text-sm font-black text-white/95 -mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {player.position}
            </div>
          </div>

          {/* Right: Nation, League, Club - stacked vertically */}
          <div className="flex flex-col items-end gap-1.5">
            {/* Nation Flag */}
            {flagImage && (
              <div className="w-9 h-7 rounded-sm overflow-hidden shadow-md border border-white/30 bg-white/10">
                <img 
                  src={flagImage} 
                  alt={nationName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* League Logo */}
            {leagueImage && (
              <div className="w-7 h-7 rounded-full bg-white/90 p-1 shadow-md flex items-center justify-center">
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
              <div className="w-7 h-7 rounded-full bg-white/90 p-1 shadow-md flex items-center justify-center">
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

        {/* Middle: Player Image */}
        <div className="flex-1 flex justify-center items-center px-2 -mt-2">
          {player.images?.playerCardImage ? (
            <img
              src={player.images.playerCardImage}
              alt={player.commonName}
              className="h-40 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.commonName}&background=FFA500&color=fff&size=200`;
              }}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
              {player.commonName[0]}
            </div>
          )}
        </div>

        {/* Player Name */}
        <div className="text-center px-3 -mt-2 mb-2">
          <h3 className="font-black text-base leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wide">
            {player.commonName}
          </h3>
        </div>

        {/* Bottom: Stats - 6 stats in one row */}
        <div className="px-3 pb-3">
          <div className="grid grid-cols-6 gap-1">
            {displayStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center bg-black/40 backdrop-blur-sm rounded py-1 border border-white/10">
                <div className="text-base font-black text-white leading-none">
                  {stat.value || 0}
                </div>
                <div className="text-[7px] font-bold text-white/80 uppercase tracking-wider mt-0.5">
                  {stat.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* Traits below stats */}
          {player.traits && player.traits.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {player.traits.slice(0, 2).map((trait, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[8px] px-1.5 py-0 bg-black/50 text-white border-white/20 font-bold"
                >
                  {trait.title || trait.name || 'Trait'}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/20 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-lg" />
    </Card>
  );
}
