import { ExternalLink, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AffiliateLinkProps {
  productDescription: string;
  affiliateUrl: string;
  className?: string;
}

/**
 * Affiliate Link Card - Contextual product recommendations
 * Used for player-specific merchandise and products
 */
export const AffiliateLink = ({ 
  productDescription, 
  affiliateUrl,
  className = ''
}: AffiliateLinkProps) => {
  return (
    <Card className={`overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 ${className}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Sản phẩm liên quan
                </Badge>
              </div>
              <p className="text-sm font-medium leading-tight">
                {productDescription}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="default"
            className="shrink-0"
            onClick={() => window.open(affiliateUrl, '_blank', 'noopener,noreferrer')}
          >
            <span className="hidden sm:inline">Xem ngay</span>
            <ExternalLink className="w-4 h-4 sm:ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
