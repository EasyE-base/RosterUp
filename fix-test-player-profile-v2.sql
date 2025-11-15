-- Insert profile for Test Player with user_type
INSERT INTO profiles (id, email, full_name, user_type, updated_at)
VALUES (
  '3231a3c2-2a31-41be-a48d-106ac1e169bb',
  'testplayer@rosterup.com',
  'Test Player',
  'player',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Test Player',
  email = 'testplayer@rosterup.com',
  user_type = 'player',
  updated_at = NOW();

-- Verify it was added
SELECT
  p.id,
  p.full_name,
  p.email,
  p.user_type,
  pp.photo_url
FROM profiles p
LEFT JOIN player_profiles pp ON pp.user_id = p.id
WHERE p.id = '3231a3c2-2a31-41be-a48d-106ac1e169bb';
