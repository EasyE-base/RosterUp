-- Fix RLS policies for player_stats table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Players can view their own stats" ON player_stats;
DROP POLICY IF EXISTS "Public can view player stats" ON player_stats;

-- Allow players to view their own stats
CREATE POLICY "Players can view their own stats"
ON player_stats
FOR SELECT
TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Allow public to view player stats (for public profiles)
CREATE POLICY "Public can view player stats"
ON player_stats
FOR SELECT
TO public
USING (true);

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'player_stats'
ORDER BY policyname;
