-- Create sample tryouts
-- First, let's get some team IDs and create tryouts for them

-- Insert sample tryouts (you'll need to replace the team_id and organization_id with actual values from your database)
-- Run this query in Supabase SQL Editor after checking your teams table

-- Get teams and their organization IDs
-- SELECT id, name, sport, organization_id, age_group, gender FROM teams LIMIT 10;

-- Then use those IDs below. Here's a template you can customize:

INSERT INTO tryouts (team_id, organization_id, title, description, sport, date, start_time, end_time, location, address, total_spots, spots_available, requirements, status)
SELECT
  t.id,
  t.organization_id,
  t.name || ' Tryout',
  CASE
    WHEN random() < 0.3 THEN 'Looking for skilled players to join our competitive team. Come showcase your abilities!'
    WHEN random() < 0.6 THEN 'Open tryout for all skill levels. We value teamwork, dedication, and a positive attitude.'
    ELSE 'Elite level tryout for experienced players. Bring your A-game!'
  END,
  t.sport,
  CURRENT_DATE + (random() * 30)::integer,
  ('09:00:00'::time + (random() * interval '8 hours'))::time,
  ('11:00:00'::time + (random() * interval '8 hours'))::time,
  CASE (random() * 7)::integer
    WHEN 0 THEN 'Central Sports Complex'
    WHEN 1 THEN 'Riverside Athletic Fields'
    WHEN 2 THEN 'Community Recreation Center'
    WHEN 3 THEN 'Memorial Stadium'
    WHEN 4 THEN 'Westside Sports Park'
    WHEN 5 THEN 'North County Sportsplex'
    ELSE 'Champions Training Facility'
  END,
  CASE (random() * 7)::integer
    WHEN 0 THEN '123 Main St, San Diego, CA'
    WHEN 1 THEN '456 Oak Avenue, Los Angeles, CA'
    WHEN 2 THEN '789 Pine Road, Phoenix, AZ'
    WHEN 3 THEN '321 Maple Drive, Las Vegas, NV'
    WHEN 4 THEN '654 Elm Street, Dallas, TX'
    WHEN 5 THEN '987 Cedar Lane, Atlanta, GA'
    ELSE '147 Birch Way, Miami, FL'
  END,
  20 + (random() * 30)::integer,
  20 + (random() * 30)::integer,
  '["Athletic shoes and appropriate attire", "Water bottle", "Valid ID or registration form"]'::jsonb,
  'open'
FROM teams t
WHERE t.is_active = true
LIMIT 8;
