-- List all profiles in the table
SELECT
  id,
  email,
  full_name,
  user_type,
  created_at
FROM profiles
ORDER BY created_at DESC;
