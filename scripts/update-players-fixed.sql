-- Update 10 Softball Player Profiles with New Data
-- Run this in Supabase SQL Editor

-- First, let's get the player IDs in order
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)

-- Update Player 1: Emma Johnson
, player1 AS (
  UPDATE profiles
  SET full_name = 'Emma Johnson'
  WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 1)
  RETURNING id
)
UPDATE player_profiles
SET
    photo_url = '/players/player1.jpg',
    bio = 'Power pitcher with a 45 mph fastball. Started playing at age 6, loves striking out batters and hitting home runs. Dream is to pitch in college.',
    position = ARRAY['Pitcher', 'First Base'],
    age_group = '10U',
    classification = 'A',
    location_city = 'Phoenix',
    location_state = 'Arizona',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 1);

-- Update Player 2: Sophia Martinez
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Sophia Martinez'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 2);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player2.jpg',
    bio = 'Quick-handed infielder with amazing reflexes. Known for making diving plays and turning double plays. Batting leadoff this season.',
    position = ARRAY['Shortstop', 'Second Base'],
    age_group = '10U',
    classification = 'B',
    location_city = 'Orlando',
    location_state = 'Florida',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 2);

-- Update Player 3: Olivia Chen
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Olivia Chen'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 3);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player3.jpg',
    bio = 'Strong catcher with a cannon arm. Throws out 70% of base stealers. Also bats cleanup and drives in lots of runs. Leadership is her strength.',
    position = ARRAY['Catcher'],
    age_group = '12U',
    classification = 'A',
    location_city = 'Dallas',
    location_state = 'Texas',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 3);

-- Update Player 4: Ava Thompson
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Ava Thompson'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 4);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player4.jpg',
    bio = 'Speedy outfielder who loves chasing down fly balls. Fast runner with a great attitude. Just moved up from coach pitch this year.',
    position = ARRAY['Outfield', 'Third Base'],
    age_group = '8U',
    classification = 'C',
    location_city = 'Seattle',
    location_state = 'Washington',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 4);

-- Update Player 5: Isabella Garcia
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Isabella Garcia'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 5);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player5.jpg',
    bio = 'Ace pitcher with a devastating changeup. 50 mph fastball and great control. Also plays centerfield when not pitching. Team captain.',
    position = ARRAY['Pitcher', 'Outfield'],
    age_group = '12U',
    classification = 'A',
    location_city = 'Atlanta',
    location_state = 'Georgia',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 5);

-- Update Player 6: Mia Anderson
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Mia Anderson'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 6);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player6.jpg',
    bio = 'Power hitter who leads the team in home runs. Great glove at first base. Always encouraging teammates and brings positive energy.',
    position = ARRAY['First Base', 'Third Base'],
    age_group = '10U',
    classification = 'B',
    location_city = 'Denver',
    location_state = 'Colorado',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 6);

-- Update Player 7: Charlotte Williams
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Charlotte Williams'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 7);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player7.jpg',
    bio = 'Smart infielder with excellent footwork. Great at turning double plays and loves baseball. Practices every day in the backyard.',
    position = ARRAY['Second Base', 'Shortstop'],
    age_group = '10U',
    classification = 'C',
    location_city = 'Portland',
    location_state = 'Oregon',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 7);

-- Update Player 8: Amelia Davis
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Amelia Davis'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 8);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player8.jpg',
    bio = 'Speedster in centerfield with great instincts. Covers tons of ground and tracks down every ball. Leadoff hitter with lots of stolen bases.',
    position = ARRAY['Outfield'],
    age_group = '12U',
    classification = 'B',
    location_city = 'Charlotte',
    location_state = 'North Carolina',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 8);

-- Update Player 9: Harper Brown
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Harper Brown'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 9);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player9.jpg',
    bio = 'Fearless third baseman who loves the hot corner. Starting to learn pitching this year. Always first to practice and last to leave.',
    position = ARRAY['Third Base', 'Pitcher'],
    age_group = '8U',
    classification = 'C',
    location_city = 'Nashville',
    location_state = 'Tennessee',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 9);

-- Update Player 10: Evelyn Miller
WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE profiles
SET full_name = 'Evelyn Miller'
WHERE id = (SELECT user_id FROM ordered_players WHERE rn = 10);

WITH ordered_players AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM player_profiles
  WHERE sport = 'Softball'
  LIMIT 10
)
UPDATE player_profiles
SET
    photo_url = '/players/player10.jpg',
    bio = 'Elite shortstop with range and arm strength. Also pitches when needed. Committed to playing high school ball. Team MVP last season.',
    position = ARRAY['Shortstop', 'Pitcher'],
    age_group = '12U',
    classification = 'A',
    location_city = 'Raleigh',
    location_state = 'North Carolina',
    recruiting_status = 'open',
    is_visible_in_search = true,
    is_active = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM ordered_players WHERE rn = 10);

-- Verify the updates
SELECT
    pp.id,
    p.full_name,
    pp.age_group,
    pp.classification,
    pp.position,
    pp.location_city,
    pp.location_state,
    pp.photo_url
FROM player_profiles pp
JOIN profiles p ON pp.user_id = p.id
WHERE pp.sport = 'Softball'
ORDER BY pp.created_at
LIMIT 10;
