-- Quick Add Trainer via SQL (bypasses all rate limits)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql/new

-- This creates a test trainer account you can immediately log in with

BEGIN;

-- Step 1: Insert into auth.users (this is the login credentials)
-- IMPORTANT: Change the email and encrypted_password as needed
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),  -- This generates a new UUID
  'authenticated',
  'authenticated',
  'trainer@test.com',  -- CHANGE THIS to your email
  crypt('password123', gen_salt('bf')),  -- CHANGE 'password123' to your desired password
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Trainer"}'  -- CHANGE THIS to your name
)
RETURNING id;

-- Note the ID that gets returned above, or we'll use a variable

-- Step 2: Get the user ID we just created
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Get the most recently created user (the one we just made)
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'trainer@test.com'  -- MUST match the email above
  ORDER BY created_at DESC
  LIMIT 1;

  -- Step 3: Create profile
  INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
  VALUES (
    new_user_id,
    'trainer@test.com',  -- MUST match the email above
    'Test Trainer',  -- CHANGE THIS to your name
    'trainer',
    NOW(),
    NOW()
  );

  -- Step 4: Create trainer record
  INSERT INTO trainers (
    user_id,
    sports,
    specializations,
    is_featured,
    featured_priority,
    created_at
  ) VALUES (
    new_user_id,
    ARRAY['Baseball']::text[],
    ARRAY['Hitting', 'Fielding']::text[],
    false,
    0,
    NOW()
  );

  RAISE NOTICE 'Success! Created trainer account with ID: %', new_user_id;
END $$;

COMMIT;

-- Verify it worked
SELECT
  u.id,
  u.email,
  p.full_name,
  p.user_type,
  t.id as trainer_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN trainers t ON u.id = t.user_id
WHERE u.email = 'trainer@test.com'  -- MUST match the email above
LIMIT 1;
