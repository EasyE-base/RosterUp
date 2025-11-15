-- ============================================
-- CREATE 10 SOFTBALL TEST PLAYERS
-- Run this in Supabase SQL Editor
-- ============================================

DO $$
DECLARE
  test_user_id UUID;
BEGIN

-- Player 1: Elite Pitcher (16U, California)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball1@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball1@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball1@test.com', 'player', 'Emma Rodriguez')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '16U',
  'A',
  'Pitcher',
  'Elite level pitcher with 4 years varsity experience. Led my team to state championships with a 1.2 ERA and 150+ strikeouts. Strong fastball (65mph), devastating drop ball, and solid change-up. Competed in PGF Nationals and Junior Olympics. Looking for top-tier college showcase opportunities and elite travel team.',
  'San Diego',
  'CA',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 2: Catcher (14U, Texas)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball2@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball2@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball2@test.com', 'player', 'Sophia Chen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '14U',
  'A',
  'Catcher',
  'Strong defensive catcher with excellent game management skills. 2.0 pop time and .975 fielding percentage. Great at framing pitches and calling games. Also contribute offensively hitting .340 with power. Team captain and vocal leader behind the plate.',
  'Houston',
  'TX',
  'https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 3: Shortstop (18U, Florida)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball3@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball3@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball3@test.com', 'player', 'Ava Williams')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '18U',
  'A',
  'Shortstop',
  'Dynamic shortstop with exceptional range and strong arm. Committed to D1 program. Hit .385 with 15 stolen bases last season. Great at turning double plays and making highlight-reel defensive plays. 4-year varsity starter looking for final summer showcase team.',
  'Tampa',
  'FL',
  'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 4: First Base (16U, Illinois)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball4@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball4@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball4@test.com', 'player', 'Madison Thompson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '16U',
  'B',
  'First Base',
  'Power hitter and solid first baseman. Hit .365 with 18 home runs and 50 RBIs last season. Good at scooping throws and stretching for outs. Reliable fielder who can also pitch in relief. Looking for competitive B/A level travel team.',
  'Chicago',
  'IL',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 5: Outfielder (15U, Georgia)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball5@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball5@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball5@test.com', 'player', 'Isabella Garcia')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '15U',
  'ALL_STARS',
  'Outfielder',
  'Fast and powerful center fielder with elite speed and strong throwing arm. Hit .380 with 12 home runs and 25 stolen bases. Great instincts tracking fly balls and running down gaps. Member of state all-star team. Seeking elite showcase opportunities.',
  'Atlanta',
  'GA',
  'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 6: Second Base (14U, Arizona)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball6@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball6@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball6@test.com', 'player', 'Mia Patel')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '14U',
  'B',
  'Second Base',
  'Scrappy second baseman with great hands and quick feet. Good at turning double plays and covering ground up the middle. Contact hitter with .350 average and excellent bunting skills. High energy player who hustles on every play.',
  'Phoenix',
  'AZ',
  'https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 7: Third Base (12U, California)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball7@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball7@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball7@test.com', 'player', 'Chloe Anderson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '12U',
  'C',
  'Third Base',
  'Quick reflexes at the hot corner with improving arm strength. Love diving for balls and making tough plays. Working hard on hitting mechanics and getting stronger. First year in travel ball and super excited to learn and compete!',
  'Sacramento',
  'CA',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 8: Pitcher/Utility (16U, Oklahoma)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball8@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball8@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball8@test.com', 'player', 'Peyton Miller')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '16U',
  'B',
  'Pitcher',
  'Versatile pitcher who can also play multiple positions. 62mph fastball with good movement and control. Hit .310 as utility player when not pitching. Team player willing to do whatever helps the team win. Looking for competitive summer team.',
  'Oklahoma City',
  'OK',
  'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 9: Outfielder (10U, Washington)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball9@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball9@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball9@test.com', 'player', 'Harper Davis')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '10U',
  'REC',
  'Outfielder',
  'Enthusiastic young player who loves softball! Fast runner learning to track fly balls and improving batting skills every practice. First year playing organized softball and having so much fun with my teammates. Want to play travel ball next year!',
  'Seattle',
  'WA',
  'https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 10: Shortstop (14U, North Carolina)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'softball10@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'softball10@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'softball10@test.com', 'player', 'Brooklyn Martinez')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '14U',
  'C',
  'Shortstop',
  'Athletic shortstop with good range and developing skills. Working on arm strength and consistency on throws. Hit .280 last season and improving every game. Great attitude and love to compete. Looking for developmental team to grow with.',
  'Charlotte',
  'NC',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

END $$;

-- Verify the softball players were created
SELECT
  pp.id,
  p.full_name,
  pp.sport,
  pp.age_group,
  pp.classification,
  pp.position,
  pp.location_city,
  pp.location_state,
  pp.profile_completeness
FROM player_profiles pp
JOIN profiles p ON pp.user_id = p.id
WHERE pp.sport = 'Softball'
ORDER BY pp.created_at DESC;
