-- Fix RLS Policies for Profiles Table
-- This ensures users can create and view their own profiles

-- First, make sure the profiles table allows inserts from authenticated users
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Also fix organizations policies
DROP POLICY IF EXISTS "Organizations can insert their own data" ON organizations;

CREATE POLICY "Organizations can insert their own data"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix players policies
DROP POLICY IF EXISTS "Players can insert their own data" ON players;

CREATE POLICY "Players can insert their own data"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully!';
END $$;