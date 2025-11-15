import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrganizations() {
  console.log('🔍 Checking organizations...\n');

  try {
    const { data, error, count } = await supabase
      .from('organizations')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error fetching organizations:', error);
      return;
    }

    console.log(`📊 Total organizations: ${count}`);

    if (data && data.length > 0) {
      console.log('\n📋 Organizations:\n');
      data.forEach((org, index) => {
        console.log(`${index + 1}. ${org.name}`);
        console.log(`   ID: ${org.id}`);
        console.log(`   User ID: ${org.user_id}`);
        console.log(`   Primary Sport: ${org.primary_sport || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No organizations found.');
      console.log('ℹ️  To test guest player functionality:');
      console.log('   1. Log into the app as an organization admin');
      console.log('   2. Create an organization');
      console.log('   3. Create a tournament');
      console.log('   4. Then test guest player applications');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkOrganizations();
