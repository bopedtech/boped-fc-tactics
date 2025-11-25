import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { TEXT } from "@/constants/text";

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
  spa?: number;
  sho?: number;
  pas?: number;
  dri?: number;
  def?: number;
  phy?: number;
  gkd?: number;
  han?: number;
  kic?: number;
  ref?: number;
  spd?: number;
  pos?: number;
}

interface Player {
  assetId: number;
  commonName: string;
  cardName?: string;
  firstName?: string;
  lastName?: string;
  rating: number;
  position: string;
  nation?: any;
  club?: any;
  league?: any;
  images?: any;
  stats: PlayerStats;
  traits?: any[];
  source?: string;
  auctionable?: boolean;
  avgStats?: any;
  avgGkStats?: any;
  rank?: number;
  training?: number;
}

type PlayerCardVariant = "small" | "medium" | "large";

interface PlayerCardProps {
  player?: Player | null;
  position?: string;
  variant?: PlayerCardVariant;
  onClick?: () => void;
  onRemove?: () => void;
  showStats?: boolean;
  displayOvr?: number;
  showPenalty?: boolean;
  ovrPenalty?: number;
  isSelected?: boolean;
}

const getRankColor = (rank?: number) => {
  switch (rank) {
    case 1: return "from-green-600/30 via-green-500/20 to-green-600/30 border-green-500/60";
    case 2: return "from-blue-600/30 via-blue-500/20 to-blue-600/30 border-blue-500/60";
    case 3: return "from-purple-600/30 via-purple-500/20 to-purple-600/30 border-purple-500/60";
    case 4: return "from-red-600/30 via-red-500/20 to-red-600/30 border-red-500/60";
    case 5: return "from-orange-600/30 via-orange-500/20 to-orange-600/30 border-orange-500/60";
    default: return "from-yellow-600/30 via-yellow-500/20 to-yellow-600/30 border-yellow-600/60";
  }
};

export default function PlayerCard({
  player,
  position,
  variant = "large",
  onClick,
  onRemove,
  showStats = true,
  displayOvr,
  showPenalty = false,
  ovrPenalty = 0,
  isSelected = false,
}: PlayerCardProps) {
  // Empty slot for small variant
  if (!player && variant === "small") {
    return (
      <div
        onClick={onClick}
        className="w-24 h-32 bg-card/30 backdrop-blur-sm border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-card/50 transition-all group"
      >
        <Plus className="w-8 h-8 text-muted-foreground/50 group-hover:text-primary/70 transition-colors mb-1" />
        <span className="text-xs text-muted-foreground/70 group-hover:text-primary/70 transition-colors font-semibold">
          {position}
        </span>
      </div>
    );
  }

  if (!player) return null;

  const isGK = player.position === "GK";
  const finalOvr = displayOvr ?? player.rating;
  const rankColorClass = getRankColor(player.rank);

  // Get images
  const flagImage = player.images?.flagImage || player.nation?.image;
  const leagueImage = player.images?.leagueImage;
  const teamLogoUrl = player.images?.clubImage || player.club?.image;
  const cardBackground = player.images?.playerCardBackground;
  const playerImage = player.images?.playerCardImage;

  // Check if this is an icon card
  const shouldHideClub = player.league?.name?.toLowerCase() === 'leaguename_2118';

  // Get stats
  const avgStatsObj = player.avgStats || {};
  const avgGkStatsObj = player.avgGkStats || {};
  
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
    avgGkStatsObj.avg6 || 0,
    avgGkStatsObj.avg2 || 0,
    avgGkStatsObj.avg4 || 0,
    avgGkStatsObj.avg3 || 0,
    avgGkStatsObj.avg5 || 0
  ];

  const statLabels = isGK 
    ? [
        TEXT.STATS.DIVING,
        TEXT.STATS.POSITIONING,
        TEXT.STATS.HANDLING,
        TEXT.STATS.REFLEXES,
        TEXT.STATS.KICKING,
        TEXT.STATS.PHYSICALITY
      ]
    : [
        TEXT.STATS.PACE,
        TEXT.STATS.SHOOTING,
        TEXT.STATS.PASSING,
        TEXT.STATS.DRIBBLING,
        TEXT.STATS.DEFENSE,
        TEXT.STATS.PHYSICALITY
      ];
  
  const statsToShow = isGK ? avgGkStats : avgStats;
  const displayStats = statLabels.map((label, index) => ({
    name: label,
    value: statsToShow[index] || 0
  }));

  // Small variant for squad builder
  if (variant === "small") {
    return (
      <div className="relative group">
        <Card className={`w-24 h-32 bg-gradient-to-br ${rankColorClass} border-2 cursor-pointer hover:scale-105 transition-all hover:shadow-lg overflow-hidden`}>
          {/* Card Background */}
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
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 opacity-80" />
          )}
          
          <div className="relative h-full flex flex-col">
            {/* Player Image */}
            {playerImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={playerImage}
                  alt={player.commonName}
                  className="w-full h-full object-cover object-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                />
              </div>
            )}

            {/* OVR and Position - Top Left */}
            <div className="absolute top-2 left-2 z-20">
              <div className="flex flex-col items-start">
                <div className="text-xl font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                  {finalOvr}
                </div>
                <div className="text-[10px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mt-0.5">
                  {player.position}
                </div>
              </div>
            </div>

            {/* Player Name - Bottom */}
            <div className="absolute bottom-8 left-0 right-0 px-1 z-10">
              <div className="text-center">
                <div className="text-[10px] font-black text-white line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wide">
                  {player.commonName}
                </div>
              </div>
            </div>

            {/* Nation and Club Icons - Bottom */}
            <div className="absolute bottom-1 left-0 right-0 px-2 z-10">
              <div className="flex items-center justify-center gap-2">
                {flagImage && (
                  <div className="w-5 h-4 rounded overflow-hidden shadow-lg">
                    <img 
                      src={flagImage} 
                      alt={TEXT.NATION}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {teamLogoUrl && (
                  <div className="w-4 h-4 rounded-full overflow-hidden shadow-lg">
                    <img 
                      src={teamLogoUrl} 
                      alt={TEXT.CLUB}
                      className="w-full h-full object-contain bg-white/80"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        {onRemove && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Large variant for database and index pages
  if (variant === "large") {
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
              {/* Untradeable Icon - Top Right */}
              {player.auctionable === false && (
                <div className="absolute top-4 right-4 z-20">
                  <img 
                    src="https://images-bucket.renderz.app/common_23_untradeable_icon" 
                    alt="Untradeable"
                    className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  />
                </div>
              )}

              {/* Top: OVR + Position */}
              <div className="absolute top-8 left-8 z-20">
                <div className="flex flex-col items-start">
                  <div className="text-4xl font-black text-white leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,1)]">
                    {finalOvr}
                  </div>
                  <div className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mt-0.5 ml-0.5">
                    {player.position}
                  </div>
                </div>
              </div>

              {/* Middle: Player Image - FULL CARD SIZE */}
              <div className="absolute inset-0 flex items-center justify-center">
                {playerImage ? (
                  <img
                    src={playerImage}
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

              {/* Bottom Section: Name + Icons */}
              <div className="absolute left-0 right-0 z-10 px-3 bottom-[56px]">
                {/* Player Name */}
                <div className="text-center mb-2">
                  <h3 className="font-black text-xl leading-none text-white drop-shadow-[0_3px_6px_rgba(0,0,0,1)] uppercase tracking-wider">
                    {player.cardName || player.commonName}
                  </h3>
                </div>

                {/* Nation, League, Club Icons */}
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
                            alt={TEXT.NATION}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {leagueImage && (
                        <div className="w-10 h-10 rounded-full p-1 shadow-lg">
                          <img 
                            src={leagueImage} 
                            alt={TEXT.LEAGUE}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {!shouldHideClub && teamLogoUrl && (
                        <div className="w-10 h-10 rounded-full p-1 shadow-lg">
                          <img 
                            src={teamLogoUrl} 
                            alt={TEXT.CLUB}
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
          {showStats && (
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
          )}
        </div>
      </div>
    );
  }

  // Medium variant for selection dialog and search results
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <Card
        className="overflow-hidden relative border-0 aspect-[3/4.2] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] group-hover:scale-[1.02]"
      >
        {/* Card Background */}
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
          {/* OVR + Position */}
          <div className="absolute top-6 left-6 z-20">
            <div className="flex flex-col items-start">
              <div className="text-3xl font-black text-white leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,1)]">
                {finalOvr}
                {showPenalty && ovrPenalty > 0 && (
                  <span className="text-sm text-red-400 ml-1">-{ovrPenalty}</span>
                )}
              </div>
              <div className="text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mt-0.5">
                {player.position}
              </div>
            </div>
          </div>

          {/* Player Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            {playerImage ? (
              <img
                src={playerImage}
                alt={player.cardName || player.commonName}
                className="w-full h-full object-cover object-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.commonName}&background=FFA500&color=fff&size=256`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                {player.commonName[0]}
              </div>
            )}
          </div>

          {/* Bottom: Name + Icons */}
          <div className="absolute left-0 right-0 z-10 px-2 bottom-[40px]">
            <div className="text-center mb-1.5">
              <h3 className="font-black text-base leading-none text-white drop-shadow-[0_3px_6px_rgba(0,0,0,1)] uppercase tracking-wide">
                {player.cardName || player.commonName}
              </h3>
            </div>

            <div className="flex justify-center items-center gap-3 px-2">
              {flagImage && (
                <div className="w-10 h-7 rounded overflow-hidden shadow-lg">
                  <img 
                    src={flagImage} 
                    alt={TEXT.NATION}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {leagueImage && (
                <div className="w-8 h-8 rounded-full p-0.5 shadow-lg bg-white/10">
                  <img 
                    src={leagueImage} 
                    alt={TEXT.LEAGUE}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {!shouldHideClub && teamLogoUrl && (
                <div className="w-8 h-8 rounded-full p-0.5 shadow-lg bg-white/10">
                  <img 
                    src={teamLogoUrl} 
                    alt={TEXT.CLUB}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
