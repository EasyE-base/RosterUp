-- Delete the broken test users
-- User IDs from the console logs:
-- 9b3d4597-16f0-4bff-ba21-bb7bf1e38a03
-- 04f09a0b-32da-4423-98f1-d4c8b95c7a23

-- Delete from profiles (this should cascade to other tables)
DELETE FROM profiles WHERE id IN (
  '9b3d4597-16f0-4bff-ba21-bb7bf1e38a03',
  '04f09a0b-32da-4423-98f1-d4c8b95c7a23'
);

-- Verify deletion
SELECT id, email, user_type FROM profiles
WHERE id IN (
  '9b3d4597-16f0-4bff-ba21-bb7bf1e38a03',
  '04f09a0b-32da-4423-98f1-d4c8b95c7a23'
);
