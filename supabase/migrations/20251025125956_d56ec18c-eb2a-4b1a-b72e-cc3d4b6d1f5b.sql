-- Drop the program column from players table
ALTER TABLE players DROP COLUMN IF EXISTS program;

-- Add foreign key constraint from players.source to programs.id
-- First, ensure source column exists and has correct type
ALTER TABLE players ALTER COLUMN source TYPE text;

-- Add the foreign key constraint (on delete set null to handle program deletions)
ALTER TABLE players 
ADD CONSTRAINT fk_players_source_programs 
FOREIGN KEY (source) 
REFERENCES programs(id) 
ON DELETE SET NULL;