-- Fix guest_players foreign key constraint
-- The table currently references 'players' table but should reference 'player_profiles'

-- First, check the current constraint
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

-- Drop the incorrect foreign key constraint
ALTER TABLE guest_players
DROP CONSTRAINT IF EXISTS guest_players_player_id_fkey;

-- Add the correct foreign key constraint pointing to player_profiles
ALTER TABLE guest_players
ADD CONSTRAINT guest_players_player_id_fkey
FOREIGN KEY (player_id)
REFERENCES player_profiles(id)
ON DELETE CASCADE;

-- Verify the new constraint
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
