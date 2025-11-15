-- Fix foreign key constraint on tryout_applications table
-- The constraint is currently pointing to 'players' table but should point to 'player_profiles'

-- Drop the existing incorrect foreign key constraint
ALTER TABLE tryout_applications
DROP CONSTRAINT IF EXISTS tryout_applications_player_id_fkey;

-- Add the correct foreign key constraint pointing to player_profiles
ALTER TABLE tryout_applications
ADD CONSTRAINT tryout_applications_player_id_fkey
FOREIGN KEY (player_id)
REFERENCES player_profiles(id)
ON DELETE CASCADE;
