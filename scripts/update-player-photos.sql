-- Update all 10 player photos with local image URLs
-- Run this in Supabase Dashboard > SQL Editor

WITH numbered_players AS (
  SELECT
    id,
    photo_url as old_photo,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM player_profiles
  LIMIT 10
)
UPDATE player_profiles
SET photo_url = '/player-photos/player-' || numbered_players.row_num || '.jpg'
FROM numbered_players
WHERE player_profiles.id = numbered_players.id
RETURNING
  player_profiles.id,
  numbered_players.old_photo as "Old Photo URL",
  player_profiles.photo_url as "New Photo URL";
