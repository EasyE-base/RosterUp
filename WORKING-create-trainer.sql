-- THIS WILL ACTUALLY WORK - Accounts for Supabase's auto-profile-creation trigger

-- Step 1: Fix the constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('organization', 'player', 'trainer'));

-- Step 2: Create trainer
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
  'workingtrainer@test.com',
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
  WHERE email = 'workingtrainer@test.com'
  ORDER BY created_at DESC
  LIMIT 1;

  -- UPSERT instead of INSERT (because Supabase auto-creates profiles)
  INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
  VALUES (
    new_user_id,
    'workingtrainer@test.com',
    'Test Trainer',
    'trainer',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    user_type = 'trainer',
    full_name = 'Test Trainer',
    email = 'workingtrainer@test.com';

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
  )
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE '✅✅✅ SUCCESS! Login: workingtrainer@test.com / password123';
END $$;

COMMIT;

SELECT 'SUCCESS! Login at http://localhost:5173/login with: workingtrainer@test.com / password123' as message;
