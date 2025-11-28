-- Remove UNIQUE constraint on organizations.user_id
-- This allows users to create and manage multiple organizations
-- Run this in Supabase Dashboard > SQL Editor

-- Drop the unique constraint on user_id
ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS organizations_user_id_key;

-- Verify the constraint has been removed
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE conrelid = 'organizations'::regclass
AND conname LIKE '%user_id%';

-- Show current organizations table structure
\d organizations;
