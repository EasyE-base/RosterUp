import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixPhotosWithServiceRole() {
  console.log('Using SERVICE ROLE key to update player photos...\n');

  // Get all players ordered by creation
  const { data: players, error: fetchError } = await supabase
    .from('player_profiles')
    .select('id, photo_url')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('Error fetching players:', fetchError);
    return;
  }

  console.log(`Found ${players.length} players\n`);

  // Take first 10 players
  const playersToUpdate = players.slice(0, 10);

  for (let i = 0; i < playersToUpdate.length; i++) {
    const player = playersToUpdate[i];
    const photoUrl = `/player-photos/player-${i + 1}.jpg`;

    console.log(`${i + 1}. Updating player ${player.id}`);
    console.log(`   Old URL: ${player.photo_url || '(none)'}`);
    console.log(`   New URL: ${photoUrl}`);

    const { data: updateData, error: updateError } = await supabase
      .from('player_profiles')
      .update({ photo_url: photoUrl })
      .eq('id', player.id)
      .select();

    if (updateError) {
      console.error(`   ❌ Error: ${updateError.message}`);
    } else {
      console.log(`   ✓ Updated successfully`);
      console.log(`   Verified: ${updateData?.[0]?.photo_url}\n`);
    }
  }

  // Verify all updates
  console.log('\n=== VERIFICATION ===\n');
  const { data: verifyPlayers, error: verifyError } = await supabase
    .from('player_profiles')
    .select('id, photo_url')
    .order('created_at', { ascending: true })
    .limit(10);

  if (verifyError) {
    console.error('Verification error:', verifyError);
    return;
  }

  console.log('Current photo URLs in database:');
  verifyPlayers.forEach((player, index) => {
    console.log(`${index + 1}. ${player.photo_url || '(no photo)'}`);
  });

  console.log('\n✅ Done!');
}

fixPhotosWithServiceRole();
