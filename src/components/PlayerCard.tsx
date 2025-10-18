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
  id: number;
  common_name: string;
  rating: number;
  position: string;
  nation?: any;
  club?: any;
  images?: any;
  stats: PlayerStats;
  traits?: any[];
}

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  clubsData?: Array<{ club_id: number; name_vi: string; logo_url: string }>;
  countriesData?: Array<{ country_code: string; name_vi: string }>;
}

export default function PlayerCard({ player, onClick, clubsData, countriesData }: PlayerCardProps) {
  const isGK = player.position === "GK";
  
  // Lấy thông tin club
  const clubInfo = player.club?.id ? getClubInfo(player.club.id, clubsData) : null;
  const clubLogoUrl = clubInfo?.logoUrl;
  const clubName = clubInfo?.nameVi || player.club?.name;
  
  // Lấy mã quốc gia và tên tiếng Việt
  const nationCode = player.nation?.name ? getNationCode(player.nation.name) : '';
  
  // Debug: log để kiểm tra
  if (player.nation?.name && !nationCode) {
    console.log('Missing nation mapping:', player.nation.name);
  }
  
  const countryNameVi = nationCode 
    ? getCountryNameVi(nationCode, countriesData) || player.nation?.name
    : player.nation?.name;
  
  const flagEmoji = nationCode ? getCountryFlag(nationCode) : '';
  
  // Debug: log để kiểm tra flag
  if (nationCode && !flagEmoji) {
    console.log('Flag not found for code:', nationCode);
  }

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

  const displayStats = isGK
    ? [
        { name: "DIV", value: player.stats.diving },
        { name: "HAN", value: player.stats.handling },
        { name: "KIC", value: player.stats.kicking },
        { name: "REF", value: player.stats.reflexes },
        { name: "SPD", value: player.stats.speed },
        { name: "POS", value: player.stats.positioning },
      ]
    : [
        { name: "PAC", value: player.stats.pace },
        { name: "SHO", value: player.stats.shooting },
        { name: "PAS", value: player.stats.passing },
        { name: "DRI", value: player.stats.dribbling },
        { name: "DEF", value: player.stats.defense },
        { name: "PHY", value: player.stats.physicality },
      ];

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
              alt={player.common_name}
              className="h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.common_name}&background=38B2AC&color=fff&size=128`;
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-white">
              {player.common_name[0]}
            </div>
          )}
        </div>

        {/* Player Name */}
        <h3 className="text-center font-bold text-lg mt-2 truncate">
          {player.common_name}
        </h3>

        {/* Club and Nation */}
        <div className="flex justify-center gap-3 mt-2 text-xs items-center">
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
          
          {/* Nation */}
          {countryNameVi && (
            <div className="flex items-center gap-1.5">
              {flagEmoji && <span className="text-base leading-none">{flagEmoji}</span>}
              <span className="text-muted-foreground">{countryNameVi}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {displayStats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className={`text-sm font-bold ${statColors[stat.name.toLowerCase()]}`}>
                {stat.value || 0}
              </div>
              <div className="text-xs text-muted-foreground">{stat.name}</div>
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
