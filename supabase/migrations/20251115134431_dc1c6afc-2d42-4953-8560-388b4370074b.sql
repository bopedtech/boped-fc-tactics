-- Remove foreign key constraint between players.source and programs.id
-- This allows players to be synced independently without requiring programs to exist first
ALTER TABLE players
DROP CONSTRAINT IF EXISTS fk_players_source_programs;