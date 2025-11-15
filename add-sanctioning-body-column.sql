-- Add sanctioning_body column to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS sanctioning_body TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN tournaments.sanctioning_body IS 'The sanctioning body governing the tournament rules (e.g., USA Softball, USSSA, NSA, etc.)';
