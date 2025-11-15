-- First, drop all existing policies on tryout_applications
DROP POLICY IF EXISTS "Players can create their own applications" ON tryout_applications;
DROP POLICY IF EXISTS "Players can view their own applications" ON tryout_applications;
DROP POLICY IF EXISTS "Players can update their own applications" ON tryout_applications;

-- Allow players to INSERT their own applications
CREATE POLICY "allow_insert_own_applications"
ON tryout_applications
FOR INSERT
TO authenticated
WITH CHECK (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Allow players to SELECT their own applications
CREATE POLICY "allow_select_own_applications"
ON tryout_applications
FOR SELECT
TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Allow players to UPDATE their own applications
CREATE POLICY "allow_update_own_applications"
ON tryout_applications
FOR UPDATE
TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);
