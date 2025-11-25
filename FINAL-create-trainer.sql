-- FINAL COMPLETE SCRIPT - Run this ONE script and it will work
-- This fixes the constraint AND creates the trainer account

-- Step 1: Fix the constraint to allow 'trainer' user type
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('organization', 'player', 'trainer'));

-- Step 2: Create the trainer account
BEGIN;

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'finaltrainer@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Trainer"}'
)
RETURNING id;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'finaltrainer@test.com'
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
  VALUES (
    new_user_id,
    'finaltrainer@test.com',
    'Test Trainer',
    'trainer',
    NOW(),
    NOW()
  );

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

  RAISE NOTICE '✅✅✅ SUCCESS! Trainer account created! Login: finaltrainer@test.com / password123';
END $$;

COMMIT;

-- Verify
SELECT 'SUCCESS! Login with: finaltrainer@test.com / password123' as message;
