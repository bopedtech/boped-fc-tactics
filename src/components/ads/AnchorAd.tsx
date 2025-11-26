import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AnchorAdProps {
  adUnitId?: string;
}

/**
 * Sticky Anchor Ad - Always visible at bottom of screen
 * In production, replace with actual Google AdSense Anchor Ad implementation
 */
export const AnchorAd = ({ adUnitId }: AnchorAdProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t shadow-lg">
      <div className="relative mx-auto max-w-screen-xl px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="outline" className="text-xs shrink-0">
            Quảng cáo
          </Badge>
          
          <div className="flex-1 flex items-center justify-center min-h-[50px]">
            <p className="text-xs text-muted-foreground">
              Anchor Ad Unit: {adUnitId || 'anchor-ad-default'}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
