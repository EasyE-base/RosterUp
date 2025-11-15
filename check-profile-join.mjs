import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfileJoin() {
  console.log('🔍 Checking profile data and joins...\n');

  try {
    // Check player_profiles
    const { data: playerProfile, error: ppError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', '3231a3c2-2a31-41be-a48d-106ac1e169bb')
      .single();

    if (ppError) {
      console.error('❌ Error fetching player_profiles:', ppError);
      return;
    }

    console.log('📋 Player Profile:');
    console.log('   ID:', playerProfile.id);
    console.log('   User ID:', playerProfile.user_id);
    console.log('   Photo URL:', playerProfile.photo_url ? '✅ Set' : '❌ Not set');
    console.log('\n');

    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '3231a3c2-2a31-41be-a48d-106ac1e169bb')
      .single();

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return;
    }

    console.log('📋 Profile:');
    console.log('   ID:', profile.id);
    console.log('   Full Name:', profile.full_name);
    console.log('   Email:', profile.email);
    console.log('\n');

    // Try the join query that ProfileShowcase uses
    const { data: joined, error: joinError } = await supabase
      .from('player_profiles')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('id', playerProfile.id)
      .single();

    if (joinError) {
      console.error('❌ Error with join query:', joinError);
      return;
    }

    console.log('📋 Joined Query Result:');
    console.log('   Photo URL:', joined.photo_url);
    console.log('   Profiles data:', joined.profiles);
    console.log('\n');

    if (!joined.profiles || !joined.profiles.full_name) {
      console.log('⚠️  The join is not working properly!');
      console.log('   This is why ProfileShowcase shows initials instead of the photo.');
    } else {
      console.log('✅ Join is working correctly!');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkProfileJoin();
