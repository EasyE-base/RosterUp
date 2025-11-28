-- Add unique constraint on user_id in player_profiles table
-- This is required for UPSERT operations with onConflict: 'user_id'

-- First, check if there are any duplicate user_ids
SELECT user_id, COUNT(*) as count
FROM player_profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- If no duplicates, add the unique constraint
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'player_profiles_user_id_key'
    ) THEN
        -- Add unique constraint
        ALTER TABLE player_profiles
        ADD CONSTRAINT player_profiles_user_id_key UNIQUE (user_id);

        RAISE NOTICE 'Added unique constraint on player_profiles.user_id';
    ELSE
        RAISE NOTICE 'Unique constraint already exists on player_profiles.user_id';
    END IF;
END $$;

-- Verify the constraint
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'player_profiles'::regclass
AND contype = 'u';
