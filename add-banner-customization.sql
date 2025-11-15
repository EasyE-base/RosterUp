-- Add banner customization columns to player_profiles table

-- Add banner_url column for custom banner images
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add banner_color column for solid color banners (stores hex color like '#3b82f6')
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS banner_color TEXT DEFAULT '#1e3a8a';

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'player_profiles'
  AND column_name IN ('banner_url', 'banner_color')
ORDER BY column_name;
