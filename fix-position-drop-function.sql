-- Fix by temporarily dropping the problematic function

-- Step 1: Drop the trigger that calls the function
DROP TRIGGER IF EXISTS update_player_profile_completeness_trigger ON player_profiles;

-- Step 2: Drop the functions
DROP FUNCTION IF EXISTS update_player_profile_completeness() CASCADE;
DROP FUNCTION IF EXISTS calculate_player_profile_completeness(uuid) CASCADE;

-- Step 3: Now drop and recreate the position column
ALTER TABLE player_profiles DROP COLUMN IF EXISTS position CASCADE;
ALTER TABLE player_profiles ADD COLUMN position JSONB DEFAULT '[]'::jsonb;

-- Step 4: Set the test player's position
UPDATE player_profiles
SET position = '["Catcher"]'::jsonb
WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';

-- Step 5: Recreate the completeness calculation function (fixed version)
CREATE OR REPLACE FUNCTION calculate_player_profile_completeness(player_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  profile RECORD;
  completeness INTEGER := 0;
  total_fields INTEGER := 11;
  filled_fields INTEGER := 0;
BEGIN
  SELECT * INTO profile FROM player_profiles WHERE id = player_profile_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Basic fields (required)
  IF profile.sport IS NOT NULL AND profile.sport != '' THEN filled_fields := filled_fields + 1; END IF;

  -- Optional fields
  IF profile.age_group IS NOT NULL AND profile.age_group != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile.classification IS NOT NULL AND profile.classification != '' THEN filled_fields := filled_fields + 1; END IF;

  -- Position - check JSONB array
  IF profile.position IS NOT NULL AND jsonb_array_length(profile.position) > 0 THEN
    filled_fields := filled_fields + 1;
  END IF;

  IF profile.bio IS NOT NULL AND profile.bio != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile.location_city IS NOT NULL AND profile.location_city != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile.location_state IS NOT NULL AND profile.location_state != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile.photo_url IS NOT NULL AND profile.photo_url != '' THEN filled_fields := filled_fields + 1; END IF;

  -- Check for media
  IF EXISTS (SELECT 1 FROM player_media WHERE player_id = player_profile_id AND media_type = 'photo') THEN
    filled_fields := filled_fields + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM player_media WHERE player_id = player_profile_id AND media_type = 'video') THEN
    filled_fields := filled_fields + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM player_media WHERE player_id = player_profile_id AND media_type = 'document') THEN
    filled_fields := filled_fields + 1;
  END IF;

  completeness := ROUND((filled_fields::DECIMAL / total_fields) * 100);

  RETURN completeness;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Recreate the trigger function
CREATE OR REPLACE FUNCTION update_player_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completeness := calculate_player_profile_completeness(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Recreate the trigger
CREATE TRIGGER update_player_profile_completeness_trigger
BEFORE INSERT OR UPDATE ON player_profiles
FOR EACH ROW
EXECUTE FUNCTION update_player_profile_completeness();

-- Step 8: Manually update completeness for test player
UPDATE player_profiles
SET updated_at = NOW()
WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';

-- Verify
SELECT id, position, profile_completeness FROM player_profiles WHERE id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';
