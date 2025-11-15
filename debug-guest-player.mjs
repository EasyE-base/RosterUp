import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugGuestPlayer() {
  console.log('🔍 Debugging guest player application...\n');

  const playerId = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';

  try {
    // Get a tournament ID to test with
    const { data: tournaments, error: tourError, count } = await supabase
      .from('tournaments')
      .select('id, title', { count: 'exact' })
      .limit(5);

    if (tourError) {
      console.error('❌ Error fetching tournaments:', tourError);
      return;
    }

    console.log(`📋 Found ${count} tournaments in database`);

    if (!tournaments || tournaments.length === 0) {
      console.log('⚠️  No tournaments found in database. Guest player feature requires tournaments to exist.');
      return;
    }

    const tournament = tournaments[0];

    console.log('📋 Testing with tournament:', tournament.title);
    console.log('   Tournament ID:', tournament.id);
    console.log('   Player ID:', playerId);
    console.log('\n');

    // Check if application already exists
    const { data: existing, error: checkError } = await supabase
      .from('guest_players')
      .select('*')
      .eq('tournament_id', tournament.id)
      .eq('player_id', playerId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing application:', checkError);
      return;
    }

    if (existing) {
      console.log('✅ Existing application found:');
      console.log(JSON.stringify(existing, null, 2));
      console.log('\nℹ️  Trying to update existing application...');

      const { error: updateError } = await supabase
        .from('guest_players')
        .update({ status: 'available' })
        .eq('id', existing.id);

      if (updateError) {
        console.error('❌ Update failed:', updateError);
      } else {
        console.log('✅ Update successful!');
      }
    } else {
      console.log('ℹ️  No existing application. Trying to insert...');

      const { error: insertError } = await supabase
        .from('guest_players')
        .insert({
          tournament_id: tournament.id,
          player_id: playerId,
          status: 'available',
        });

      if (insertError) {
        console.error('❌ Insert failed:', insertError);
      } else {
        console.log('✅ Insert successful!');
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

debugGuestPlayer();
