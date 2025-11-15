-- Drop and recreate the position column (simplest approach)

-- Drop the corrupted column
ALTER TABLE player_profiles DROP COLUMN IF EXISTS position CASCADE;

-- Add the column back as JSONB
ALTER TABLE player_profiles ADD COLUMN position JSONB DEFAULT '[]'::jsonb;

-- Set the test player's position back to Catcher
UPDATE player_profiles
SET position = '["Catcher"]'::jsonb
WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';

-- Verify
SELECT id, position FROM player_profiles WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';
