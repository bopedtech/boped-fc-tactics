import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Player {
  assetId: number;
  commonName: string;
  rating: number;
  position: string;
  nation?: any;
  club?: any;
  images?: any;
  stats: any;
  rank?: number;
  training?: number;
}

interface PlayerCardSlotProps {
  player: Player | null;
  position: string;
  onClick: () => void;
  onRemove?: () => void;
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

export default function PlayerCardSlot({ player, position, onClick, onRemove }: PlayerCardSlotProps) {
  if (!player) {
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

  const rankColorClass = getRankColor(player.rank);

  return (
    <div className="relative group">
      <Card className={`w-24 h-32 bg-gradient-to-br ${rankColorClass} border-2 cursor-pointer hover:scale-105 transition-all hover:shadow-lg overflow-hidden`}>
        {/* Card Background or Player Image */}
        {player.images?.playerCardBackground ? (
          <>
            <img 
              src={player.images.playerCardBackground} 
              alt="Card background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 opacity-80" />
        )}
        
        <div className="relative h-full flex flex-col">
          {/* Player Image - Full Coverage */}
          {player.images?.playerCardImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={player.images.playerCardImage}
                alt={player.commonName}
                className="w-full h-full object-cover object-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
              />
            </div>
          )}

          {/* OVR and Position - Top Left (matching PlayerCard) */}
          <div className="absolute top-2 left-2 z-20">
            <div className="flex flex-col items-start">
              <div className="text-xl font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                {player.rating}
              </div>
              <div className="text-[10px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mt-0.5">
                {player.position}
              </div>
            </div>
          </div>

          {/* Player Name - Bottom (matching PlayerCard) */}
          <div className="absolute bottom-8 left-0 right-0 px-1 z-10">
            <div className="text-center">
              <div className="text-[10px] font-black text-white line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wide">
                {player.commonName}
              </div>
            </div>
          </div>

          {/* Nation and Club Icons - Bottom (matching PlayerCard) */}
          <div className="absolute bottom-1 left-0 right-0 px-2 z-10">
            <div className="flex items-center justify-center gap-2">
              {player.nation?.image && (
                <div className="w-5 h-4 rounded overflow-hidden shadow-lg">
                  <img 
                    src={player.nation.image} 
                    alt="Nation"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {player.club?.image && (
                <div className="w-4 h-4 rounded-full overflow-hidden shadow-lg">
                  <img 
                    src={player.club.image} 
                    alt="Club"
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
