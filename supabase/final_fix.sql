-- FINAL FIX: Just add the missing INSERT policies
-- This script is 100% safe and won't create duplicates

-- Add INSERT policy for profiles
DO $$
BEGIN
  -- Check if policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND policyname = 'Users can insert their own profile'
  ) THEN
    -- Create the policy
    EXECUTE 'CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)';
    RAISE NOTICE '✓ Created INSERT policy for profiles';
  ELSE
    RAISE NOTICE '✓ INSERT policy for profiles already exists';
  END IF;
END $$;

-- Add INSERT policy for organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'organizations'
    AND policyname = 'Organizations can insert their own data'
  ) THEN
    EXECUTE 'CREATE POLICY "Organizations can insert their own data" ON organizations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    RAISE NOTICE '✓ Created INSERT policy for organizations';
  ELSE
    RAISE NOTICE '✓ INSERT policy for organizations already exists';
  END IF;
END $$;

-- Add INSERT policy for players
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'players'
    AND policyname = 'Players can insert their own data'
  ) THEN
    EXECUTE 'CREATE POLICY "Players can insert their own data" ON players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    RAISE NOTICE '✓ Created INSERT policy for players';
  ELSE
    RAISE NOTICE '✓ INSERT policy for players already exists';
  END IF;
END $$;

-- Show completion message
DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SETUP COMPLETE!';
  RAISE NOTICE 'Your app is ready to accept signups.';
  RAISE NOTICE 'Refresh your browser and try signing up!';
  RAISE NOTICE '==========================================';
END $$;