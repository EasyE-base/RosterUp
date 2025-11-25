-- Add support for guest players (players without RosterUp accounts) in team rosters
-- This allows organizations to add players manually and link them later when they sign up

-- Make player_id nullable to support guest players
ALTER TABLE team_members 
  ALTER COLUMN player_id DROP NOT NULL;

-- Add guest player fields
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS is_guest boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS guest_first_name text,
  ADD COLUMN IF NOT EXISTS guest_last_name text,
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS guest_photo_url text,
  ADD COLUMN IF NOT EXISTS guest_date_of_birth date,
  ADD COLUMN IF NOT EXISTS guest_notes text;

-- Add constraint: either player_id OR guest info must be present
ALTER TABLE team_members
  ADD CONSTRAINT team_members_player_or_guest_check
  CHECK (
    (player_id IS NOT NULL AND is_guest = false) OR
    (player_id IS NULL AND is_guest = true AND guest_first_name IS NOT NULL)
  );

-- Create indexes for guest player lookups
CREATE INDEX IF NOT EXISTS idx_team_members_is_guest ON team_members(is_guest);
CREATE INDEX IF NOT EXISTS idx_team_members_guest_email ON team_members(guest_email) WHERE is_guest = true;

-- Update RLS policies to handle guest players
-- Organizations can still manage all team members (both registered and guest)
-- The existing policies should work fine since they check team_id ownership
