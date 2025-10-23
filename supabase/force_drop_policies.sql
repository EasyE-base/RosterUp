-- Force drop all known policies
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles CASCADE;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON profiles CASCADE;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles CASCADE;
DROP POLICY IF EXISTS "Enable read for anon during auth" ON profiles CASCADE;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles CASCADE;

DROP POLICY IF EXISTS "Anyone can insert organizations" ON organizations CASCADE;
DROP POLICY IF EXISTS "Users can insert their own organization" ON organizations CASCADE;
DROP POLICY IF EXISTS "Organizations can view their own data" ON organizations CASCADE;
DROP POLICY IF EXISTS "Organizations can update their own data" ON organizations CASCADE;

DROP POLICY IF EXISTS "Anyone can insert players" ON players CASCADE;
DROP POLICY IF EXISTS "Players can insert their own data" ON players CASCADE;
DROP POLICY IF EXISTS "Players can view their own data" ON players CASCADE;
DROP POLICY IF EXISTS "Players can update their own data" ON players CASCADE;

-- Now create fresh policies for profiles
CREATE POLICY "Anyone can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for organizations
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

-- Policies for players
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
