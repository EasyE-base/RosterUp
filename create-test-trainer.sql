-- Create a test trainer account
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql

-- Step 1: Create auth user (replace YOUR_EMAIL and YOUR_PASSWORD)
-- Note: You'll need to do this part in the Supabase Auth UI, or use this as a template

-- Step 2: After creating the auth user, get their ID and run this:
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users

-- Create profile
INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'your-email@example.com',  -- Replace with your email
  'Test Trainer',
  'trainer',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET user_type = 'trainer';

-- Create trainer record
INSERT INTO trainers (
  user_id,
  sports,
  specializations,
  is_featured,
  featured_priority,
  created_at
)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  ARRAY['Baseball']::text[],
  ARRAY['Hitting', 'Fielding']::text[],
  false,
  0,
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the records were created
SELECT
  u.id,
  u.email,
  p.full_name,
  p.user_type,
  t.id as trainer_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN trainers t ON u.id = t.user_id
WHERE u.email = 'your-email@example.com';  -- Replace with your email
