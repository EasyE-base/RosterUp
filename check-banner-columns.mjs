import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('🔍 Checking if banner columns exist...\n');

  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .select('id, banner_url, banner_color')
      .limit(1);

    if (error) {
      console.log('❌ Banner columns do NOT exist yet.');
      console.log('\n📋 Please run this SQL in the Supabase SQL Editor:\n');
      console.log('----------------------------------------');
      console.log(`ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS banner_color TEXT DEFAULT '#1e3a8a';`);
      console.log('----------------------------------------\n');
      return false;
    }

    console.log('✅ Banner columns already exist!');
    console.log('Data:', data);
    return true;

  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
}

checkColumns();
