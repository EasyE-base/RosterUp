import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.VJKx0o8mAJxG2gOz9YX5wAOQJwYQNVgK3jQMKZPTdiM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addBannerColumns() {
  console.log('🔧 Adding banner customization columns...\n');

  try {
    // Add banner_url and banner_color columns
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE player_profiles
        ADD COLUMN IF NOT EXISTS banner_url TEXT,
        ADD COLUMN IF NOT EXISTS banner_color TEXT DEFAULT '#1e3a8a';
      `
    });

    if (error) {
      console.error('❌ Error adding columns:', error);

      // Try alternative approach using the REST API
      console.log('\n⚠️ Trying alternative approach...\n');

      // We'll just verify the columns via a test query instead
      const { data: testData, error: testError } = await supabase
        .from('player_profiles')
        .select('id, banner_url, banner_color')
        .limit(1);

      if (testError) {
        console.error('❌ Columns do not exist. Please run the SQL migration manually.');
        console.log('\nRun this SQL in Supabase SQL Editor:');
        console.log(`
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS banner_color TEXT DEFAULT '#1e3a8a';
        `);
        return;
      }

      console.log('✅ Columns already exist!');
      return;
    }

    console.log('✅ Banner columns added successfully!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

addBannerColumns();
