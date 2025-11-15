-- Update player_profiles.position to support multiple positions
-- Change from TEXT to JSONB array

-- First, convert existing position data to JSONB array format
UPDATE player_profiles
SET position = jsonb_build_array(position)::text::jsonb
WHERE position IS NOT NULL AND position != '';

-- Update NULL or empty positions to empty array
UPDATE player_profiles
SET position = '[]'::jsonb
WHERE position IS NULL OR position = '';

-- Now alter the column type to JSONB
ALTER TABLE player_profiles
ALTER COLUMN position TYPE JSONB USING position::jsonb;

-- Set default to empty array
ALTER TABLE player_profiles
ALTER COLUMN position SET DEFAULT '[]'::jsonb;
