-- Add created_at_renderz column to players table to store the creation timestamp from Renderz API
ALTER TABLE players
ADD COLUMN created_at_renderz timestamp with time zone;