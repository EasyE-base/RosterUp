-- Quick Add Trainer - Ready to Run
-- Just copy this entire file and paste into Supabase SQL Editor
-- https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql/new

BEGIN;

-- Create auth user with credentials
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'trainer@test.com',  -- Login email
  crypt('password123', gen_salt('bf')),  -- Login password
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Trainer"}'
)
RETURNING id;

-- Create profile and trainer records
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Get the user we just created
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'trainer@test.com'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Create profile
  INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
  VALUES (
    new_user_id,
    'trainer@test.com',
    'Test Trainer',
    'trainer',
    NOW(),
    NOW()
  );

  -- Create trainer record
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

  RAISE NOTICE '✅ SUCCESS! Created trainer account with ID: %', new_user_id;
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
WHERE u.email = 'trainer@test.com'
LIMIT 1;
