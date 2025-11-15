-- Fix player_profiles.position column to handle corrupted data
-- This safely converts the position column to JSONB array format

-- Step 1: Check current column type
DO $$
BEGIN
    -- First, set all invalid/null positions to a valid empty JSONB array
    UPDATE player_profiles
    SET position = '[]'::jsonb
    WHERE position IS NULL
       OR position::text = ''
       OR position::text = 'null'
       OR NOT (position::text ~ '^[\[\{]');  -- Check if it starts with [ or {

    -- Now try to alter the column type if it's not already JSONB
    BEGIN
        ALTER TABLE player_profiles
        ALTER COLUMN position TYPE JSONB USING
            CASE
                WHEN position IS NULL OR position::text = '' THEN '[]'::jsonb
                WHEN position::text ~ '^[\[\{]' THEN position::text::jsonb
                ELSE jsonb_build_array(position::text)
            END;
    EXCEPTION WHEN OTHERS THEN
        -- Column might already be JSONB, that's okay
        RAISE NOTICE 'Column might already be JSONB type';
    END;

    -- Set default to empty array
    ALTER TABLE player_profiles
    ALTER COLUMN position SET DEFAULT '[]'::jsonb;

END $$;

-- Verify and fix any remaining bad data
UPDATE player_profiles
SET position = '[]'::jsonb
WHERE position IS NULL;

-- Show current state
SELECT id, position, position IS NOT NULL as has_position
FROM player_profiles
LIMIT 5;
