import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppQuery() {
  console.log('🔍 Testing the exact query ProfileShowcase uses...\n');

  try {
    // This is the exact query from ProfileShowcase.tsx
    const { data: profile, error: profileError } = await supabase
      .from('player_profiles')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('id', '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315')
      .single();

    if (profileError) {
      console.error('❌ Query Error:', profileError);
      return;
    }

    console.log('✅ Query succeeded!');
    console.log('\n📋 Full Result:');
    console.log(JSON.stringify(profile, null, 2));
    console.log('\n📸 Photo URL:', profile.photo_url);
    console.log('👤 Profile Name:', profile.profiles?.full_name);

    if (profile.photo_url && profile.profiles?.full_name) {
      console.log('\n🎉 Everything looks good! The dashboard should now show the profile photo.');
    } else if (!profile.photo_url) {
      console.log('\n⚠️  Photo URL is missing');
    } else if (!profile.profiles?.full_name) {
      console.log('\n⚠️  Profile join is not working - RLS policy issue?');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testAppQuery();
