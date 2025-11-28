-- Fix incomplete player profiles that are blocking onboarding
-- Run this in Supabase Dashboard > SQL Editor

-- Check current state of player profiles for the two accounts
SELECT
  pp.id,
  pp.user_id,
  p.email,
  p.full_name,
  pp.sport,
  pp.age_group,
  pp.position,
  pp.location_city,
  pp.location_state
FROM player_profiles pp
JOIN profiles p ON p.id = pp.user_id
WHERE pp.user_id IN (
  '3231a3c2-2a31-41be-a48d-106ac1e169bb',  -- Old player (Emma Johnson)
  '34fb834d-0acf-422c-889c-cd3a10e3f568'   -- New player just created
)
ORDER BY pp.created_at DESC;

-- If the new player doesn't have a player_profiles record, create it
INSERT INTO player_profiles (
  user_id,
  sport,
  recruiting_status,
  is_visible_in_search,
  is_active
)
SELECT
  '34fb834d-0acf-422c-889c-cd3a10e3f568',
  'Softball',
  'open',
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM player_profiles
  WHERE user_id = '34fb834d-0acf-422c-889c-cd3a10e3f568'
);

-- Verify the insert
SELECT
  pp.id,
  pp.user_id,
  p.email,
  p.full_name,
  pp.sport,
  pp.recruiting_status
FROM player_profiles pp
JOIN profiles p ON p.id = pp.user_id
WHERE pp.user_id = '34fb834d-0acf-422c-889c-cd3a10e3f568';
