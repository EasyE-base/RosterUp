-- Update Organization Logo URLs
-- Run this in Supabase Dashboard > SQL Editor
-- This uses placeholder images from various sources

-- Update Diamond Elite Softball
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=DiamondElite&backgroundColor=1e40af&scale=80'
WHERE name = 'Diamond Elite Softball';

-- Update Thunder Fastpitch
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Thunder&backgroundColor=7c3aed&scale=80'
WHERE name = 'Thunder Fastpitch';

-- Update Lady Lightning Softball
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Lightning&backgroundColor=eab308&scale=80'
WHERE name = 'Lady Lightning Softball';

-- Update Carolina Crush Fastpitch
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Crush&backgroundColor=dc2626&scale=80'
WHERE name = 'Carolina Crush Fastpitch';

-- Update Firecrackers Softball
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Firecrackers&backgroundColor=ea580c&scale=80'
WHERE name = 'Firecrackers Softball';

-- Update Aces Fastpitch
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Aces&backgroundColor=0891b2&scale=80'
WHERE name = 'Aces Fastpitch';

-- Update Southern Storm Softball
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Storm&backgroundColor=059669&scale=80'
WHERE name = 'Southern Storm Softball';

-- Update Gator Fastpitch
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Gator&backgroundColor=16a34a&scale=80'
WHERE name = 'Gator Fastpitch';

-- Update Batbusters Softball
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Batbusters&backgroundColor=9333ea&scale=80'
WHERE name = 'Batbusters Softball';

-- Update Gold Coast Hurricanes
UPDATE organizations
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Hurricanes&backgroundColor=0071e3&scale=80'
WHERE name = 'Gold Coast Hurricanes';

-- Verify updates
SELECT
  name,
  city,
  state,
  CASE
    WHEN logo_url IS NOT NULL THEN '✅ Logo Set'
    ELSE '❌ No Logo'
  END as logo_status,
  logo_url
FROM organizations
WHERE name LIKE '%Elite%'
   OR name LIKE '%Thunder%'
   OR name LIKE '%Lightning%'
   OR name LIKE '%Crush%'
   OR name LIKE '%Firecrackers%'
   OR name LIKE '%Aces%'
   OR name LIKE '%Storm%'
   OR name LIKE '%Gator%'
   OR name LIKE '%Batbusters%'
   OR name LIKE '%Hurricanes%'
ORDER BY name;
