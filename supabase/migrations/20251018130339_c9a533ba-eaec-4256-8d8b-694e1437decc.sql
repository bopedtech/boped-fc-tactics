-- Insert 30 mock players with all positions for testing squad builder

INSERT INTO public.players (
  asset_id, player_id, first_name, last_name, common_name, card_name,
  position, rating, weak_foot, foot, height, weight, birthday,
  nation, club, league, work_rate_att, work_rate_def,
  skill_moves_level, stats, images, traits, auctionable, rank
) VALUES
-- Goalkeepers (GK) - 3 players
(40001, 200001, 'Manuel', 'Neuer', 'M. Neuer', 'Neuer', 'GK', 116, 3, 1, 193, 92, '1986-03-27',
 '{"id": 21, "name": "Germany"}'::jsonb, '{"id": 21, "name": "Bayern Munich"}'::jsonb, '{"id": 19, "name": "Bundesliga"}'::jsonb, 1, 1, 1,
 '{"diving": 141, "handling": 140, "kicking": 128, "reflexes": 143, "speed": 118, "positioning": 137}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Neuer&background=DC052D&color=fff&size=256"}'::jsonb,
 '[{"id": 20, "title": "Sweeper Keeper"}]'::jsonb, false, 0),

(40002, 200002, 'Thibaut', 'Courtois', 'T. Courtois', 'Courtois', 'GK', 115, 3, 2, 199, 96, '1992-05-11',
 '{"id": 7, "name": "Belgium"}'::jsonb, '{"id": 243, "name": "Real Madrid"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 1, 1, 1,
 '{"diving": 139, "handling": 138, "kicking": 122, "reflexes": 141, "speed": 116, "positioning": 136}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Courtois&background=D4AF37&color=fff&size=256"}'::jsonb,
 '[{"id": 21, "title": "Shot Stopper"}]'::jsonb, false, 0),

(40003, 200003, 'Ederson', 'Moraes', 'Ederson', 'Ederson', 'GK', 113, 3, 2, 188, 86, '1993-08-17',
 '{"id": 54, "name": "Brazil"}'::jsonb, '{"id": 10, "name": "Manchester City"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 1, 1, 1,
 '{"diving": 136, "handling": 135, "kicking": 130, "reflexes": 138, "speed": 120, "positioning": 134}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Ederson&background=6CABDD&color=fff&size=256"}'::jsonb,
 '[{"id": 20, "title": "Sweeper Keeper"}]'::jsonb, false, 0),

-- Center Backs (CB) - 5 players
(40004, 200004, 'Sergio', 'Ramos', 'S. Ramos', 'Ramos', 'CB', 117, 3, 1, 184, 82, '1986-03-30',
 '{"id": 45, "name": "Spain"}'::jsonb, '{"id": 240, "name": "Sevilla"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 1, 3, 2,
 '{"pace": 112, "shooting": 82, "passing": 118, "dribbling": 100, "defense": 144, "physicality": 140}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Ramos&background=E53E3E&color=fff&size=256"}'::jsonb,
 '[{"id": 10, "title": "Aerial Threat"}, {"id": 13, "title": "Aggressor"}]'::jsonb, false, 3),

(40005, 200005, 'Ruben', 'Dias', 'R. Dias', 'Dias', 'CB', 114, 3, 1, 187, 82, '1997-05-14',
 '{"id": 38, "name": "Portugal"}'::jsonb, '{"id": 10, "name": "Manchester City"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 1, 3, 2,
 '{"pace": 108, "shooting": 72, "passing": 112, "dribbling": 92, "defense": 140, "physicality": 136}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Dias&background=6CABDD&color=fff&size=256"}'::jsonb,
 '[{"id": 12, "title": "Tactician"}]'::jsonb, false, 4),

(40006, 200006, 'Antonio', 'Rudiger', 'A. Rudiger', 'Rudiger', 'CB', 113, 3, 2, 190, 85, '1993-03-03',
 '{"id": 21, "name": "Germany"}'::jsonb, '{"id": 243, "name": "Real Madrid"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 1, 3, 2,
 '{"pace": 115, "shooting": 70, "passing": 110, "dribbling": 88, "defense": 138, "physicality": 137}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Rudiger&background=D4AF37&color=fff&size=256"}'::jsonb,
 '[{"id": 14, "title": "Stopper"}]'::jsonb, false, 5),

(40007, 200007, 'Marquinhos', '', 'Marquinhos', 'Marquinhos', 'CB', 112, 3, 1, 183, 75, '1994-05-14',
 '{"id": 54, "name": "Brazil"}'::jsonb, '{"id": 73, "name": "PSG"}'::jsonb, '{"id": 16, "name": "Ligue 1"}'::jsonb, 1, 3, 3,
 '{"pace": 113, "shooting": 68, "passing": 114, "dribbling": 95, "defense": 136, "physicality": 132}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Marquinhos&background=004170&color=fff&size=256"}'::jsonb,
 '[{"id": 12, "title": "Tactician"}]'::jsonb, false, 0),

(40008, 200008, 'Eder', 'Militao', 'E. Militao', 'Militao', 'CB', 111, 3, 1, 186, 78, '1998-01-18',
 '{"id": 54, "name": "Brazil"}'::jsonb, '{"id": 243, "name": "Real Madrid"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 2, 3, 3,
 '{"pace": 120, "shooting": 65, "passing": 108, "dribbling": 90, "defense": 134, "physicality": 135}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Militao&background=D4AF37&color=fff&size=256"}'::jsonb,
 '[{"id": 15, "title": "Rapid Recovery"}]'::jsonb, false, 0),

-- Left Backs (LB) - 3 players
(40009, 200009, 'Alphonso', 'Davies', 'A. Davies', 'Davies', 'LB', 115, 3, 2, 183, 74, '2000-11-02',
 '{"id": 95, "name": "Canada"}'::jsonb, '{"id": 21, "name": "Bayern Munich"}'::jsonb, '{"id": 19, "name": "Bundesliga"}'::jsonb, 3, 2, 4,
 '{"pace": 145, "shooting": 78, "passing": 115, "dribbling": 125, "defense": 118, "physicality": 110}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Davies&background=DC052D&color=fff&size=256"}'::jsonb,
 '[{"id": 2, "title": "Speed Demon"}]'::jsonb, false, 1),

(40010, 200010, 'Andrew', 'Robertson', 'A. Robertson', 'Robertson', 'LB', 112, 3, 2, 178, 64, '1994-03-11',
 '{"id": 42, "name": "Scotland"}'::jsonb, '{"id": 9, "name": "Liverpool"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 3, 3, 3,
 '{"pace": 128, "shooting": 75, "passing": 125, "dribbling": 115, "defense": 122, "physicality": 105}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Robertson&background=C41230&color=fff&size=256"}'::jsonb,
 '[{"id": 16, "title": "Relentless"}]'::jsonb, false, 0),

(40011, 200011, 'Theo', 'Hernandez', 'T. Hernandez', 'Hernandez', 'LB', 111, 4, 2, 184, 75, '1997-10-06',
 '{"id": 18, "name": "France"}'::jsonb, '{"id": 45, "name": "AC Milan"}'::jsonb, '{"id": 31, "name": "Serie A"}'::jsonb, 3, 2, 4,
 '{"pace": 135, "shooting": 82, "passing": 118, "dribbling": 122, "defense": 115, "physicality": 112}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Hernandez&background=FB090B&color=fff&size=256"}'::jsonb,
 '[{"id": 17, "title": "Acrobatic"}]'::jsonb, false, 0),

-- Right Backs (RB) - 3 players
(40012, 200012, 'Trent', 'Alexander-Arnold', 'T. Alexander-Arnold', 'TAA', 'RB', 114, 3, 1, 180, 69, '1998-10-07',
 '{"id": 14, "name": "England"}'::jsonb, '{"id": 9, "name": "Liverpool"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 2, 2, 4,
 '{"pace": 118, "shooting": 110, "passing": 140, "dribbling": 120, "defense": 115, "physicality": 102}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=TAA&background=C41230&color=fff&size=256"}'::jsonb,
 '[{"id": 8, "title": "Playmaker"}]'::jsonb, false, 2),

(40013, 200013, 'Achraf', 'Hakimi', 'A. Hakimi', 'Hakimi', 'RB', 113, 4, 1, 181, 73, '1998-11-04',
 '{"id": 50, "name": "Morocco"}'::jsonb, '{"id": 73, "name": "PSG"}'::jsonb, '{"id": 16, "name": "Ligue 1"}'::jsonb, 3, 2, 5,
 '{"pace": 142, "shooting": 88, "passing": 120, "dribbling": 128, "defense": 112, "physicality": 108}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Hakimi&background=004170&color=fff&size=256"}'::jsonb,
 '[{"id": 2, "title": "Speed Demon"}]'::jsonb, false, 3),

(40014, 200014, 'Kyle', 'Walker', 'K. Walker', 'Walker', 'RB', 110, 3, 1, 178, 70, '1990-05-28',
 '{"id": 14, "name": "England"}'::jsonb, '{"id": 10, "name": "Manchester City"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 2, 3, 3,
 '{"pace": 140, "shooting": 72, "passing": 112, "dribbling": 108, "defense": 120, "physicality": 116}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Walker&background=6CABDD&color=fff&size=256"}'::jsonb,
 '[{"id": 2, "title": "Speed Demon"}]'::jsonb, false, 0),

-- Central Midfielders (CM/CDM) - 4 players
(40015, 200015, 'N''Golo', 'Kante', 'N. Kante', 'Kante', 'CDM', 112, 3, 1, 168, 70, '1991-03-29',
 '{"id": 18, "name": "France"}'::jsonb, '{"id": 11, "name": "Chelsea"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 2, 3, 3,
 '{"pace": 125, "shooting": 78, "passing": 118, "dribbling": 115, "defense": 135, "physicality": 120}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Kante&background=034694&color=fff&size=256"}'::jsonb,
 '[{"id": 19, "title": "Engine"}]'::jsonb, false, 4),

(40016, 200016, 'Casemiro', '', 'Casemiro', 'Casemiro', 'CDM', 111, 3, 1, 185, 84, '1992-02-23',
 '{"id": 54, "name": "Brazil"}'::jsonb, '{"id": 11, "name": "Manchester United"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 2, 3, 2,
 '{"pace": 105, "shooting": 85, "passing": 115, "dribbling": 100, "defense": 133, "physicality": 128}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Casemiro&background=DA291C&color=fff&size=256"}'::jsonb,
 '[{"id": 13, "title": "Aggressor"}]'::jsonb, false, 5),

(40017, 200017, 'Jude', 'Bellingham', 'J. Bellingham', 'Bellingham', 'CM', 116, 4, 1, 186, 75, '2003-06-29',
 '{"id": 14, "name": "England"}'::jsonb, '{"id": 243, "name": "Real Madrid"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 3, 3, 4,
 '{"pace": 125, "shooting": 130, "passing": 128, "dribbling": 132, "defense": 105, "physicality": 118}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Bellingham&background=D4AF37&color=fff&size=256"}'::jsonb,
 '[{"id": 22, "title": "Box to Box"}]'::jsonb, false, 1),

(40018, 200018, 'Luka', 'Modric', 'L. Modric', 'Modric', 'CM', 114, 4, 1, 172, 66, '1985-09-09',
 '{"id": 3, "name": "Croatia"}'::jsonb, '{"id": 243, "name": "Real Madrid"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 2, 3, 5,
 '{"pace": 112, "shooting": 115, "passing": 138, "dribbling": 135, "defense": 102, "physicality": 98}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Modric&background=D4AF37&color=fff&size=256"}'::jsonb,
 '[{"id": 8, "title": "Playmaker"}]'::jsonb, false, 2),

-- Attacking Midfielders (CAM) - 2 players
(40019, 200019, 'Bruno', 'Fernandes', 'B. Fernandes', 'Fernandes', 'CAM', 115, 4, 1, 179, 69, '1994-09-08',
 '{"id": 38, "name": "Portugal"}'::jsonb, '{"id": 11, "name": "Manchester United"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 3, 2, 5,
 '{"pace": 115, "shooting": 132, "passing": 138, "dribbling": 128, "defense": 98, "physicality": 108}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Fernandes&background=DA291C&color=fff&size=256"}'::jsonb,
 '[{"id": 8, "title": "Playmaker"}]'::jsonb, false, 3),

(40020, 200020, 'Martin', 'Odegaard', 'M. Odegaard', 'Odegaard', 'CAM', 113, 4, 2, 178, 68, '1998-12-17',
 '{"id": 36, "name": "Norway"}'::jsonb, '{"id": 1, "name": "Arsenal"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 3, 2, 4,
 '{"pace": 118, "shooting": 125, "passing": 135, "dribbling": 130, "defense": 95, "physicality": 102}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Odegaard&background=EF0107&color=fff&size=256"}'::jsonb,
 '[{"id": 8, "title": "Playmaker"}]'::jsonb, false, 4),

-- Left Wingers (LW/LM) - 2 players
(40021, 200021, 'Vinicius', 'Junior', 'Vinicius Jr.', 'Vinicius', 'LW', 118, 4, 1, 176, 73, '2000-07-12',
 '{"id": 54, "name": "Brazil"}'::jsonb, '{"id": 243, "name": "Real Madrid"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 3, 2, 5,
 '{"pace": 143, "shooting": 128, "passing": 120, "dribbling": 142, "defense": 65, "physicality": 108}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Vinicius&background=D4AF37&color=fff&size=256"}'::jsonb,
 '[{"id": 5, "title": "Speed Dribbler"}]'::jsonb, false, 2),

(40022, 200022, 'Heung-Min', 'Son', 'Son Heung-Min', 'Son', 'LW', 115, 4, 3, 183, 78, '1992-07-08',
 '{"id": 83, "name": "South Korea"}'::jsonb, '{"id": 18, "name": "Tottenham"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 3, 2, 5,
 '{"pace": 135, "shooting": 138, "passing": 122, "dribbling": 133, "defense": 68, "physicality": 110}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Son&background=132257&color=fff&size=256"}'::jsonb,
 '[{"id": 3, "title": "Finesse Shot"}]'::jsonb, false, 3),

-- Right Wingers (RW/RM) - 2 players
(40023, 200023, 'Mohamed', 'Salah', 'M. Salah', 'Salah', 'RW', 117, 3, 2, 175, 71, '1992-06-15',
 '{"id": 111, "name": "Egypt"}'::jsonb, '{"id": 9, "name": "Liverpool"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 3, 2, 4,
 '{"pace": 140, "shooting": 140, "passing": 125, "dribbling": 138, "defense": 68, "physicality": 112}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Salah&background=C41230&color=fff&size=256"}'::jsonb,
 '[{"id": 3, "title": "Finesse Shot"}, {"id": 2, "title": "Speed Demon"}]'::jsonb, false, 1),

(40024, 200024, 'Bukayo', 'Saka', 'B. Saka', 'Saka', 'RW', 114, 3, 2, 178, 72, '2001-09-05',
 '{"id": 14, "name": "England"}'::jsonb, '{"id": 1, "name": "Arsenal"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 3, 2, 5,
 '{"pace": 132, "shooting": 125, "passing": 128, "dribbling": 135, "defense": 70, "physicality": 105}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Saka&background=EF0107&color=fff&size=256"}'::jsonb,
 '[{"id": 5, "title": "Speed Dribbler"}]'::jsonb, false, 4),

-- Strikers (ST/CF) - 4 players
(40025, 200025, 'Robert', 'Lewandowski', 'R. Lewandowski', 'Lewandowski', 'ST', 116, 4, 1, 185, 81, '1988-08-21',
 '{"id": 37, "name": "Poland"}'::jsonb, '{"id": 241, "name": "Barcelona"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 3, 1, 4,
 '{"pace": 118, "shooting": 143, "passing": 120, "dribbling": 125, "defense": 70, "physicality": 130}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Lewandowski&background=004D98&color=fff&size=256"}'::jsonb,
 '[{"id": 6, "title": "Poacher"}, {"id": 9, "title": "Power Header"}]'::jsonb, false, 3),

(40026, 200026, 'Harry', 'Kane', 'H. Kane', 'Kane', 'ST', 117, 4, 1, 188, 86, '1993-07-28',
 '{"id": 14, "name": "England"}'::jsonb, '{"id": 21, "name": "Bayern Munich"}'::jsonb, '{"id": 19, "name": "Bundesliga"}'::jsonb, 3, 2, 3,
 '{"pace": 115, "shooting": 142, "passing": 125, "dribbling": 118, "defense": 72, "physicality": 128}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Kane&background=DC052D&color=fff&size=256"}'::jsonb,
 '[{"id": 1, "title": "Power Header"}, {"id": 7, "title": "Clinical Finisher"}]'::jsonb, false, 2),

(40027, 200027, 'Victor', 'Osimhen', 'V. Osimhen', 'Osimhen', 'ST', 114, 4, 1, 186, 80, '1998-12-29',
 '{"id": 54, "name": "Nigeria"}'::jsonb, '{"id": 48, "name": "Napoli"}'::jsonb, '{"id": 31, "name": "Serie A"}'::jsonb, 3, 2, 3,
 '{"pace": 142, "shooting": 135, "passing": 108, "dribbling": 122, "defense": 68, "physicality": 125}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Osimhen&background=1B91D3&color=fff&size=256"}'::jsonb,
 '[{"id": 2, "title": "Speed Demon"}]'::jsonb, false, 5),

(40028, 200028, 'Lautaro', 'Martinez', 'L. Martinez', 'Martinez', 'ST', 113, 4, 1, 174, 72, '1997-08-22',
 '{"id": 52, "name": "Argentina"}'::jsonb, '{"id": 44, "name": "Inter Milan"}'::jsonb, '{"id": 31, "name": "Serie A"}'::jsonb, 3, 2, 4,
 '{"pace": 128, "shooting": 138, "passing": 115, "dribbling": 130, "defense": 70, "physicality": 118}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Martinez&background=010E80&color=fff&size=256"}'::jsonb,
 '[{"id": 7, "title": "Clinical Finisher"}]'::jsonb, false, 0),

-- Additional versatile players
(40029, 200029, 'Phil', 'Foden', 'P. Foden', 'Foden', 'CAM', 114, 3, 2, 171, 69, '2000-05-28',
 '{"id": 14, "name": "England"}'::jsonb, '{"id": 10, "name": "Manchester City"}'::jsonb, '{"id": 13, "name": "Premier League"}'::jsonb, 3, 2, 5,
 '{"pace": 128, "shooting": 125, "passing": 130, "dribbling": 138, "defense": 75, "physicality": 100}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Foden&background=6CABDD&color=fff&size=256"}'::jsonb,
 '[{"id": 5, "title": "Speed Dribbler"}]'::jsonb, false, 5),

(40030, 200030, 'Federico', 'Valverde', 'F. Valverde', 'Valverde', 'CM', 115, 4, 1, 182, 78, '1998-07-22',
 '{"id": 60, "name": "Uruguay"}'::jsonb, '{"id": 243, "name": "Real Madrid"}'::jsonb, '{"id": 2118, "name": "La Liga"}'::jsonb, 3, 3, 3,
 '{"pace": 130, "shooting": 128, "passing": 125, "dribbling": 122, "defense": 110, "physicality": 120}'::jsonb,
 '{"playerCardImage": "https://ui-avatars.com/api/?name=Valverde&background=D4AF37&color=fff&size=256"}'::jsonb,
 '[{"id": 22, "title": "Box to Box"}]'::jsonb, false, 1);