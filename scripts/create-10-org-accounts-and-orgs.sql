-- Create 10 Organization User Accounts + Organizations + Teams
-- This creates separate user accounts for each organization
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Create 10 profiles with user_type = 'organization'
-- Note: This creates profiles without auth.users entries
-- In production, you'd use auth.signUp() instead
WITH new_users AS (
  INSERT INTO profiles (id, user_type, email)
  VALUES
    (gen_random_uuid(), 'organization', 'ladybandits@softball.com'),
    (gen_random_uuid(), 'organization', 'flemingtonflames@softball.com'),
    (gen_random_uuid(), 'organization', 'marylandsting@softball.com'),
    (gen_random_uuid(), 'organization', 'neshaminyshock@softball.com'),
    (gen_random_uuid(), 'organization', 'bamaslammers@softball.com'),
    (gen_random_uuid(), 'organization', 'boomwilliston@softball.com'),
    (gen_random_uuid(), 'organization', 'ohiolasers@softball.com'),
    (gen_random_uuid(), 'organization', 'worthingtonspirit@softball.com'),
    (gen_random_uuid(), 'organization', 'stormtravel@softball.com'),
    (gen_random_uuid(), 'organization', 'illinoislightning@softball.com')
  RETURNING id, email
)
SELECT * FROM new_users;

-- Step 2: Create organizations using the new user IDs
WITH user_mapping AS (
  SELECT
    id,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM profiles
  WHERE email LIKE '%@softball.com'
  ORDER BY created_at DESC
  LIMIT 10
)
INSERT INTO organizations (user_id, name, primary_sport, city, state)
SELECT
  id,
  CASE row_num
    WHEN 1 THEN 'Illinois Lightning Travel Softball'
    WHEN 2 THEN 'Storm Travel Softball'
    WHEN 3 THEN 'Worthington Spirit Softball'
    WHEN 4 THEN 'Ohio Lasers Softball'
    WHEN 5 THEN 'Boom Williston Fastpitch'
    WHEN 6 THEN 'Bama Slammers Fastpitch'
    WHEN 7 THEN 'Neshaminy Shock Travel Softball'
    WHEN 8 THEN 'Maryland Sting Softball'
    WHEN 9 THEN 'Flemington Flames'
    WHEN 10 THEN 'Lady Bandits Softball'
  END,
  'Softball',
  CASE row_num
    WHEN 1 THEN 'Trenton'
    WHEN 2 THEN 'Dover'
    WHEN 3 THEN 'Arlington'
    WHEN 4 THEN 'Richmond'
    WHEN 5 THEN 'Wilmington'
    WHEN 6 THEN 'Philadelphia'
    WHEN 7 THEN 'Langhorne'
    WHEN 8 THEN 'Annapolis'
    WHEN 9 THEN 'Flemington'
    WHEN 10 THEN 'Baltimore'
  END,
  CASE row_num
    WHEN 1 THEN 'New Jersey'
    WHEN 2 THEN 'Delaware'
    WHEN 3 THEN 'Virginia'
    WHEN 4 THEN 'Virginia'
    WHEN 5 THEN 'Delaware'
    WHEN 6 THEN 'Pennsylvania'
    WHEN 7 THEN 'Pennsylvania'
    WHEN 8 THEN 'Maryland'
    WHEN 9 THEN 'New Jersey'
    WHEN 10 THEN 'Maryland'
  END
FROM user_mapping
RETURNING id, name, city, state;

-- Step 3: Create teams
WITH org_ids AS (
  SELECT id, name, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM organizations
  WHERE primary_sport = 'Softball'
  ORDER BY created_at DESC
  LIMIT 10
)
INSERT INTO teams (
  organization_id,
  name,
  sport,
  age_group,
  gender,
  season
)
SELECT
  id,
  CASE row_num
    WHEN 1 THEN '18U Elite'
    WHEN 2 THEN '16U Gold'
    WHEN 3 THEN '14U Thunder'
    WHEN 4 THEN '12U Lightning'
    WHEN 5 THEN '16U Fierce'
    WHEN 6 THEN '14U Storm'
    WHEN 7 THEN '18U Impact'
    WHEN 8 THEN '12U Spirit'
    WHEN 9 THEN '16U Dynasty'
    WHEN 10 THEN '14U Elite'
  END,
  'Softball',
  CASE row_num
    WHEN 1 THEN '18U'
    WHEN 2 THEN '16U'
    WHEN 3 THEN '14U'
    WHEN 4 THEN '12U'
    WHEN 5 THEN '16U'
    WHEN 6 THEN '14U'
    WHEN 7 THEN '18U'
    WHEN 8 THEN '12U'
    WHEN 9 THEN '16U'
    WHEN 10 THEN '14U'
  END,
  'Girls',
  'Spring 2025'
FROM org_ids
RETURNING id, name, age_group;

-- Step 4: Verify
SELECT
  o.name as organization,
  o.city,
  o.state,
  p.email as owner_email,
  t.name as team,
  t.age_group
FROM organizations o
JOIN profiles p ON p.id = o.user_id
LEFT JOIN teams t ON t.organization_id = o.id
WHERE o.primary_sport = 'Softball'
ORDER BY o.created_at DESC
LIMIT 10;
