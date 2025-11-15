import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  try {
    // Check player_profiles table
    const { data: playerProfiles, error: ppError } = await supabase
      .from('player_profiles')
      .select('id, user_id, sport');

    if (ppError) {
      console.error('❌ Error fetching player_profiles:', ppError);
    } else {
      console.log('\n📋 Player Profiles:', playerProfiles);
    }

    // Check profiles table
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, email, full_name');

    if (pError) {
      console.error('❌ Error fetching profiles:', pError);
    } else {
      console.log('\n📋 Profiles:', profiles);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkProfiles();
