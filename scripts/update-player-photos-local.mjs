import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, anonKey);

async function updatePlayerPhotos() {
  console.log('Updating player profiles with local photo URLs...\n');

  // Get all player profiles ordered by creation
  const { data: players, error: fetchError } = await supabase
    .from('player_profiles')
    .select('id, user_id')
    .order('created_at', { ascending: true })
    .limit(10);

  if (fetchError) {
    console.error('Error fetching players:', fetchError);
    return;
  }

  console.log(`Found ${players.length} players\n`);

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const photoUrl = `/player-photos/player-${i + 1}.jpg`;

    console.log(`${i + 1}. Updating player ${player.id}...`);

    const { error: updateError } = await supabase
      .from('player_profiles')
      .update({ photo_url: photoUrl })
      .eq('id', player.id);

    if (updateError) {
      console.error(`   ❌ Update error: ${updateError.message}`);
    } else {
      console.log(`   ✓ Updated with ${photoUrl}`);
    }
  }

  console.log('\n✅ All done! Player profiles updated with local images.');
  console.log('Visit http://localhost:5174/players to see the updated photos!');
}

updatePlayerPhotos();
