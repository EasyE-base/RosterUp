import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, anonKey);

async function updatePlaceholderPlayers() {
  console.log('Updating placeholder players with real names and details...\n');

  // Get the two placeholder players
  const { data: players, error: fetchError } = await supabase
    .from('player_profiles')
    .select('id, user_id, photo_url')
    .or('id.eq.b6c34c20-1f78-4176-95a5-3c30e477b7af,id.eq.ab8477e6-58ff-4012-8baf-bef79b22bbf0');

  if (fetchError) {
    console.error('Error fetching players:', fetchError);
    return;
  }

  console.log(`Found ${players.length} placeholder players to update\n`);

  // Player data for updates
  const updates = [
    {
      id: 'b6c34c20-1f78-4176-95a5-3c30e477b7af', // Anonymous Player
      user_id: null, // Will be filled in
      profile_name: 'Madison Taylor',
      player_data: {
        age_group: '14U',
        classification: 'B',
        position: ['Catcher', 'First Base'],
        location_city: 'Portland',
        location_state: 'Oregon',
        bio: 'Versatile player with strong defensive skills behind the plate and at first base. Known for quick reflexes and leadership on the field. Looking to join a competitive travel team for summer season.'
      }
    },
    {
      id: 'ab8477e6-58ff-4012-8baf-bef79b22bbf0', // Test Player Auto
      user_id: null, // Will be filled in
      profile_name: 'Brooklyn Reed',
      player_data: {
        age_group: '12U',
        classification: 'A',
        position: ['Pitcher', 'Shortstop'],
        location_city: 'Nashville',
        location_state: 'Tennessee',
        bio: 'Dual-threat pitcher and shortstop with strong arm and batting average over .400. Three-time all-star selection. Committed to year-round training and dedicated to improving my game every day.'
      }
    }
  ];

  // Get user_ids from the fetched players
  for (const player of players) {
    const update = updates.find(u => u.id === player.id);
    if (update) {
      update.user_id = player.user_id;
    }
  }

  // Update each player
  for (const update of updates) {
    if (!update.user_id) {
      console.log(`⚠️  Skipping ${update.profile_name} - no user_id found`);
      continue;
    }

    console.log(`Updating ${update.profile_name}...`);

    // Update profile name
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: update.profile_name })
      .eq('id', update.user_id);

    if (profileError) {
      console.log(`  ❌ Profile update failed: ${profileError.message}`);
    } else {
      console.log(`  ✓ Profile name updated`);
    }

    // Update player profile
    const { error: playerError } = await supabase
      .from('player_profiles')
      .update(update.player_data)
      .eq('id', update.id);

    if (playerError) {
      console.log(`  ❌ Player profile update failed: ${playerError.message}`);
    } else {
      console.log(`  ✓ Player details updated`);
      console.log(`     - Age: ${update.player_data.age_group}`);
      console.log(`     - Position: ${update.player_data.position.join(', ')}`);
      console.log(`     - Location: ${update.player_data.location_city}, ${update.player_data.location_state}`);
    }

    console.log();
  }

  console.log('✅ All placeholder players updated!');
  console.log('\nYou may need to run this SQL in Supabase Dashboard to complete the updates:');
  console.log(`
UPDATE player_profiles
SET
  age_group = 'CASE WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN '14U' ELSE '12U' END',
  classification = CASE WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN 'B' ELSE 'A' END,
  position = CASE WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN ARRAY['Catcher', 'First Base'] ELSE ARRAY['Pitcher', 'Shortstop'] END,
  location_city = CASE WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN 'Portland' ELSE 'Nashville' END,
  location_state = CASE WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN 'Oregon' ELSE 'Tennessee' END,
  bio = CASE
    WHEN id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af' THEN 'Versatile player with strong defensive skills behind the plate and at first base. Known for quick reflexes and leadership on the field. Looking to join a competitive travel team for summer season.'
    ELSE 'Dual-threat pitcher and shortstop with strong arm and batting average over .400. Three-time all-star selection. Committed to year-round training and dedicated to improving my game every day.'
  END
WHERE id IN ('b6c34c20-1f78-4176-95a5-3c30e477b7af', 'ab8477e6-58ff-4012-8baf-bef79b22bbf0');

UPDATE profiles
SET full_name = CASE
  WHEN id = (SELECT user_id FROM player_profiles WHERE id = 'b6c34c20-1f78-4176-95a5-3c30e477b7af') THEN 'Madison Taylor'
  WHEN id = (SELECT user_id FROM player_profiles WHERE id = 'ab8477e6-58ff-4012-8baf-bef79b22bbf0') THEN 'Brooklyn Reed'
  ELSE full_name
END
WHERE id IN (
  SELECT user_id FROM player_profiles
  WHERE id IN ('b6c34c20-1f78-4176-95a5-3c30e477b7af', 'ab8477e6-58ff-4012-8baf-bef79b22bbf0')
);
  `);
}

updatePlaceholderPlayers();
