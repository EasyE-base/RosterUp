import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyConstraint() {
  try {
    console.log('Reading SQL file...');
    const sql = readFileSync('./scripts/add-unique-constraint-player-profiles.sql', 'utf8');

    console.log('Executing SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct SQL query instead
      console.log('RPC failed, trying direct query...');
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
      console.log('\n' + sql + '\n');
      console.log('Instructions:');
      console.log('1. Go to https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql');
      console.log('2. Copy the SQL above');
      console.log('3. Paste and run it');
    } else {
      console.log('✅ Success!', data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\nPlease run the SQL file manually in Supabase SQL Editor:');
    console.log('scripts/add-unique-constraint-player-profiles.sql');
  }
}

applyConstraint();
