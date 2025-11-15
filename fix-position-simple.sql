-- Simple fix for position column
-- Handle the current corrupted data

-- Step 1: Add a temporary column
ALTER TABLE player_profiles ADD COLUMN position_new JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate data carefully
UPDATE player_profiles
SET position_new =
  CASE
    -- If position looks like valid JSON array, use it
    WHEN position::text ~ '^\[.*\]$' THEN position::text::jsonb
    -- If position has data but not JSON, wrap it in array
    WHEN position::text IS NOT NULL AND position::text != '' AND position::text != 'null'
      THEN jsonb_build_array(position::text)
    -- Otherwise empty array
    ELSE '[]'::jsonb
  END;

-- Step 3: Drop old column and rename new one
ALTER TABLE player_profiles DROP COLUMN position;
ALTER TABLE player_profiles RENAME COLUMN position_new TO position;

-- Step 4: Set default
ALTER TABLE player_profiles ALTER COLUMN position SET DEFAULT '[]'::jsonb;

-- Verify
SELECT id, position FROM player_profiles LIMIT 3;
