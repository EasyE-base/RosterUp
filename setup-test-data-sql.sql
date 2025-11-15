-- Complete Test Data Setup for Guest Player Feature
-- Run with: psql connection-string -f setup-test-data-sql.sql

BEGIN;

-- Generate unique emails for this test run
\set org_email 'test-org-' :EPOCH '@example.com'
\set player_email 'test-player-' :EPOCH '@example.com'

-- Step 1: Create test users in auth.users
-- Note: In production, users would sign up through the UI
-- For testing, we'll create user records directly

-- Organization user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test-org@example.com',
  crypt('TestPass123!', gen_salt('bf')),
  now(),
  '{"account_type": "organization", "full_name": "Test Organization User"}'::jsonb,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
RETURNING id AS org_user_id \gset

-- Player user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test-player@example.com',
  crypt('TestPass123!', gen_salt('bf')),
  now(),
  '{"account_type": "player", "full_name": "Test Player User"}'::jsonb,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
RETURNING id AS player_user_id \gset

\echo 'Created test users'
\echo 'Organization: test-org@example.com / TestPass123!'
\echo 'Player: test-player@example.com / TestPass123!'

-- Step 2: Create organization
INSERT INTO organizations (
  user_id,
  name,
  email,
  primary_sport,
  location_city,
  location_state
) VALUES (
  :'org_user_id',
  'Elite Sports Academy',
  'test-org@example.com',
  'Softball',
  'Los Angeles',
  'CA'
) RETURNING id AS org_id \gset

\echo 'Created organization: Elite Sports Academy'

-- Step 3: Create teams
INSERT INTO teams (
  organization_id,
  name,
  sport,
  age_group,
  season
) VALUES
  (:'org_id', 'Elite Softball Squad', 'Softball', '16U', 'Summer 2025'),
  (:'org_id', 'Elite Softball White', 'Softball', '14U', 'Summer 2025')
RETURNING id AS team_id \gset

\echo 'Created teams'

-- Step 4: Create tournament
INSERT INTO tournaments (
  organization_id,
  title,
  sport,
  age_group,
  start_date,
  end_date,
  registration_deadline,
  location_city,
  location_state,
  location_address,
  max_teams,
  entry_fee,
  status,
  description,
  format_type
) VALUES (
  :'org_id',
  'Summer Showcase Tournament 2025',
  'Softball',
  '16U',
  CURRENT_DATE + INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '32 days',
  CURRENT_DATE + INTERVAL '30 days',
  'Los Angeles',
  'CA',
  '123 Tournament Park Drive',
  16,
  500,
  'open',
  'Premier showcase tournament for elite 16U softball teams.',
  'single_elimination'
) RETURNING id AS tournament_id \gset

\echo 'Created tournament'

-- Step 5: Register team for tournament
INSERT INTO tournament_participants (
  tournament_id,
  team_id,
  organization_id,
  status,
  confirmed_at
) VALUES (
  :'tournament_id',
  :'team_id',
  :'org_id',
  'confirmed',
  now()
);

\echo 'Registered team for tournament'

-- Step 6: Create player profile
INSERT INTO player_profiles (
  user_id,
  sport,
  age_group,
  classification,
  primary_position,
  secondary_positions,
  location_city,
  location_state,
  bio,
  height_feet,
  height_inches,
  weight,
  grad_year,
  gpa,
  act_score
) VALUES (
  :'player_user_id',
  'Softball',
  '16U',
  'High School',
  'Pitcher',
  ARRAY['First Base', 'Outfield'],
  'San Diego',
  'CA',
  'Experienced pitcher looking for tournament opportunities.',
  5,
  9,
  145,
  2026,
  3.8,
  28
) RETURNING id AS player_id \gset

\echo 'Created player profile'

-- Step 7: Apply as guest player
INSERT INTO guest_players (
  tournament_id,
  player_id,
  status,
  updated_at
) VALUES (
  :'tournament_id',
  :'player_id',
  'available',
  now()
);

\echo 'Player applied as guest player'

-- Display summary
\echo ''
\echo '═══════════════════════════════════════════════════════════'
\echo '✨ TEST DATA SETUP COMPLETE! ✨'
\echo '═══════════════════════════════════════════════════════════'
\echo ''
\echo 'ORGANIZATION LOGIN:'
\echo '  Email: test-org@example.com'
\echo '  Password: TestPass123!'
\echo ''
\echo 'PLAYER LOGIN:'
\echo '  Email: test-player@example.com'
\echo '  Password: TestPass123!'
\echo ''
\echo 'Tournament URL:'
\echo '  http://localhost:5173/tournaments/' :tournament_id
\echo ''

COMMIT;
