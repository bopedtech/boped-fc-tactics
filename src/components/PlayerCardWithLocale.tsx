import { useT } from "@/contexts/LocalizationContext";
import PlayerCard from "@/components/PlayerCard";

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
  stats: any;
  traits?: any[];
  source?: string;
  auctionable?: boolean;
  avgStats?: any;
  avgGkStats?: any;
  rank?: number;
  training?: number;
}

type PlayerCardVariant = "small" | "medium" | "large";

interface PlayerCardWithLocaleProps {
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

/**
 * Wrapper component that adds locale as key to force re-render when language changes
 */
export default function PlayerCardWithLocale(props: PlayerCardWithLocaleProps) {
  const { locale } = useT();
  
  // Key with locale forces component to remount when language changes
  return <PlayerCard key={locale} {...props} />;
}
