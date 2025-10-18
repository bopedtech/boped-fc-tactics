-- Create players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ovr INTEGER NOT NULL,
    position VARCHAR(10) NOT NULL,
    nation VARCHAR(50),
    club VARCHAR(50),
    image_url TEXT,
    stats JSONB,
    work_rate_att VARCHAR(10),
    work_rate_def VARCHAR(10),
    traits JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create squads table
CREATE TABLE squads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    squad_name VARCHAR(255) NOT NULL,
    formation VARCHAR(50) NOT NULL,
    lineup JSONB NOT NULL,
    playstyle VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on squads
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;

-- Create policy for squads
CREATE POLICY "Users can manage their own squads" ON squads
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- Insert mock player data
INSERT INTO players (name, ovr, position, nation, club, work_rate_att, work_rate_def, stats, traits, image_url)
VALUES
('Kylian Mbappé', 115, 'ST', 'France', 'Real Madrid', 'High', 'Low',
 '{"pace": 120, "shooting": 118, "passing": 105, "dribbling": 119, "defense": 60, "physicality": 100}'::jsonb,
 '["Speed Dribbler", "Finesse Shot"]'::jsonb,
 'https://cdn.sofifa.com/players/231/747/25_120.png'),
 
('Erling Haaland', 115, 'ST', 'Norway', 'Manchester City', 'High', 'Medium',
 '{"pace": 110, "shooting": 122, "passing": 90, "dribbling": 100, "defense": 70, "physicality": 120}'::jsonb,
 '["Power Header", "Clinical Finisher"]'::jsonb,
 'https://cdn.sofifa.com/players/239/085/25_120.png'),
 
('Kevin De Bruyne', 114, 'CM', 'Belgium', 'Manchester City', 'High', 'High',
 '{"pace": 90, "shooting": 110, "passing": 120, "dribbling": 110, "defense": 85, "physicality": 95}'::jsonb,
 '["Playmaker", "Long Passer"]'::jsonb,
 'https://cdn.sofifa.com/players/192/985/25_120.png'),
 
('Virgil van Dijk', 113, 'CB', 'Netherlands', 'Liverpool', 'Medium', 'High',
 '{"pace": 95, "shooting": 70, "passing": 80, "dribbling": 80, "defense": 118, "physicality": 115}'::jsonb,
 '["Leader", "Aerial Threat"]'::jsonb,
 'https://cdn.sofifa.com/players/203/376/25_120.png'),
 
('Jude Bellingham', 114, 'CAM', 'England', 'Real Madrid', 'High', 'High',
 '{"pace": 105, "shooting": 110, "passing": 112, "dribbling": 115, "defense": 95, "physicality": 108}'::jsonb,
 '["Engine", "Box-to-Box"]'::jsonb,
 'https://cdn.sofifa.com/players/252/371/25_120.png'),

('Rodri', 112, 'CDM', 'Spain', 'Manchester City', 'Medium', 'High',
 '{"pace": 82, "shooting": 95, "passing": 115, "dribbling": 105, "defense": 112, "physicality": 110}'::jsonb,
 '["Anchor", "Interceptions"]'::jsonb,
 'https://cdn.sofifa.com/players/231/866/25_120.png'),

('Thibaut Courtois', 113, 'GK', 'Belgium', 'Real Madrid', 'Medium', 'Medium',
 '{"diving": 115, "handling": 110, "kicking": 105, "reflexes": 118, "speed": 85, "positioning": 112}'::jsonb,
 '["Shot Stopper", "Sweeper Keeper"]'::jsonb,
 'https://cdn.sofifa.com/players/192/119/25_120.png'),

('Vinicius Jr', 114, 'LW', 'Brazil', 'Real Madrid', 'High', 'Medium',
 '{"pace": 118, "shooting": 108, "passing": 100, "dribbling": 120, "defense": 55, "physicality": 90}'::jsonb,
 '["Speed Dribbler", "Flair"]'::jsonb,
 'https://cdn.sofifa.com/players/238/794/25_120.png'),

('Mohamed Salah', 113, 'RW', 'Egypt', 'Liverpool', 'High', 'Medium',
 '{"pace": 115, "shooting": 115, "passing": 105, "dribbling": 115, "defense": 60, "physicality": 95}'::jsonb,
 '["Finesse Shot", "Speed Dribbler"]'::jsonb,
 'https://cdn.sofifa.com/players/209/331/25_120.png'),

('Trent Alexander-Arnold', 111, 'RB', 'England', 'Liverpool', 'High', 'Medium',
 '{"pace": 98, "shooting": 100, "passing": 118, "dribbling": 105, "defense": 100, "physicality": 95}'::jsonb,
 '["Crossing Specialist", "Playmaker"]'::jsonb,
 'https://cdn.sofifa.com/players/231/281/25_120.png'),

('Alphonso Davies', 110, 'LB', 'Canada', 'Bayern Munich', 'High', 'High',
 '{"pace": 120, "shooting": 85, "passing": 95, "dribbling": 105, "defense": 100, "physicality": 100}'::jsonb,
 '["Speed Demon", "Acrobatic Defender"]'::jsonb,
 'https://cdn.sofifa.com/players/234/396/25_120.png'),

('Ruben Dias', 112, 'CB', 'Portugal', 'Manchester City', 'Medium', 'High',
 '{"pace": 90, "shooting": 65, "passing": 85, "dribbling": 75, "defense": 115, "physicality": 112}'::jsonb,
 '["Defensive Leader", "Slide Tackle"]'::jsonb,
 'https://cdn.sofifa.com/players/239/818/25_120.png');

-- Create index for better query performance
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_ovr ON players(ovr);
CREATE INDEX idx_players_name ON players(name);