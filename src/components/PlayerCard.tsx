import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  variant?: 'list' | 'detail';
}

export default function PlayerCard({ player, onClick, variant = 'list' }: PlayerCardProps) {
  const isGK = player.position === "GK";
  
  // Lấy tất cả từ player.images
  const flagImage = player.images?.flagImage;
  const leagueImage = player.images?.leagueImage;
  const teamLogoUrl = player.images?.clubImage;
  
  // Check if this is an icon card - hide club if league name is leaguename_2118 (case-insensitive)
  const shouldHideClub = player.league?.name?.toLowerCase() === 'leaguename_2118';

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
    : ["TỐC ĐỘ", "SÚT", "CHUYỀN", "RÊ DẮT", "THỦ", "THỂ LỰC"];
  
  const statsToShow = isGK ? avgGkStats : avgStats;

  const displayStats = statLabels.map((label, index) => ({
    name: label,
    value: statsToShow[index] || 0
  }));

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="flex flex-col gap-3">
        {/* Card Container */}
        <Card
          className="overflow-hidden relative border-0 aspect-[3/4.2] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] group-hover:scale-[1.02]"
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
          {/* Top: OVR + Position - Moved right and down a bit */}
          <div className="absolute top-8 left-8 z-20">
            <div className="flex flex-col items-start">
              <div className="text-4xl font-black text-white leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,1)]">
                {player.rating}
              </div>
              <div className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mt-0.5 ml-0.5">
                {player.position}
              </div>
            </div>
          </div>

          {/* Middle: Player Image - FULL CARD SIZE */}
          <div className="absolute inset-0 flex items-center justify-center">
            {player.images?.playerCardImage ? (
              <img
                src={player.images.playerCardImage}
                alt={player.cardName || player.commonName}
                className="w-full h-full object-cover object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.commonName}&background=FFA500&color=fff&size=256`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
                {player.commonName[0]}
              </div>
            )}
          </div>

          {/* Bottom Section: Name + Icons - Close to player image */}
          <div className={`absolute left-0 right-0 z-10 px-3 ${variant === 'detail' ? 'bottom-8' : 'bottom-12'}`}>
            {/* Player Name */}
            <div className="text-center mb-2 mt-8">
              <h3 className="font-black text-xl leading-none text-white drop-shadow-[0_3px_6px_rgba(0,0,0,1)] uppercase tracking-wider">
                {player.cardName || player.commonName}
              </h3>
            </div>

            {/* Nation, League, Club Icons - Spread across card or centered */}
            {(() => {
              const visibleIcons = [
                flagImage,
                leagueImage,
                !shouldHideClub && teamLogoUrl
              ].filter(Boolean).length;
              
              const layoutClass = visibleIcons === 3 ? "justify-between" : "justify-center gap-6";
              
              return (
                <div className={`flex ${layoutClass} items-center px-4`}>
                  {flagImage && (
                    <div className="w-12 h-9 rounded overflow-hidden shadow-lg">
                      <img 
                        src={flagImage} 
                        alt="Nation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {leagueImage && (
                    <div className="w-10 h-10 rounded-full p-1 shadow-lg">
                      <img 
                        src={leagueImage} 
                        alt="League"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Only show club for non-icon cards */}
                  {!shouldHideClub && teamLogoUrl && (
                    <div className="w-10 h-10 rounded-full p-1 shadow-lg">
                      <img 
                        src={teamLogoUrl} 
                        alt="Club"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </Card>

      {/* Stats Section - Below Card */}
      <div className="grid grid-cols-3 gap-1.5">
        {displayStats.slice(0, 6).map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-gradient-to-br from-card to-card/60 backdrop-blur-sm rounded-lg p-2.5 border border-border/50 shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:bg-primary/5"
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

      </div>
    </div>
  );
}
