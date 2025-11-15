-- Populate profiles table with full_name for all player_profiles users
INSERT INTO profiles (id, email, full_name, updated_at)
SELECT
  pp.user_id as id,
  'player' || ROW_NUMBER() OVER() || '@test.com' as email,
  CASE
    WHEN pp.user_id = '3231a3c2-2a31-41be-a48d-106ac1e169bb' THEN 'Test Player'
    ELSE 'Player ' || ROW_NUMBER() OVER()
  END as full_name,
  NOW() as updated_at
FROM player_profiles pp
WHERE pp.user_id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    updated_at = EXCLUDED.updated_at;

-- Verify the result
SELECT
  pp.id,
  pp.sport,
  p.full_name,
  p.email
FROM player_profiles pp
LEFT JOIN profiles p ON pp.user_id = p.id
ORDER BY p.full_name;
