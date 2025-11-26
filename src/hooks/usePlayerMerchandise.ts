import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Merchandise {
  id: number;
  playerId: number;
  productDescription: string;
  productDescriptionVi: string | null;
  affiliateUrl: string;
}

export const usePlayerMerchandise = (playerId: number | null, locale: string) => {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMerchandise = async () => {
      if (!playerId) {
        setMerchandise([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('player_merchandise')
          .select('*')
          .eq('playerId', playerId)
          .eq('isActive', true);

        if (error) throw error;

        setMerchandise(data || []);
      } catch (error) {
        console.error('Error fetching merchandise:', error);
        setMerchandise([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchandise();
  }, [playerId]);

  // Return localized description
  const getLocalizedMerchandise = () => {
    return merchandise.map(item => ({
      ...item,
      productDescription: locale === 'vi' && item.productDescriptionVi 
        ? item.productDescriptionVi 
        : item.productDescription
    }));
  };

  return { 
    merchandise: getLocalizedMerchandise(), 
    loading 
  };
};
