import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('Checking player_profiles table schema...\n');

// Get a sample player_profile
const { data: profiles, error: profileError } = await supabase
  .from('player_profiles')
  .select('*')
  .limit(1);

if (profileError) {
  console.error('Error fetching player_profiles:', profileError);
} else if (profiles && profiles.length > 0) {
  console.log('Sample player_profile columns:');
  console.log(Object.keys(profiles[0]));
  console.log('\nSample data:');
  console.log(profiles[0]);
}

// Check RLS policies
console.log('\n\nChecking RLS policies on tryout_applications...');
const { data: policies, error: policyError } = await supabase
  .rpc('exec_sql', {
    sql_query: `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'tryout_applications';
    `
  });

if (policyError) {
  console.error('Error fetching policies:', policyError);
} else {
  console.log('Current RLS policies:');
  console.log(policies);
}
