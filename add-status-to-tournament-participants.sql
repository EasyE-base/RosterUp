-- Add missing status column to tournament_participants table
-- This fixes the PGRST204 error: "Could not find the 'status' column"

-- Add the status column if it doesn't exist
ALTER TABLE tournament_participants
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed'
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'waitlist'));

-- Add comment for documentation
COMMENT ON COLUMN tournament_participants.status IS 'Registration status: pending, confirmed, cancelled, or waitlist';
