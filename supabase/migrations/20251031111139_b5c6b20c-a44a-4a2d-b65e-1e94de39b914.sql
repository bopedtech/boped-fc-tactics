-- Add is_visible column to players table
ALTER TABLE public.players 
ADD COLUMN is_visible BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX idx_players_is_visible ON public.players(is_visible);

-- Update existing players to be visible by default
UPDATE public.players SET is_visible = true WHERE is_visible IS NULL;