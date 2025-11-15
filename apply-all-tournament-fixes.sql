-- Complete fix for tournament_participants table
-- This combines all necessary changes in one file

-- ============================================
-- PART 1: Add missing status column
-- ============================================

ALTER TABLE tournament_participants
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed'
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'waitlist'));

COMMENT ON COLUMN tournament_participants.status IS 'Registration status: pending, confirmed, cancelled, or waitlist';

-- ============================================
-- PART 2: Fix RLS policies
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view tournament participants" ON tournament_participants;
DROP POLICY IF EXISTS "Organizations can manage tournament participants" ON tournament_participants;
DROP POLICY IF EXISTS "Users can view tournament participants" ON tournament_participants;
DROP POLICY IF EXISTS "Organizations can create tournament participants" ON tournament_participants;
DROP POLICY IF EXISTS "Organizations can register teams" ON tournament_participants;
DROP POLICY IF EXISTS "Organizations can update their registrations" ON tournament_participants;
DROP POLICY IF EXISTS "Organizations can delete their registrations" ON tournament_participants;
DROP POLICY IF EXISTS "Tournament hosts can manage participants" ON tournament_participants;

-- Policy 1: Anyone can view tournament participants (for public tournament viewing)
CREATE POLICY "Anyone can view tournament participants"
  ON tournament_participants FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy 2: Organizations can insert their own team registrations
CREATE POLICY "Organizations can register teams"
  ON tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Policy 3: Organizations can update their own registrations
CREATE POLICY "Organizations can update their registrations"
  ON tournament_participants FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Policy 4: Organizations can delete their own registrations
CREATE POLICY "Organizations can delete their registrations"
  ON tournament_participants FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Policy 5: Tournament hosts can manage all participants for their tournaments
CREATE POLICY "Tournament hosts can manage participants"
  ON tournament_participants FOR ALL
  TO authenticated
  USING (
    tournament_id IN (
      SELECT id FROM tournaments
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    tournament_id IN (
      SELECT id FROM tournaments
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'tournament_participants'
AND column_name = 'status';

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'tournament_participants';

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'tournament_participants';
