import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, anonKey);

// The 7 players we created in the previous session
const playerCredentials = [
  { email: 'sarah.martinez.player4@example.com', password: 'password123', photoNum: 4 },
  { email: 'jessica.rodriguez.player5@example.com', password: 'password123', photoNum: 5 },
  { email: 'ashley.williams.player6@example.com', password: 'password123', photoNum: 6 },
  { email: 'emily.jones.player7@example.com', password: 'password123', photoNum: 7 },
  { email: 'amanda.davis.player8@example.com', password: 'password123', photoNum: 8 },
  { email: 'madison.miller.player9@example.com', password: 'password123', photoNum: 9 },
  { email: 'taylor.wilson.player10@example.com', password: 'password123', photoNum: 10 }
];

async function updatePhotosAsUsers() {
  console.log('Updating player photos by signing in as each user...\n');

  for (const cred of playerCredentials) {
    console.log(`Processing ${cred.email}...`);

    // Sign in as the user
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cred.email,
      password: cred.password
    });

    if (signInError) {
      console.log(`  ❌ Sign in failed: ${signInError.message}`);
      continue;
    }

    console.log(`  ✓ Signed in as ${authData.user.id}`);

    // Update their photo
    const photoUrl = `/player-photos/player-${cred.photoNum}.jpg`;
    const { data: updateData, error: updateError } = await supabase
      .from('player_profiles')
      .update({ photo_url: photoUrl })
      .eq('user_id', authData.user.id)
      .select();

    if (updateError) {
      console.log(`  ❌ Update failed: ${updateError.message}`);
    } else if (updateData && updateData.length > 0) {
      console.log(`  ✓ Updated photo to ${photoUrl}`);
    } else {
      console.log(`  ⚠️  Update returned no data (possible RLS block)`);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log();
  }

  // Now get the first 3 players and update them manually
  console.log('\n=== Updating first 3 players ===\n');

  const { data: players, error: fetchError } = await supabase
    .from('player_profiles')
    .select('id, user_id')
    .order('created_at', { ascending: true })
    .limit(3);

  if (fetchError) {
    console.error('Error fetching first 3 players:', fetchError);
    return;
  }

  console.log('First 3 players need to be updated manually in Supabase Dashboard:');
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    console.log(`${i + 1}. Player ID: ${player.id} -> /player-photos/player-${i + 1}.jpg`);
  }

  console.log('\n✅ Done! Run check-photo-urls.mjs to verify.');
}

updatePhotosAsUsers();
