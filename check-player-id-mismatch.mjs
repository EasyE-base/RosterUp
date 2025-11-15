import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlayerIdMismatch() {
  console.log('🔍 Checking player profile ID mismatch...\n');

  const userId = '3231a3c2-2a31-41be-a48d-106ac1e169bb';
  const wrongPlayerId = '9053ac93-e46b-4e4e-babb-08e3fb910cad';

  try {
    // Check if the wrong player ID exists
    const { data: wrongPlayer, error: wrongError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('id', wrongPlayerId)
      .maybeSingle();

    console.log('❓ Looking for player ID:', wrongPlayerId);
    if (wrongError || !wrongPlayer) {
      console.log('❌ This player ID does NOT exist in the database\n');
    } else {
      console.log('✅ This player exists:', wrongPlayer);
    }

    // Check the correct player profile for this user
    const { data: correctPlayer, error: correctError } = await supabase
      .from('player_profiles')
      .select('id, user_id, photo_url')
      .eq('user_id', userId)
      .single();

    if (correctError) {
      console.error('❌ Error finding player by user_id:', correctError);
      return;
    }

    console.log('✅ Correct player profile for user:', userId);
    console.log('   Player ID:', correctPlayer.id);
    console.log('   Photo URL:', correctPlayer.photo_url ? '✅ Set' : '❌ Not set');
    console.log('\n');

    console.log('🔧 Issue: AuthContext is returning the wrong player ID');
    console.log('   Expected:', correctPlayer.id);
    console.log('   Got:', wrongPlayerId);

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkPlayerIdMismatch();
