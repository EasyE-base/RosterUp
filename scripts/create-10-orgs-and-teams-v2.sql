-- Create 10 Softball Organizations with Teams (Simplified)
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's check what columns exist in organizations table
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'organizations';

-- Step 1: Create organizations (using only basic columns)
INSERT INTO organizations (name, primary_sport, city, state)
VALUES
  ('Lady Bandits Softball', 'Softball', 'Baltimore', 'Maryland'),
  ('Flemington Flames', 'Softball', 'Flemington', 'New Jersey'),
  ('Maryland Sting Softball', 'Softball', 'Annapolis', 'Maryland'),
  ('Neshaminy Shock Travel Softball', 'Softball', 'Langhorne', 'Pennsylvania'),
  ('Bama Slammers Fastpitch', 'Softball', 'Philadelphia', 'Pennsylvania'),
  ('Boom Williston Fastpitch', 'Softball', 'Wilmington', 'Delaware'),
  ('Ohio Lasers Softball', 'Softball', 'Richmond', 'Virginia'),
  ('Worthington Spirit Softball', 'Softball', 'Arlington', 'Virginia'),
  ('Storm Travel Softball', 'Softball', 'Dover', 'Delaware'),
  ('Illinois Lightning Travel Softball', 'Softball', 'Trenton', 'New Jersey')
RETURNING id, name, city, state;

-- Step 2: Create teams (one per organization)
-- We'll use the organization IDs from the previous insert

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
  classification,
  season,
  status
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
  CASE row_num
    WHEN 1 THEN 'A'
    WHEN 2 THEN 'B'
    WHEN 3 THEN 'A'
    WHEN 4 THEN 'C'
    WHEN 5 THEN 'B'
    WHEN 6 THEN 'A'
    WHEN 7 THEN 'B'
    WHEN 8 THEN 'C'
    WHEN 9 THEN 'A'
    WHEN 10 THEN 'B'
  END,
  'Spring 2025',
  'active'
FROM org_ids
RETURNING id, name, age_group, classification;

-- Step 3: Verify the results
SELECT
  o.name as organization,
  o.city,
  o.state,
  t.name as team,
  t.age_group,
  t.classification
FROM organizations o
LEFT JOIN teams t ON t.organization_id = o.id
WHERE o.primary_sport = 'Softball'
ORDER BY o.created_at DESC
LIMIT 10;
