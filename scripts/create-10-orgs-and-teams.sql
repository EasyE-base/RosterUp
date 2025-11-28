-- Create 10 Softball Organizations with Teams
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Create organizations (Mid-Atlantic region)
INSERT INTO organizations (name, primary_sport, city, state, contact_email, contact_phone, logo_url, description, website_url)
VALUES
  (
    'Lady Bandits Softball',
    'Softball',
    'Baltimore',
    'Maryland',
    'contact@ladybandits.com',
    '410-555-0101',
    '/org-logos/org-1.jpg',
    'Elite competitive softball organization dedicated to developing young athletes in the Baltimore area.',
    'https://ladybandits.com'
  ),
  (
    'Flemington Flames',
    'Softball',
    'Flemington',
    'New Jersey',
    'info@flemingtonflames.com',
    '908-555-0102',
    '/org-logos/org-2.jpg',
    'Premier fastpitch softball program serving Central New Jersey with competitive teams and player development.',
    'https://flemingtonflames.com'
  ),
  (
    'Maryland Sting Softball',
    'Softball',
    'Annapolis',
    'Maryland',
    'contact@marylandsting.com',
    '443-555-0103',
    '/org-logos/org-3.jpg',
    'Championship-level softball organization with a focus on skill development and competitive excellence.',
    'https://marylandsting.com'
  ),
  (
    'Neshaminy Shock Travel Softball',
    'Softball',
    'Langhorne',
    'Pennsylvania',
    'info@neshaminshock.com',
    '215-555-0104',
    '/org-logos/org-4.jpg',
    'Travel softball program focused on competitive play and college recruitment opportunities.',
    'https://neshaminshock.com'
  ),
  (
    'Bama Slammers Fastpitch',
    'Softball',
    'Philadelphia',
    'Pennsylvania',
    'contact@bamaslammers.com',
    '215-555-0105',
    '/org-logos/org-5.png',
    'High-performance fastpitch organization with elite coaching and tournament opportunities.',
    'https://bamaslammers.com'
  ),
  (
    'Boom Williston Fastpitch',
    'Softball',
    'Wilmington',
    'Delaware',
    'info@boomwilliston.com',
    '302-555-0106',
    '/org-logos/org-6.png',
    'Dedicated to developing strong, confident softball players through quality coaching and competition.',
    'https://boomwilliston.com'
  ),
  (
    'Ohio Lasers Softball',
    'Softball',
    'Richmond',
    'Virginia',
    'contact@ohiolasers.com',
    '804-555-0107',
    '/org-logos/org-7.jpg',
    'Competitive travel softball organization committed to player development and team success.',
    'https://ohiolasers.com'
  ),
  (
    'Worthington Spirit Softball',
    'Softball',
    'Arlington',
    'Virginia',
    'info@worthingtonspirit.com',
    '703-555-0108',
    '/org-logos/org-8.webp',
    'Building champions on and off the field through dedicated coaching and competitive opportunities.',
    'https://worthingtonspirit.com'
  ),
  (
    'Storm Travel Softball',
    'Softball',
    'Dover',
    'Delaware',
    'contact@stormtravel.com',
    '302-555-0109',
    '/org-logos/org-9.webp',
    'Premier travel softball program providing elite training and competitive tournament play.',
    'https://stormtravel.com'
  ),
  (
    'Illinois Lightning Travel Softball',
    'Softball',
    'Trenton',
    'New Jersey',
    'info@illinoislightning.com',
    '609-555-0110',
    '/org-logos/org-10.jpg',
    'High-level competitive softball organization focused on skill development and college prep.',
    'https://illinoislightning.com'
  )
RETURNING id, name, city, state;

-- Step 2: Create teams (one per organization)
-- We'll use the organization IDs from the previous insert

-- First, let's get the organization IDs
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
