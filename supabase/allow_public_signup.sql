-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read for anon during auth" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Allow anyone to insert profiles (needed for signup)
CREATE POLICY "Anyone can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Also need to update organizations and players tables
DROP POLICY IF EXISTS "Users can insert their own organization" ON organizations;
DROP POLICY IF EXISTS "Organizations can view their own data" ON organizations;
DROP POLICY IF EXISTS "Organizations can update their own data" ON organizations;

CREATE POLICY "Anyone can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Organizations can view their own data"
  ON organizations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organizations can update their own data"
  ON organizations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Players can insert their own data" ON players;
DROP POLICY IF EXISTS "Players can view their own data" ON players;
DROP POLICY IF EXISTS "Players can update their own data" ON players;

CREATE POLICY "Anyone can insert players"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can view their own data"
  ON players FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Players can update their own data"
  ON players FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
