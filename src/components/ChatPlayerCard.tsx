import { Card } from "@/components/ui/card";

interface ChatPlayerCardProps {
  player: {
    assetId: number;
    name: string;
    rating: number;
    position: string;
    images?: any;
  };
  onClick: () => void;
}

const ChatPlayerCard = ({ player, onClick }: ChatPlayerCardProps) => {
  const getPlayerImage = () => {
    if (player.images?.card) {
      return player.images.card.replace('http://', 'https://');
    }
    return null;
  };

  const imageUrl = getPlayerImage();

  return (
    <Card 
      className="relative w-32 h-44 cursor-pointer hover:scale-105 transition-transform overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/30"
      onClick={onClick}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={player.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = `
              <div class="flex flex-col items-center justify-center h-full p-2">
                <div class="text-3xl font-bold text-primary">${player.rating}</div>
                <div class="text-xs font-semibold text-center mt-1">${player.name}</div>
                <div class="text-xs text-muted-foreground">${player.position}</div>
              </div>
            `;
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-2">
          <div className="text-3xl font-bold text-primary">{player.rating}</div>
          <div className="text-xs font-semibold text-center mt-1">{player.name}</div>
          <div className="text-xs text-muted-foreground">{player.position}</div>
        </div>
      )}
    </Card>
  );
};

export default ChatPlayerCard;