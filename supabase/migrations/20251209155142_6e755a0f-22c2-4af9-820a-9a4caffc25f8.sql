-- =============================================
-- SQUADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "squadName" TEXT NOT NULL,
  formation TEXT,
  lineup JSONB,
  playstyle TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own squads"
ON public.squads FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can create their own squads"
ON public.squads FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own squads"
ON public.squads FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own squads"
ON public.squads FOR DELETE USING (auth.uid() = "userId");

-- =============================================
-- Update formations table to add missing columns
-- =============================================
ALTER TABLE public.formations ADD COLUMN IF NOT EXISTS "nameEn" TEXT;
ALTER TABLE public.formations ADD COLUMN IF NOT EXISTS category TEXT;

-- =============================================
-- Update profiles table to add missing columns
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fc_mobile_experience TEXT DEFAULT 'Người mới';

-- =============================================
-- Update players table to add createdAt column
-- =============================================
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now();