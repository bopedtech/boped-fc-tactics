import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserTier = 'FREE' | 'PREMIUM';

interface UserTierData {
  tier: UserTier;
  loading: boolean;
  aiPromptLimitDaily: number;
  subscriptionExpiresAt: string | null;
  isAdmin: boolean;
}

export const useUserTier = (user: User | null): UserTierData => {
  const [tierData, setTierData] = useState<UserTierData>({
    tier: 'FREE',
    loading: true,
    aiPromptLimitDaily: 5,
    subscriptionExpiresAt: null,
    isAdmin: false,
  });

  useEffect(() => {
    const fetchUserTier = async () => {
      if (!user) {
        setTierData({
          tier: 'FREE',
          loading: false,
          aiPromptLimitDaily: 5,
          subscriptionExpiresAt: null,
          isAdmin: false,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscriptionTier, aiPromptLimitDaily, subscriptionExpiresAt')
          .eq('user_id', user.id)
          .single();

        // Check for admin role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "super_admin")
          .maybeSingle();

        const isAdmin = !!roles;

        if (error) throw error;

        // Check if subscription is still valid
        const isExpired = data.subscriptionExpiresAt
          ? new Date(data.subscriptionExpiresAt) < new Date()
          : false;

        const tier = (isExpired ? 'FREE' : data.subscriptionTier || 'FREE') as UserTier;

        setTierData({
          tier,
          loading: false,
          aiPromptLimitDaily: data.aiPromptLimitDaily || 5,
          subscriptionExpiresAt: data.subscriptionExpiresAt,
          isAdmin,
        });
      } catch (error) {
        console.error('Error fetching user tier:', error);
        setTierData({
          tier: 'FREE',
          loading: false,
          aiPromptLimitDaily: 5,
          subscriptionExpiresAt: null,
          isAdmin: false,
        });
      }
    };

    fetchUserTier();
  }, [user]);

  return tierData;
};
