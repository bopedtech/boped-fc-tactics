-- Add new columns to squads table
ALTER TABLE squads 
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN likes_count INTEGER DEFAULT 0,
ADD COLUMN tactics JSONB DEFAULT '{}'::jsonb;

-- Create function to increment likes if it doesn't exist
CREATE OR REPLACE FUNCTION increment_likes(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE squads
  SET likes_count = likes_count + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
