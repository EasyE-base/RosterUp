-- Verify the RLS policy for player_media table
-- This query shows the current policy configuration

SELECT
  schemaname,
  tablename,
  policyname,
  cmd as "applies_to",
  qual as "using_clause",
  with_check as "with_check_clause"
FROM pg_policies
WHERE tablename = 'player_media'
ORDER BY policyname;
