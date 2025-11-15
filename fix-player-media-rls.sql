-- Fix RLS policy for player_media to allow INSERT operations
-- The issue: FOR ALL with only USING clause doesn't work for INSERT
-- Solution: Add WITH CHECK clause for INSERT operations

-- Drop the existing broken policy
DROP POLICY IF EXISTS player_media_owner ON player_media;

-- Create a proper policy with both USING and WITH CHECK
-- USING: for SELECT, UPDATE, DELETE (checks existing rows)
-- WITH CHECK: for INSERT, UPDATE (checks new/modified rows)
CREATE POLICY player_media_owner ON player_media
  FOR ALL
  USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

-- Verify the policy exists
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'player_media';
