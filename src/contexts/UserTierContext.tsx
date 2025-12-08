import { createContext, useContext, ReactNode } from 'react';
import { useUserTier, UserTier } from '@/hooks/useUserTier';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

interface UserTierContextType {
  tier: UserTier;
  loading: boolean;
  aiPromptLimitDaily: number;
  subscriptionExpiresAt: string | null;
  user: User | null;
  isAdmin: boolean;
}

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

export function UserTierProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const tierData = useUserTier(user);

  return (
    <UserTierContext.Provider value={{ ...tierData, user, loading: authLoading || tierData.loading }}>
      {children}
    </UserTierContext.Provider>
  );
}

export function useUserTierContext() {
  const context = useContext(UserTierContext);
  if (context === undefined) {
    throw new Error('useUserTierContext must be used within UserTierProvider');
  }
  return context;
}
