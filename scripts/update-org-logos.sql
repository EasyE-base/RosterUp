-- Update Organization Logo URLs
-- Run this AFTER creating the 10 organizations
-- Run in Supabase Dashboard > SQL Editor

-- Update logo_url for each organization (if column exists)
-- First check if column exists and add if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'organizations'
    AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE organizations ADD COLUMN logo_url TEXT;
  END IF;
END $$;

-- Update each organization with its logo URL
UPDATE organizations
SET logo_url = CASE
  WHEN name = 'Lady Bandits Softball' THEN '/org-logos/org-1.jpg'
  WHEN name = 'Flemington Flames' THEN '/org-logos/org-2.jpg'
  WHEN name = 'Maryland Sting Softball' THEN '/org-logos/org-3.jpg'
  WHEN name = 'Neshaminy Shock Travel Softball' THEN '/org-logos/org-4.jpg'
  WHEN name = 'Bama Slammers Fastpitch' THEN '/org-logos/org-5.png'
  WHEN name = 'Boom Williston Fastpitch' THEN '/org-logos/org-6.png'
  WHEN name = 'Ohio Lasers Softball' THEN '/org-logos/org-7.jpg'
  WHEN name = 'Worthington Spirit Softball' THEN '/org-logos/org-8.webp'
  WHEN name = 'Storm Travel Softball' THEN '/org-logos/org-9.webp'
  WHEN name = 'Illinois Lightning Travel Softball' THEN '/org-logos/org-10.jpg'
  ELSE logo_url
END
WHERE primary_sport = 'Softball'
AND name IN (
  'Lady Bandits Softball',
  'Flemington Flames',
  'Maryland Sting Softball',
  'Neshaminy Shock Travel Softball',
  'Bama Slammers Fastpitch',
  'Boom Williston Fastpitch',
  'Ohio Lasers Softball',
  'Worthington Spirit Softball',
  'Storm Travel Softball',
  'Illinois Lightning Travel Softball'
);

-- Verify results
SELECT name, city, state, logo_url
FROM organizations
WHERE primary_sport = 'Softball'
ORDER BY created_at DESC
LIMIT 10;
