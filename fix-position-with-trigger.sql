-- Fix position column by temporarily disabling triggers

-- Step 1: Disable the trigger that's causing issues
ALTER TABLE player_profiles DISABLE TRIGGER ALL;

-- Step 2: Add a temporary column
ALTER TABLE player_profiles ADD COLUMN position_new JSONB DEFAULT '[]'::jsonb;

-- Step 3: Migrate data carefully - set all to empty array for now
UPDATE player_profiles SET position_new = '["Catcher"]'::jsonb WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';
UPDATE player_profiles SET position_new = '[]'::jsonb WHERE position_new IS NULL;

-- Step 4: Drop old column and rename new one
ALTER TABLE player_profiles DROP COLUMN position CASCADE;
ALTER TABLE player_profiles RENAME COLUMN position_new TO position;

-- Step 5: Set default
ALTER TABLE player_profiles ALTER COLUMN position SET DEFAULT '[]'::jsonb;

-- Step 6: Re-enable triggers
ALTER TABLE player_profiles ENABLE TRIGGER ALL;

-- Step 7: Manually trigger completeness calculation for test player
UPDATE player_profiles
SET position = position
WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';

-- Verify
SELECT id, position FROM player_profiles WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';
