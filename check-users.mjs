import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  console.log('🔍 Checking profiles and users...\n');

  try {
    // Check profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
    } else {
      console.log(`📊 Total profiles: ${profiles?.length || 0}`);
      if (profiles && profiles.length > 0) {
        profiles.forEach((profile, index) => {
          console.log(`\n${index + 1}. Profile:`);
          console.log(`   User ID: ${profile.user_id}`);
          console.log(`   User Type: ${profile.user_type}`);
          console.log(`   Name: ${profile.first_name || 'N/A'} ${profile.last_name || 'N/A'}`);
        });
      }
    }

    console.log('\n---\n');

    // Check player_profiles table
    const { data: players, error: playerError } = await supabase
      .from('player_profiles')
      .select('id, user_id, first_name, last_name');

    if (playerError) {
      console.error('❌ Error fetching player_profiles:', playerError);
    } else {
      console.log(`📊 Total player_profiles: ${players?.length || 0}`);
      if (players && players.length > 0) {
        players.forEach((player, index) => {
          console.log(`\n${index + 1}. Player:`);
          console.log(`   Player ID: ${player.id}`);
          console.log(`   User ID: ${player.user_id}`);
          console.log(`   Name: ${player.first_name} ${player.last_name}`);
        });
      }
    }

    console.log('\n---\n');

    // Check organizations table
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');

    if (orgError) {
      console.error('❌ Error fetching organizations:', orgError);
    } else {
      console.log(`📊 Total organizations: ${orgs?.length || 0}`);
      if (orgs && orgs.length > 0) {
        orgs.forEach((org, index) => {
          console.log(`\n${index + 1}. Organization:`);
          console.log(`   ID: ${org.id}`);
          console.log(`   Name: ${org.name}`);
          console.log(`   User ID: ${org.user_id}`);
        });
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkUsers();
