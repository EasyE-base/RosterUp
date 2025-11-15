-- Drop and recreate the position column to fix corruption
-- Note: This will reset all position data

-- Step 1: Disable only user triggers (not system triggers)
ALTER TABLE player_profiles DISABLE TRIGGER update_player_profile_completeness_trigger;

-- Step 2: Drop the corrupted column (CASCADE to drop dependencies)
ALTER TABLE player_profiles DROP COLUMN position CASCADE;

-- Step 3: Add the column back as JSONB
ALTER TABLE player_profiles ADD COLUMN position JSONB DEFAULT '[]'::jsonb;

-- Step 4: Set the test player's position back to Catcher
UPDATE player_profiles
SET position = '["Catcher"]'::jsonb
WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';

-- Step 5: Re-enable the trigger
ALTER TABLE player_profiles ENABLE TRIGGER update_player_profile_completeness_trigger;

-- Step 6: Update to trigger completeness recalculation
UPDATE player_profiles
SET updated_at = NOW()
WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';

-- Verify
SELECT id, position, profile_completeness
FROM player_profiles
WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';
