import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listPlayers() {
  console.log('🔍 Checking player_profiles...\n');

  try {
    const { data, error, count } = await supabase
      .from('player_profiles')
      .select('id, user_id, first_name, last_name, email', { count: 'exact' });

    if (error) {
      console.error('❌ Error fetching players:', error);
      return;
    }

    console.log(`📊 Total players: ${count}\n`);

    if (data && data.length > 0) {
      data.forEach((player, index) => {
        console.log(`${index + 1}. ${player.first_name} ${player.last_name}`);
        console.log(`   Player ID: ${player.id}`);
        console.log(`   User ID: ${player.user_id}`);
        console.log(`   Email: ${player.email || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No player profiles found.');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

listPlayers();
