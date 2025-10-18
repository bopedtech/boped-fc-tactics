-- Add more players to the database for better testing
INSERT INTO players (name, ovr, position, nation, club, work_rate_att, work_rate_def, stats, traits, image_url)
VALUES
-- Forwards
('Harry Kane', 113, 'ST', 'England', 'Bayern Munich', 'High', 'Medium',
 '{"pace": 88, "shooting": 120, "passing": 110, "dribbling": 100, "defense": 70, "physicality": 110}'::jsonb,
 '["Clinical Finisher", "Power Header"]'::jsonb,
 'https://cdn.sofifa.com/players/202/126/25_120.png'),

('Lautaro Martinez', 112, 'ST', 'Argentina', 'Inter Milan', 'High', 'High',
 '{"pace": 108, "shooting": 115, "passing": 98, "dribbling": 108, "defense": 75, "physicality": 105}'::jsonb,
 '["Finesse Shot", "Clinical Finisher"]'::jsonb,
 'https://cdn.sofifa.com/players/231/478/25_120.png'),

('Victor Osimhen', 111, 'ST', 'Nigeria', 'Napoli', 'High', 'Medium',
 '{"pace": 118, "shooting": 112, "passing": 88, "dribbling": 105, "defense": 60, "physicality": 108}'::jsonb,
 '["Speed Dribbler", "Power Header"]'::jsonb,
 'https://cdn.sofifa.com/players/233/784/25_120.png'),

-- Midfielders
('Bruno Fernandes', 112, 'CAM', 'Portugal', 'Manchester United', 'High', 'High',
 '{"pace": 95, "shooting": 112, "passing": 115, "dribbling": 108, "defense": 88, "physicality": 95}'::jsonb,
 '["Playmaker", "Long Shot"]'::jsonb,
 'https://cdn.sofifa.com/players/212/198/25_120.png'),

('Luka Modric', 111, 'CM', 'Croatia', 'Real Madrid', 'High', 'High',
 '{"pace": 90, "shooting": 95, "passing": 118, "dribbling": 115, "defense": 90, "physicality": 85}'::jsonb,
 '["Playmaker", "Engine"]'::jsonb,
 'https://cdn.sofifa.com/players/177/003/25_120.png'),

('Federico Valverde', 111, 'CM', 'Uruguay', 'Real Madrid', 'High', 'High',
 '{"pace": 108, "shooting": 105, "passing": 108, "dribbling": 105, "defense": 100, "physicality": 112}'::jsonb,
 '["Engine", "Box-to-Box"]'::jsonb,
 'https://cdn.sofifa.com/players/239/053/25_120.png'),

('Casemiro', 110, 'CDM', 'Brazil', 'Manchester United', 'Medium', 'High',
 '{"pace": 85, "shooting": 92, "passing": 105, "dribbling": 95, "defense": 115, "physicality": 112}'::jsonb,
 '["Anchor", "Interceptions"]'::jsonb,
 'https://cdn.sofifa.com/players/200/145/25_120.png'),

-- Wingers
('Bukayo Saka', 112, 'RW', 'England', 'Arsenal', 'High', 'Medium',
 '{"pace": 110, "shooting": 108, "passing": 108, "dribbling": 115, "defense": 70, "physicality": 95}'::jsonb,
 '["Finesse Shot", "Speed Dribbler"]'::jsonb,
 'https://cdn.sofifa.com/players/246/669/25_120.png'),

('Rafael Leao', 111, 'LW', 'Portugal', 'AC Milan', 'High', 'Medium',
 '{"pace": 120, "shooting": 105, "passing": 95, "dribbling": 115, "defense": 60, "physicality": 105}'::jsonb,
 '["Speed Dribbler", "Flair"]'::jsonb,
 'https://cdn.sofifa.com/players/230/621/25_120.png'),

('Phil Foden', 111, 'LW', 'England', 'Manchester City', 'High', 'High',
 '{"pace": 108, "shooting": 110, "passing": 110, "dribbling": 118, "defense": 75, "physicality": 88}'::jsonb,
 '["Finesse Shot", "Playmaker"]'::jsonb,
 'https://cdn.sofifa.com/players/237/692/25_120.png'),

-- Defenders
('Antonio Rudiger', 112, 'CB', 'Germany', 'Real Madrid', 'Medium', 'High',
 '{"pace": 105, "shooting": 70, "passing": 88, "dribbling": 85, "defense": 116, "physicality": 115}'::jsonb,
 '["Slide Tackle", "Acrobatic Defender"]'::jsonb,
 'https://cdn.sofifa.com/players/205/452/25_120.png'),

('William Saliba', 111, 'CB', 'France', 'Arsenal', 'Medium', 'High',
 '{"pace": 105, "shooting": 65, "passing": 85, "dribbling": 82, "defense": 114, "physicality": 112}'::jsonb,
 '["Leader", "Aerial Threat"]'::jsonb,
 'https://cdn.sofifa.com/players/243/715/25_120.png'),

('Theo Hernandez', 111, 'LB', 'France', 'AC Milan', 'High', 'Medium',
 '{"pace": 118, "shooting": 95, "passing": 100, "dribbling": 108, "defense": 102, "physicality": 105}'::jsonb,
 '["Speed Demon", "Crossing Specialist"]'::jsonb,
 'https://cdn.sofifa.com/players/232/656/25_120.png'),

('Kyle Walker', 110, 'RB', 'England', 'Manchester City', 'High', 'High',
 '{"pace": 115, "shooting": 85, "passing": 95, "dribbling": 98, "defense": 108, "physicality": 108}'::jsonb,
 '["Speed Demon", "Acrobatic Defender"]'::jsonb,
 'https://cdn.sofifa.com/players/188/377/25_120.png'),

('Joao Cancelo', 110, 'RB', 'Portugal', 'Barcelona', 'High', 'High',
 '{"pace": 110, "shooting": 92, "passing": 108, "dribbling": 112, "defense": 100, "physicality": 95}'::jsonb,
 '["Playmaker", "Crossing Specialist"]'::jsonb,
 'https://cdn.sofifa.com/players/210/514/25_120.png'),

-- Goalkeepers
('Alisson', 113, 'GK', 'Brazil', 'Liverpool', 'Medium', 'Medium',
 '{"diving": 116, "handling": 112, "kicking": 108, "reflexes": 120, "speed": 88, "positioning": 115}'::jsonb,
 '["Shot Stopper", "Sweeper Keeper"]'::jsonb,
 'https://cdn.sofifa.com/players/212/831/25_120.png'),

('Ederson', 112, 'GK', 'Brazil', 'Manchester City', 'Medium', 'Medium',
 '{"diving": 110, "handling": 108, "kicking": 120, "reflexes": 115, "speed": 90, "positioning": 112}'::jsonb,
 '["Sweeper Keeper", "Long Throw"]'::jsonb,
 'https://cdn.sofifa.com/players/210/257/25_120.png'),

('Mike Maignan', 111, 'GK', 'France', 'AC Milan', 'Medium', 'Medium',
 '{"diving": 112, "handling": 110, "kicking": 102, "reflexes": 116, "speed": 85, "positioning": 113}'::jsonb,
 '["Shot Stopper", "Command Area"]'::jsonb,
 'https://cdn.sofifa.com/players/215/698/25_120.png');