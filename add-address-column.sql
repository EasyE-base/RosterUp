-- Add address column to tournaments table for street address
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS address TEXT;

COMMENT ON COLUMN tournaments.address IS 'Street address of the tournament venue';
