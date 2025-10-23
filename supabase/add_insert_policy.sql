-- Add missing INSERT policy for profiles (only if it doesn't exist)

-- Check if the INSERT policy exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);

    RAISE NOTICE 'INSERT policy for profiles created successfully!';
  ELSE
    RAISE NOTICE 'INSERT policy for profiles already exists.';
  END IF;
END $$;

-- Check and add INSERT policy for organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'organizations'
    AND policyname = 'Organizations can insert their own data'
  ) THEN
    CREATE POLICY "Organizations can insert their own data"
      ON organizations FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    RAISE NOTICE 'INSERT policy for organizations created successfully!';
  ELSE
    RAISE NOTICE 'INSERT policy for organizations already exists.';
  END IF;
END $$;

-- Check and add INSERT policy for players
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'players'
    AND policyname = 'Players can insert their own data'
  ) THEN
    CREATE POLICY "Players can insert their own data"
      ON players FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    RAISE NOTICE 'INSERT policy for players created successfully!';
  ELSE
    RAISE NOTICE 'INSERT policy for players already exists.';
  END IF;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'All INSERT policies have been verified/created!';
  RAISE NOTICE 'You can now sign up users in your application.';
  RAISE NOTICE '==============================================';
END $$;