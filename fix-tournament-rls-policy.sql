-- Fix RLS policy for tournament inserts
-- The issue: Current policy only has USING clause, which doesn't work for INSERT
-- INSERT operations require WITH CHECK clause

-- Drop the old policy
DROP POLICY IF EXISTS "Organizations can manage their tournaments" ON tournaments;

-- Create proper policy with both USING and WITH CHECK
CREATE POLICY "Organizations can manage their tournaments"
  ON tournaments FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Explanation:
-- USING: Checks existing rows for SELECT, UPDATE, DELETE
-- WITH CHECK: Validates new rows for INSERT and UPDATE
-- Both are needed for "FOR ALL" policy
