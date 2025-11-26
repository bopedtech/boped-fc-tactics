import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface NativeAdCardProps {
  adUnitId?: string;
}

/**
 * Native Ad Card - Designed to blend with player cards
 * In production, replace with actual Google AdSense/AdMob Native Ad implementation
 */
export const NativeAdCard = ({ adUnitId }: NativeAdCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 hover:border-accent/50 transition-all">
      <div className="absolute top-2 right-2">
        <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
          Quảng cáo
        </Badge>
      </div>
      
      <div className="p-6 flex flex-col items-center justify-center min-h-[280px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <ExternalLink className="w-8 h-8 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">Sponsored Content</h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Advertisement space - AdSense Native Ad will appear here
          </p>
        </div>

        {/* Placeholder for actual ad implementation */}
        <div 
          data-ad-unit-id={adUnitId}
          className="w-full text-xs text-center text-muted-foreground/50"
        >
          Ad Unit: {adUnitId || 'native-ad-default'}
        </div>
      </div>
    </Card>
  );
};
