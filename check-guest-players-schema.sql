-- Check guest_players table schema
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'guest_players'
ORDER BY ordinal_position;

-- Check constraints
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'guest_players';

-- Check if there's already an entry
SELECT * FROM guest_players
WHERE player_id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315'
LIMIT 5;
