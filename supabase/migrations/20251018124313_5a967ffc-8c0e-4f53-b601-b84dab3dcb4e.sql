-- Drop the old players table
DROP TABLE IF EXISTS public.players CASCADE;

-- Create new players table with comprehensive schema based on API structure
CREATE TABLE public.players (
  id BIGSERIAL PRIMARY KEY,
  asset_id BIGINT UNIQUE NOT NULL,
  player_id INTEGER NOT NULL,
  
  -- Name fields
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  common_name VARCHAR(255),
  card_name VARCHAR(255),
  
  -- Core attributes
  position VARCHAR(10) NOT NULL,
  rating INTEGER NOT NULL,
  weak_foot INTEGER,
  foot INTEGER,
  height INTEGER,
  weight INTEGER,
  birthday DATE,
  
  -- Nation, Club, League (as objects)
  nation JSONB,
  club JSONB,
  league JSONB,
  
  -- Work rates
  work_rate_att INTEGER,
  work_rate_def INTEGER,
  
  -- Skills and traits
  skill_moves_level INTEGER,
  skill_moves JSONB,
  celebration JSONB,
  traits JSONB,
  skill_style_id INTEGER,
  skill_style_skills JSONB,
  
  -- Positions
  potential_positions JSONB,
  
  -- Stats
  stats JSONB,
  avg_stats JSONB,
  avg_gk_stats JSONB,
  
  -- Images
  images JSONB,
  
  -- Animation and visual data
  animation JSONB,
  binding_xml VARCHAR(255),
  
  -- Market data
  price_data JSONB,
  auctionable BOOLEAN DEFAULT false,
  
  -- Metadata
  tags TEXT,
  rank INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  source VARCHAR(50),
  bio TEXT,
  
  -- Timestamps
  added TIMESTAMP WITH TIME ZONE,
  reveal_on TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_players_rating ON public.players(rating DESC);
CREATE INDEX idx_players_position ON public.players(position);
CREATE INDEX idx_players_asset_id ON public.players(asset_id);
CREATE INDEX idx_players_common_name ON public.players(common_name);
CREATE INDEX idx_players_added ON public.players(added DESC);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Players are viewable by everyone"
  ON public.players
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_players_updated_at();