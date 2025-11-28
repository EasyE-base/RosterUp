import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const userId = 'da63015a-224c-4e2a-9bb1-1d0e64ca223c';

async function checkUser() {
  console.log('Checking user:', userId);

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  console.log('\n=== PROFILE ===');
  console.log('Data:', profile);
  console.log('Error:', profileError);

  // Check player_profiles
  const { data: playerProfile, error: playerError } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  console.log('\n=== PLAYER PROFILE ===');
  console.log('Data:', playerProfile);
  console.log('Error:', playerError);

  // If no player profile exists, create one
  if (!playerProfile && !playerError) {
    console.log('\n=== CREATING PLAYER PROFILE ===');
    const { data: newProfile, error: insertError } = await supabase
      .from('player_profiles')
      .insert({
        user_id: userId,
        sport: 'Softball',
        recruiting_status: 'open',
        is_visible_in_search: true,
        is_active: true,
      })
      .select()
      .single();

    console.log('Created:', newProfile);
    console.log('Error:', insertError);
  }
}

checkUser();
