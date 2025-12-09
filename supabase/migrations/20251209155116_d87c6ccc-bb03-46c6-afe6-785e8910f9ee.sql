-- Add super_admin to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- =============================================
-- TRAITS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.traits (
  id INTEGER PRIMARY KEY,
  "localizationKey" TEXT,
  "displayName" TEXT,
  "mediaUrl" TEXT,
  "rawData" JSONB,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.traits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Traits are publicly readable"
ON public.traits FOR SELECT USING (true);

-- =============================================
-- SKILLMOVES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.skillmoves (
  id INTEGER PRIMARY KEY,
  "localizationKey" TEXT,
  "displayName" TEXT,
  "mediaUrl" TEXT,
  "rawData" JSONB,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.skillmoves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skillmoves are publicly readable"
ON public.skillmoves FOR SELECT USING (true);

-- =============================================
-- CELEBRATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.celebrations (
  id INTEGER PRIMARY KEY,
  "localizationKey" TEXT,
  "displayName" TEXT,
  "mediaUrl" TEXT,
  "rawData" JSONB,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Celebrations are publicly readable"
ON public.celebrations FOR SELECT USING (true);

-- =============================================
-- FORMATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.formations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  positions JSONB,
  "rawData" JSONB,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Formations are publicly readable"
ON public.formations FOR SELECT USING (true);

-- =============================================
-- Update profiles table to add user_id column for compatibility
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing rows to have user_id = id
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- Add subscription columns with correct names for code compatibility
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "aiPromptLimitDaily" INTEGER DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP WITH TIME ZONE;