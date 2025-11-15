import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateProfiles() {
  try {
    // Get all player profiles
    const { data: playerProfiles, error: ppError } = await supabase
      .from('player_profiles')
      .select('id, user_id');

    if (ppError) {
      console.error('❌ Error fetching player_profiles:', ppError);
      return;
    }

    console.log(`📋 Found ${playerProfiles.length} player profiles`);

    // Create profile entries for each user_id
    const profiles = playerProfiles.map((pp, index) => {
      // Use "Test Player" for the specific user_id we know
      const fullName = pp.user_id === '3231a3c2-2a31-41be-a48d-106ac1e169bb'
        ? 'Test Player'
        : `Player ${index + 1}`;

      return {
        id: pp.user_id,
        email: `player${index + 1}@test.com`,
        full_name: fullName
      };
    });

    console.log('\n📝 Creating profiles:');
    profiles.forEach(p => console.log(`   - ${p.full_name} (${p.id.substring(0, 8)}...)`));

    // Insert profiles
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profiles, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('\n❌ Error creating profiles:', error);
      return;
    }

    console.log(`\n✅ Successfully created ${data.length} profiles`);

    // Verify with a join query
    const { data: verifyData, error: verifyError } = await supabase
      .from('player_profiles')
      .select(`
        id,
        sport,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('id', '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315')
      .single();

    if (verifyError) {
      console.error('\n❌ Verification error:', verifyError);
    } else {
      console.log('\n✅ Verification for Test Player:', JSON.stringify(verifyData, null, 2));
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

populateProfiles();
