import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BannerAdProps {
  adUnitId?: string;
  size?: '300x250' | '728x90' | '320x50';
  className?: string;
}

/**
 * Banner Ad Component
 * In production, replace with actual Google AdSense implementation
 */
export const BannerAd = ({ adUnitId, size = '300x250', className = '' }: BannerAdProps) => {
  const dimensions = {
    '300x250': { width: 300, height: 250 },
    '728x90': { width: 728, height: 90 },
    '320x50': { width: 320, height: 50 },
  };

  const { width, height } = dimensions[size];

  return (
    <Card 
      className={`relative overflow-hidden bg-muted/30 border-dashed ${className}`}
      style={{ width: '100%', maxWidth: width, height }}
    >
      <div className="absolute top-1 right-1 z-10">
        <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
          Quảng cáo
        </Badge>
      </div>
      
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-1 px-4">
          <p className="text-xs font-medium text-muted-foreground">
            Banner Ad ({size})
          </p>
          <p className="text-xs text-muted-foreground/50">
            {adUnitId || 'banner-ad-default'}
          </p>
        </div>
      </div>
    </Card>
  );
};
