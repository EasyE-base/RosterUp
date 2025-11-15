-- Fix guest_players foreign key constraint
-- Step 1: Find and delete orphaned guest_player records

-- First, let's see how many orphaned records exist
SELECT COUNT(*) as orphaned_count
FROM guest_players gp
WHERE NOT EXISTS (
    SELECT 1 FROM player_profiles pp WHERE pp.id = gp.player_id
);

-- Show the orphaned records
SELECT gp.*, 'ORPHANED - player not found' as status
FROM guest_players gp
WHERE NOT EXISTS (
    SELECT 1 FROM player_profiles pp WHERE pp.id = gp.player_id
);

-- Delete orphaned guest_player records
DELETE FROM guest_players
WHERE player_id NOT IN (
    SELECT id FROM player_profiles
);

-- Step 2: Drop the incorrect foreign key constraint
ALTER TABLE guest_players
DROP CONSTRAINT IF EXISTS guest_players_player_id_fkey;

-- Step 3: Add the correct foreign key constraint pointing to player_profiles
ALTER TABLE guest_players
ADD CONSTRAINT guest_players_player_id_fkey
FOREIGN KEY (player_id)
REFERENCES player_profiles(id)
ON DELETE CASCADE;

-- Step 4: Verify the fix
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'guest_players'
    AND tc.constraint_type = 'FOREIGN KEY';

-- Show remaining guest_players records (should all be valid now)
SELECT COUNT(*) as valid_guest_players FROM guest_players;
