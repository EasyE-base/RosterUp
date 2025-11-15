-- ============================================
-- CREATE 20 TEST PLAYER PROFILES
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's create test user accounts and profiles for the players
-- Note: Replace 'your-password-here' with an actual password if you want to login as these users

DO $$
DECLARE
  test_user_id UUID;
  player_profile_id UUID;
BEGIN

-- Player 1: Elite Softball Pitcher (California)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player1@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player1@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player1@test.com', 'player', 'Emma Rodriguez')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '16U',
  'A',
  'Pitcher',
  'Elite level pitcher with 3 years varsity experience. Led my team to state championships with a 1.2 ERA. Strong fastball (65mph) and devastating drop ball. Looking for competitive college showcase opportunities.',
  'San Diego',
  'CA',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 2: Basketball Point Guard (Texas)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player2@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player2@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player2@test.com', 'player', 'Marcus Johnson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Basketball',
  '17U',
  'A',
  'Point Guard',
  'Quick and agile point guard with excellent court vision. Averaged 15 points and 8 assists per game last season. Strong defensive skills and leadership on the court. Seeking AAU team for summer season.',
  'Houston',
  'TX',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 3: Soccer Striker (Florida)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player3@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player3@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player3@test.com', 'player', 'Sofia Martinez')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Soccer',
  '15U',
  'B',
  'Forward/Striker',
  'Dynamic forward with speed and technical skills. Scored 25 goals last season playing club soccer. Strong at creating opportunities and finishing. Looking for competitive travel team.',
  'Miami',
  'FL',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 4: Baseball Catcher (Illinois)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player4@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player4@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player4@test.com', 'player', 'Jake Thompson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Baseball',
  '14U',
  'A',
  'Catcher',
  'Strong defensive catcher with excellent game awareness. Great arm strength with 2.0 pop time. Also contribute offensively with .320 batting average. Team leader and vocal on the field.',
  'Chicago',
  'IL',
  'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 5: Volleyball Middle Blocker (Arizona)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player5@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player5@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player5@test.com', 'player', 'Olivia Chen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Volleyball',
  '16U',
  'B',
  'Middle Blocker',
  'Tall middle blocker (6''1") with strong blocking and quick attacks. Experienced in club volleyball for 4 years. Good at reading opponents and timing blocks. Available for national tournaments.',
  'Phoenix',
  'AZ',
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 6: Football Quarterback (Georgia)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player6@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player6@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player6@test.com', 'player', 'Tyler Brooks')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Football',
  '16U',
  'B',
  'Quarterback',
  'Dual-threat quarterback with strong arm and mobility. 2500 passing yards and 300 rushing yards last season. Good decision maker and team leader. Looking for competitive 7v7 team.',
  'Atlanta',
  'GA',
  'https://images.unsplash.com/photo-1566577739073-0c7a99e0e59c?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 7: Softball Shortstop (New York)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player7@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player7@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player7@test.com', 'player', 'Ava Williams')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '12U',
  'C',
  'Shortstop',
  'Quick and athletic shortstop developing strong fundamentals. Great range and improving arm strength. Love being part of a team and working hard to improve. New to travel ball and excited to learn.',
  'Buffalo',
  'NY',
  'https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 8: Basketball Center (North Carolina)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player8@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player8@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player8@test.com', 'player', 'DeAndre Washington')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Basketball',
  '15U',
  'B',
  'Center',
  'Dominant inside presence at 6''4". Strong rebounder averaging 12 rebounds per game. Developing post moves and mid-range shot. Great work ethic and coachable player.',
  'Charlotte',
  'NC',
  'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 9: Soccer Goalkeeper (Washington)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player9@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player9@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player9@test.com', 'player', 'Ethan Murphy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Soccer',
  '14U',
  'A',
  'Goalkeeper',
  'Fearless goalkeeper with excellent reflexes and positioning. Recorded 8 clean sheets last season. Strong communication skills to organize defense. Training with professional goalkeeper coach.',
  'Seattle',
  'WA',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 10: Baseball Pitcher (Pennsylvania)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player10@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player10@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player10@test.com', 'player', 'Connor Sullivan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Baseball',
  '16U',
  'B',
  'Pitcher',
  'Left-handed pitcher with good control and command. Fastball sits at 82mph with developing curve and changeup. Competed in Perfect Game showcases. Looking for summer travel team.',
  'Philadelphia',
  'PA',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 11: Hockey Center (Minnesota)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player11@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player11@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player11@test.com', 'player', 'Liam Anderson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Hockey',
  '16U',
  'A',
  'Center',
  'Two-way center with strong skating and hockey IQ. 45 points in 30 games last season. Excellent at faceoffs and penalty kill. Looking for Tier 1 AAA team for upcoming season.',
  'Minneapolis',
  'MN',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 12: Lacrosse Attack (Maryland)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player12@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player12@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player12@test.com', 'player', 'Mason Taylor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Lacrosse',
  '15U',
  'B',
  'Attack',
  'Crafty attackman with excellent stick skills and field vision. 50 goals and 30 assists last season. Strong dodging ability and accurate shooter. Seeking competitive club team.',
  'Baltimore',
  'MD',
  'https://images.unsplash.com/photo-1530915534664-42ac3e090d66?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 13: Softball Outfielder (Oklahoma)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player13@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player13@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player13@test.com', 'player', 'Isabella Garcia')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '14U',
  'ALL_STARS',
  'Outfielder',
  'Fast and powerful outfielder with strong throwing arm. Hit .380 with 12 home runs last season. Great instincts in the field and on the bases. Member of state all-star team.',
  'Oklahoma City',
  'OK',
  'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 14: Basketball Shooting Guard (Ohio)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player14@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player14@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player14@test.com', 'player', 'Jordan Davis')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Basketball',
  '14U',
  'C',
  'Shooting Guard',
  'Developing shooter with good form and work ethic. Improving ball handling and defensive fundamentals. Team player who loves the game. Looking for developmental program to grow my skills.',
  'Columbus',
  'OH',
  'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 15: Soccer Midfielder (Colorado)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player15@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player15@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player15@test.com', 'player', 'Mia Patel')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Soccer',
  '13U',
  'B',
  'Midfielder',
  'Box-to-box midfielder with great endurance and passing ability. Good at both attacking and defending. Strong technical skills and soccer IQ. Played ECNL for 2 years.',
  'Denver',
  'CO',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 16: Baseball Outfielder (Michigan)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player16@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player16@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player16@test.com', 'player', 'Ryan Mitchell')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Baseball',
  '12U',
  'REC',
  'Outfielder',
  'Enthusiastic player new to competitive baseball. Fast runner with good instincts. Working on hitting mechanics and fielding. Love the game and want to play at higher level.',
  'Detroit',
  'MI',
  'https://images.unsplash.com/photo-1564567933409-c6e4c659e752?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 17: Volleyball Setter (Oregon)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player17@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player17@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player17@test.com', 'player', 'Grace Kim')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Volleyball',
  '17U',
  'A',
  'Setter',
  'Experienced setter with excellent hands and court awareness. Ran a 5-1 offense last season with 800+ assists. Great at reading blockers and setting tempo. Club volleyball for 5 years.',
  'Portland',
  'OR',
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 18: Football Wide Receiver (Tennessee)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player18@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player18@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player18@test.com', 'player', 'Jaylen Brown')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Football',
  '15U',
  'A',
  'Wide Receiver',
  'Elite route runner with 4.5 40-yard dash speed. 1200 receiving yards and 15 TDs last season. Great hands and body control. Experienced in 7v7 and looking for national exposure.',
  'Nashville',
  'TN',
  'https://images.unsplash.com/photo-1566577739073-0c7a99e0e59c?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 19: Softball Third Baseman (Nevada)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player19@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player19@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player19@test.com', 'player', 'Chloe Anderson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Softball',
  '10U',
  'C',
  'Third Base',
  'Young player learning the game and having fun! Quick reflexes at third base and improving my hitting every day. First year in travel ball and love being on a team.',
  'Las Vegas',
  'NV',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Player 20: Hockey Defenseman (Massachusetts)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'player20@test.com', crypt('testpass123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}', '{}')
ON CONFLICT (email) DO NOTHING
RETURNING id INTO test_user_id;

IF test_user_id IS NULL THEN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'player20@test.com';
END IF;

INSERT INTO profiles (id, email, user_type, full_name)
VALUES (test_user_id, 'player20@test.com', 'player', 'Jack O''Brien')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_profiles (user_id, sport, age_group, classification, position, bio, location_city, location_state, photo_url, is_active, is_visible_in_search)
VALUES (
  test_user_id,
  'Hockey',
  '14U',
  'B',
  'Defenseman',
  'Solid two-way defenseman with strong skating and positioning. Good at moving the puck out of the defensive zone. Physical player who plays smart. Looking for competitive AAA program.',
  'Boston',
  'MA',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400',
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;

END $$;

-- Verify the players were created
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
ORDER BY pp.created_at DESC
LIMIT 20;
