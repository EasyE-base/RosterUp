-- Allow public read access to profiles table for joins
-- This is needed so player profiles can display names

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create policy to allow anyone to read profiles (needed for joins in player_profiles queries)
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (true);

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
