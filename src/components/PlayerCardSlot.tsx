import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Player {
  id: number;
  name: string;
  ovr: number;
  position: string;
  nation?: string;
  club?: string;
  image_url?: string;
  stats: any;
}

interface PlayerCardSlotProps {
  player: Player | null;
  position: string;
  onClick: () => void;
  onRemove?: () => void;
}

export default function PlayerCardSlot({ player, position, onClick, onRemove }: PlayerCardSlotProps) {
  if (player) {
    return (
      <div className="group relative animate-scale-in">
        {onRemove && (
          <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="destructive"
              className="h-6 w-6 rounded-full shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <div 
          className="relative w-20 h-24 cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={onClick}
        >
          {/* Card Background - Golden frame style */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/90 via-yellow-500/80 to-yellow-700/90 rounded-lg shadow-xl border-2 border-yellow-400/50" />
          
          {/* Inner content */}
          <div className="relative h-full flex flex-col items-center justify-between p-1.5 pt-2">
            {/* OVR */}
            <div className="text-center">
              <div className="text-lg font-black text-gray-900 drop-shadow-sm leading-none">
                {player.ovr}
              </div>
              <div className="text-[8px] font-bold text-gray-800 uppercase tracking-tight mt-0.5">
                {player.position}
              </div>
            </div>

            {/* Player image placeholder area */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-2 border-yellow-400/30">
              <span className="text-[10px] font-bold text-yellow-300">{player.name.charAt(0)}</span>
            </div>

            {/* Player name */}
            <div className="text-center w-full">
              <div className="text-[9px] font-bold text-gray-900 truncate px-0.5 uppercase tracking-tight">
                {player.name.split(' ').pop()}
              </div>
            </div>
          </div>

          {/* Position badge at bottom */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 shadow-lg">
              {position}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-20 h-24 cursor-pointer hover:scale-105 transition-transform duration-200 group animate-fade-in"
      onClick={onClick}
    >
      {/* Empty slot background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-800/80 rounded-lg border-2 border-dashed border-gray-600/50 group-hover:border-primary/50 transition-colors backdrop-blur-sm" />
      
      <div className="relative h-full flex flex-col items-center justify-center p-2">
        <div className="text-4xl text-gray-600 group-hover:text-primary/70 transition-colors mb-1">+</div>
        <div className="text-[9px] font-semibold text-gray-500 group-hover:text-primary/70 transition-colors uppercase">
          {position}
        </div>
      </div>
    </div>
  );
}
