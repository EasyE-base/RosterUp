import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Applying tournament_participants RLS policies...\n');

// Read the SQL file
const sql = fs.readFileSync('./fix-tournament-participants-rls.sql', 'utf8');

// Execute the SQL
const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.log('❌ Error applying RLS policies:');
  console.log('Message:', error.message);
  console.log('Details:', error.details);
  console.log('\nTrying alternative method...\n');

  // If exec_sql doesn't work, we'll need to use psql
  console.log('Please run the following command manually:');
  console.log('');
  console.log('cd "/Users/erictrovarelli/Downloads/project 2" && cat fix-tournament-participants-rls.sql | PGPASSWORD=\'Ert61797!\' psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.hnaqmskjbsrltdcvinai -d postgres');
  console.log('');
  process.exit(1);
} else {
  console.log('✅ RLS policies applied successfully!\n');
  console.log('The tournament registration should now work correctly.');
}
