-- Add alternative_positions column to players table
ALTER TABLE public.players
ADD COLUMN alternative_positions jsonb DEFAULT '[]'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN public.players.alternative_positions IS 'Array of alternative positions that unlock at rank 2+';

-- Update RLS policy to allow public read access
DROP POLICY IF EXISTS "Players are viewable by everyone" ON public.players;
CREATE POLICY "Players are viewable by everyone"
ON public.players
FOR SELECT
USING (true);