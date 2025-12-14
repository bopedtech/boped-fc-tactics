-- Migration: Create playerDetails sidecar table and RPC function
-- Purpose: Store detailed player data from Renderz (stats, price history, evolution, talents)

-- 1. Create the sidecar table for detailed player data
CREATE TABLE IF NOT EXISTS public."playerDetails" (
    "assetId" BIGINT PRIMARY KEY,
    
    -- Cleaned data for fast querying
    "stats" JSONB,                -- Detailed in-game stats (Sprint Speed, Curve, etc.)
    "priceHistory" JSONB,         -- Price graph data
    "evolution" JSONB,            -- Rank upgrade information
    "talents" JSONB,              -- Talent points data
    
    -- Raw data backup (required because Renderz structure changes frequently)
    "rawData" JSONB NOT NULL,
    
    -- System fields
    "fetchedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraint to players table
    CONSTRAINT "fk_playerDetails_players" 
        FOREIGN KEY ("assetId") 
        REFERENCES public.players("assetId") 
        ON DELETE CASCADE
);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_playerDetails_fetchedAt" ON public."playerDetails" ("fetchedAt");

-- 3. Create RPC function to get players missing details (queue mechanism)
CREATE OR REPLACE FUNCTION get_missing_player_details(batch_size INT DEFAULT 15)
RETURNS TABLE ("assetId" BIGINT) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p."assetId"
  FROM public.players p
  LEFT JOIN public."playerDetails" pd ON p."assetId" = pd."assetId"
  WHERE pd."assetId" IS NULL  -- Only get players without details
    AND p.is_visible = true   -- Only visible players
  ORDER BY p."rating" DESC    -- Prioritize higher-rated players
  LIMIT batch_size;
END;
$$;

-- 4. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public."playerDetails" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."playerDetails" TO service_role;
GRANT EXECUTE ON FUNCTION get_missing_player_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_missing_player_details TO service_role;

-- 5. Enable RLS
ALTER TABLE public."playerDetails" ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (read-only for authenticated users, full access for service role)
CREATE POLICY "Allow public read access" ON public."playerDetails"
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON public."playerDetails"
    FOR ALL USING (true);
