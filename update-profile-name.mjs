import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProfileName() {
  try {
    // Get the player profile's user_id
    const { data: playerProfile, error: profileError } = await supabase
      .from('player_profiles')
      .select('user_id')
      .eq('id', '9053ac93-e46b-4e4e-babb-08e3fb910cad')
      .single();

    if (profileError) {
      console.error('❌ Error fetching player profile:', profileError);
      return;
    }

    console.log('📋 Player profile user_id:', playerProfile.user_id);

    // Check current profiles table entry
    const { data: currentProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', playerProfile.user_id)
      .single();

    if (checkError) {
      console.error('❌ Error checking profiles:', checkError);
    } else {
      console.log('📋 Current profile data:', currentProfile);
    }

    // Update the profiles table with a full_name
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: 'Test Player' })
      .eq('id', playerProfile.user_id)
      .select();

    if (error) {
      console.error('❌ Error updating profile:', error);
      return;
    }

    console.log('✅ Successfully updated profile name:', data);

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('player_profiles')
      .select(`
        id,
        user_id,
        sport,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('id', '9053ac93-e46b-4e4e-babb-08e3fb910cad')
      .single();

    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
    } else {
      console.log('✅ Verification successful:', JSON.stringify(verifyData, null, 2));
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

updateProfileName();
