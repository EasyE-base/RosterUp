-- First, get all policy names and drop them
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;

    -- Drop all policies on organizations table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'organizations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON organizations';
    END LOOP;

    -- Drop all policies on players table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'players') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON players';
    END LOOP;
END $$;

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
