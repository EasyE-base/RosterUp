-- Update "Anonymous Player" and "Test Player Auto" with real names and details
-- Run this in Supabase Dashboard > SQL Editor

-- Update player_profiles for both players
UPDATE player_profiles
SET
  age_group = CASE
    WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN '14U'
    ELSE '12U'
  END,
  classification = CASE
    WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN 'B'
    ELSE 'A'
  END,
  position = CASE
    WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN '["Catcher", "First Base"]'::jsonb
    ELSE '["Pitcher", "Shortstop"]'::jsonb
  END,
  location_city = CASE
    WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN 'Portland'
    ELSE 'Nashville'
  END,
  location_state = CASE
    WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN 'Oregon'
    ELSE 'Tennessee'
  END,
  bio = CASE
    WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af'
      THEN 'Versatile player with strong defensive skills behind the plate and at first base. Known for quick reflexes and leadership on the field. Looking to join a competitive travel team for summer season.'
    ELSE 'Dual-threat pitcher and shortstop with strong arm and batting average over .400. Three-time all-star selection. Committed to year-round training and dedicated to improving my game every day.'
  END
WHERE id IN ('b6c34c20-1f78-4176-95a5-3c30e477b7af', 'ab8477e6-58ff-4012-8baf-bef79b22bbf0');

-- Update profiles table with real names
UPDATE profiles
SET full_name = CASE
  WHEN id = (SELECT user_id FROM player_profiles WHERE id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af')
    THEN 'Madison Taylor'
  WHEN id = (SELECT user_id FROM player_profiles WHERE id = 'ab8477e6-58ff-4012-8baf-bef79b22bbf0')
    THEN 'Brooklyn Reed'
  ELSE full_name
END
WHERE id IN (
  SELECT user_id FROM player_profiles
  WHERE id IN ('b6c34c20-1f78-4176-95a5-3c30e477b7af', 'ab8477e6-58ff-4012-8baf-bef79b22bbf0')
);

-- Verify the updates
SELECT
  pp.id,
  p.full_name,
  pp.age_group,
  pp.classification,
  pp.position,
  pp.location_city,
  pp.location_state,
  LEFT(pp.bio, 50) || '...' as bio_preview
FROM player_profiles pp
JOIN profiles p ON p.id = pp.user_id
WHERE pp.id IN ('b6c34c20-1f78-4176-95a5-3c30e477b7af', 'ab8477e6-58ff-4012-8baf-bef79b22bbf0')
ORDER BY pp.created_at ASC;
