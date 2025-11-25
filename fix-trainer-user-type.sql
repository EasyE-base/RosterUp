-- Fix: Add 'trainer' to profiles user_type constraint
-- Run this in Supabase SQL Editor first

-- Drop the old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- Add new constraint that includes 'trainer'
ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('organization', 'player', 'trainer'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
AND conname = 'profiles_user_type_check';
