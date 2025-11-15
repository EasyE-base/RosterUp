-- Check team_members table schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'team_members'
ORDER BY ordinal_position;
