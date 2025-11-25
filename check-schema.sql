-- Check if profiles table exists and what user_type column looks like
SELECT 
  column_name,
  data_type,
  udt_name,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'user_type';

-- Check for existing enum types
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%user%'
ORDER BY t.typname, e.enumsortorder;
