-- Fix all RLS policies and table issues
-- Run this in Supabase SQL Editor

-- ================================================
-- FIX 1: Guest Players RLS Policies
-- ================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Players can insert their own guest applications" ON guest_players;
DROP POLICY IF EXISTS "Players can view their own guest applications" ON guest_players;
DROP POLICY IF EXISTS "Players can update their own guest applications" ON guest_players;
DROP POLICY IF EXISTS "Players can delete their own guest applications" ON guest_players;
DROP POLICY IF EXISTS "Organizations can view guest players for their tournaments" ON guest_players;

-- Allow players to insert their own guest applications
CREATE POLICY "Players can insert their own guest applications"
ON guest_players
FOR INSERT
TO authenticated
WITH CHECK (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Allow players to view their own guest applications
CREATE POLICY "Players can view their own guest applications"
ON guest_players
FOR SELECT
TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Allow players to update their own guest applications
CREATE POLICY "Players can update their own guest applications"
ON guest_players
FOR UPDATE
TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Allow players to delete their own guest applications
CREATE POLICY "Players can delete their own guest applications"
ON guest_players
FOR DELETE
TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Allow organizations to view guest players for their tournaments
CREATE POLICY "Organizations can view guest players for their tournaments"
ON guest_players
FOR SELECT
TO authenticated
USING (
  tournament_id IN (
    SELECT t.id
    FROM tournaments t
    JOIN organizations o ON o.id = t.organization_id
    WHERE o.user_id = auth.uid()
  )
);

-- ================================================
-- FIX 2: Player Stats RLS Policies
-- ================================================

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

-- ================================================
-- Verify all policies were created
-- ================================================

SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('guest_players', 'player_stats')
ORDER BY tablename, policyname;
