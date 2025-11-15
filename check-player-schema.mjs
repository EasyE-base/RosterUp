import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPlayerSchema() {
  console.log('🔍 Checking player_profiles schema...\n');

  try {
    // Get one player to see what columns exist
    const { data: players, error } = await supabase
      .from('player_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (players && players.length > 0) {
      console.log('✅ Sample player record:');
      console.log(JSON.stringify(players[0], null, 2));
      console.log('\n📋 Available columns:');
      Object.keys(players[0]).forEach((key, index) => {
        console.log(`   ${index + 1}. ${key}: ${typeof players[0][key]}`);
      });
    } else {
      console.log('⚠️  No player records found');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkPlayerSchema();
