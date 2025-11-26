-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT DEFAULT 'FREE' CHECK ("subscriptionTier" IN ('FREE', 'PREMIUM')),
ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "aiPromptLimitDaily" INTEGER DEFAULT 5;

-- Create player_merchandise table for affiliate links
CREATE TABLE IF NOT EXISTS public.player_merchandise (
  "id" SERIAL PRIMARY KEY,
  "playerId" BIGINT NOT NULL,
  "productDescription" TEXT NOT NULL,
  "productDescriptionVi" TEXT,
  "affiliateUrl" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on player_merchandise
ALTER TABLE public.player_merchandise ENABLE ROW LEVEL SECURITY;

-- Everyone can view active merchandise
CREATE POLICY "Merchandise viewable by everyone"
ON public.player_merchandise
FOR SELECT
USING ("isActive" = TRUE);

-- Only admins can manage merchandise
CREATE POLICY "Admins can manage merchandise"
ON public.player_merchandise
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_player_merchandise_player 
ON public.player_merchandise("playerId") 
WHERE "isActive" = TRUE;