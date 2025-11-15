-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Players can create their own applications" ON tryout_applications;

-- Create the correct RLS policy for tryout applications
-- This allows players to insert applications only for their own player_profile
CREATE POLICY "Players can create their own applications"
ON tryout_applications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM player_profiles
    WHERE player_profiles.id = tryout_applications.player_id
    AND player_profiles.user_id = auth.uid()
  )
);

-- Also add a policy to allow players to read their own applications
DROP POLICY IF EXISTS "Players can view their own applications" ON tryout_applications;

CREATE POLICY "Players can view their own applications"
ON tryout_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM player_profiles
    WHERE player_profiles.id = tryout_applications.player_id
    AND player_profiles.user_id = auth.uid()
  )
);

-- Allow players to update their own applications (e.g., withdraw)
DROP POLICY IF EXISTS "Players can update their own applications" ON tryout_applications;

CREATE POLICY "Players can update their own applications"
ON tryout_applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM player_profiles
    WHERE player_profiles.id = tryout_applications.player_id
    AND player_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM player_profiles
    WHERE player_profiles.id = tryout_applications.player_id
    AND player_profiles.user_id = auth.uid()
  )
);
