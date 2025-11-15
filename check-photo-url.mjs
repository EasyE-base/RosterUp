import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhotoUrl() {
  console.log('🔍 Checking photo_url in database...\n');

  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .select('id, user_id, photo_url, profiles:user_id(full_name)')
      .eq('user_id', '3231a3c2-2a31-41be-a48d-106ac1e169bb')
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📋 Profile Data:');
    console.log('   Player ID:', data.id);
    console.log('   User ID:', data.user_id);
    console.log('   Full Name:', data.profiles?.full_name);
    console.log('   Photo URL:', data.photo_url || '❌ NULL/EMPTY');
    console.log('\n');

    if (!data.photo_url) {
      console.log('⚠️  Photo URL is not set in the database!');
      console.log('   The profile photo upload may not have saved to the database.');
    } else {
      console.log('✅ Photo URL exists in database');
      console.log('   Try opening this URL in your browser:');
      console.log('   ' + data.photo_url);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkPhotoUrl();
