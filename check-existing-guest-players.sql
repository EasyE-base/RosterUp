-- Check existing guest_player records for the test player
SELECT
  gp.*,
  pp.user_id,
  t.title as tournament_title
FROM guest_players gp
LEFT JOIN player_profiles pp ON pp.id = gp.player_id
LEFT JOIN tournaments t ON t.id = gp.tournament_id
WHERE gp.player_id = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315'
ORDER BY gp.created_at DESC;
