-- Allow users to create profiles during signup
-- They need to be able to INSERT before they're fully authenticated

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Allow authenticated users AND the service role to insert profiles
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also ensure anon can read during auth flow
DROP POLICY IF EXISTS "Enable read for anon during auth" ON profiles;

CREATE POLICY "Enable read for anon during auth"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);

SELECT 'Signup policies updated! Try signing up now.' as status;