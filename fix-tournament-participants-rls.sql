-- Fix RLS policies for tournament_participants table
-- This fixes the 400 errors when trying to query or insert tournament participants

-- First, enable RLS if not already enabled
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view tournament participants" ON tournament_participants;
DROP POLICY IF EXISTS "Organizations can manage tournament participants" ON tournament_participants;
DROP POLICY IF EXISTS "Users can view tournament participants" ON tournament_participants;
DROP POLICY IF EXISTS "Organizations can create tournament participants" ON tournament_participants;

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
