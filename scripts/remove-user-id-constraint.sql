-- Remove unique constraint on organizations.user_id
-- This allows one user to own multiple organizations
-- Run this in Supabase Dashboard > SQL Editor

-- Check if the constraint exists
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'organizations'::regclass
AND conname = 'organizations_user_id_key';

-- Drop the unique constraint
ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS organizations_user_id_key;

-- Verify it's removed
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'organizations'::regclass;
