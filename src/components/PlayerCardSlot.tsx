import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Player {
  id: number;
  common_name: string;
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
        {/* Player Image Background */}
        {player.images?.playerCardImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${player.images.playerCardImage})` }}
          />
        )}
        
        <div className="relative h-full p-2 flex flex-col">
          {/* OVR and Position - Top Left */}
          <div className="absolute top-1 left-1">
            <div className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {player.rating}
            </div>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-black/60 text-white border-none">
              {player.position}
            </Badge>
          </div>

          {/* Player Name - Bottom */}
          <div className="absolute bottom-1 left-0 right-0 px-1">
            <div className="text-center bg-black/60 rounded px-1 py-0.5">
              <div className="text-[10px] font-bold text-white line-clamp-1 drop-shadow">
                {player.common_name.toUpperCase()}
              </div>
              {/* Nation and Club */}
              <div className="flex items-center justify-center gap-1 mt-0.5">
                {player.nation?.name && (
                  <span className="text-[8px] text-white/90">{player.nation.name}</span>
                )}
                {player.club?.name && player.nation?.name && (
                  <span className="text-white/60">•</span>
                )}
                {player.club?.name && (
                  <span className="text-[8px] text-white/90 line-clamp-1">{player.club.name}</span>
                )}
              </div>
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
