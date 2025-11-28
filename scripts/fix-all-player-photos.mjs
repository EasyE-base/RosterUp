import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, anonKey);

async function fixAllPhotos() {
  console.log('Fetching all players...\n');

  const { data: players, error: fetchError } = await supabase
    .from('player_profiles')
    .select('id, photo_url')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('Error fetching players:', fetchError);
    return;
  }

  console.log(`Found ${players.length} players\n`);

  // Take only the first 10
  const playersToUpdate = players.slice(0, 10);

  for (let i = 0; i < playersToUpdate.length; i++) {
    const player = playersToUpdate[i];
    const photoUrl = `/player-photos/player-${i + 1}.jpg`;

    console.log(`${i + 1}. Updating player ${player.id}`);
    console.log(`   Old URL: ${player.photo_url || '(none)'}`);
    console.log(`   New URL: ${photoUrl}`);

    const { error: updateError } = await supabase
      .from('player_profiles')
      .update({ photo_url: photoUrl })
      .eq('id', player.id);

    if (updateError) {
      console.error(`   ❌ Error: ${updateError.message}`);
    } else {
      console.log(`   ✓ Updated\n`);
    }
  }

  console.log('✅ All done!');
}

fixAllPhotos();
