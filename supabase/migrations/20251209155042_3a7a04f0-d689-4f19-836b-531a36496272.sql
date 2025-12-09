-- =============================================
-- 1. LOCALIZATION DICTIONARY TABLE
-- =============================================
CREATE TABLE public.localization_dictionary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value_en TEXT,
  value_vi TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.localization_dictionary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Localization dictionary is publicly readable"
ON public.localization_dictionary FOR SELECT USING (true);

-- =============================================
-- 2. SYNC STATE TABLE (for resumable sync)
-- =============================================
CREATE TABLE public.sync_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL UNIQUE,
  last_cursor JSONB,
  is_complete BOOLEAN DEFAULT false,
  total_synced INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sync state is publicly readable"
ON public.sync_state FOR SELECT USING (true);

-- =============================================
-- 3. NATIONS TABLE
-- =============================================
CREATE TABLE public.nations (
  id INTEGER PRIMARY KEY,
  localizationKey TEXT,
  displayName TEXT,
  image TEXT,
  rawData JSONB,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.nations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nations are publicly readable"
ON public.nations FOR SELECT USING (true);

-- =============================================
-- 4. LEAGUES TABLE
-- =============================================
CREATE TABLE public.leagues (
  id INTEGER PRIMARY KEY,
  localizationKey TEXT,
  displayName TEXT,
  image TEXT,
  rawData JSONB,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leagues are publicly readable"
ON public.leagues FOR SELECT USING (true);

-- =============================================
-- 5. TEAMS TABLE
-- =============================================
CREATE TABLE public.teams (
  id INTEGER PRIMARY KEY,
  localizationKey TEXT,
  displayName TEXT,
  image TEXT,
  rawData JSONB,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are publicly readable"
ON public.teams FOR SELECT USING (true);

-- =============================================
-- 6. PROGRAMS TABLE
-- =============================================
CREATE TABLE public.programs (
  id INTEGER PRIMARY KEY,
  localizationKey TEXT,
  displayName TEXT,
  image TEXT,
  rawData JSONB,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are publicly readable"
ON public.programs FOR SELECT USING (true);

-- =============================================
-- 7. PLAYERS TABLE (main table)
-- =============================================
CREATE TABLE public.players (
  "assetId" INTEGER PRIMARY KEY,
  "playerId" INTEGER NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "commonName" TEXT,
  "cardName" TEXT,
  position TEXT,
  rating INTEGER NOT NULL DEFAULT 0,
  "weakFoot" INTEGER,
  foot INTEGER,
  "workRateAtt" INTEGER,
  "workRateDef" INTEGER,
  weight INTEGER,
  height INTEGER,
  birthday TEXT,
  bio TEXT,
  "bindingXml" TEXT,
  animation JSONB,
  tags TEXT,
  "skillStyleId" INTEGER,
  "skillStyleSkills" JSONB,
  images JSONB,
  "skillMoves" JSONB,
  "skillMovesLevel" INTEGER,
  celebration JSONB,
  traits JSONB,
  club JSONB,
  league JSONB,
  nation JSONB,
  "potentialPositions" JSONB,
  "avgStats" JSONB,
  "avgGkStats" JSONB,
  stats JSONB,
  "priceData" JSONB,
  auctionable BOOLEAN,
  rank INTEGER,
  likes INTEGER,
  added TEXT,
  "revealOn" TEXT,
  source TEXT,
  "rawData" JSONB,
  "created_at_renderz" TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players are publicly readable"
ON public.players FOR SELECT USING (true);

-- Create index for common queries
CREATE INDEX idx_players_rating ON public.players (rating DESC);
CREATE INDEX idx_players_position ON public.players (position);
CREATE INDEX idx_players_playerId ON public.players ("playerId");

-- =============================================
-- 8. PLAYER MERCHANDISE TABLE
-- =============================================
CREATE TABLE public.player_merchandise (
  id SERIAL PRIMARY KEY,
  "playerId" INTEGER NOT NULL,
  "productDescription" TEXT NOT NULL,
  "productDescriptionVi" TEXT,
  "affiliateUrl" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.player_merchandise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Player merchandise is publicly readable"
ON public.player_merchandise FOR SELECT USING (true);

-- =============================================
-- 9. PROFILES TABLE (for user data)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  ai_prompt_limit_daily INTEGER DEFAULT 5,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 10. USER ROLES TABLE (for admin/permissions)
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 11. TRIGGER FOR AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();