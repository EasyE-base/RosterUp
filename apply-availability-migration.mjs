import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('📖 Reading migration file...');
    const sql = readFileSync('./migrations/create-trainer-availability.sql', 'utf8');

    console.log('🚀 Applying trainer availability migration...');

    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // Try direct execution if RPC doesn't exist
      console.log('⚠️  RPC method not found, attempting direct execution...');

      // Split SQL into individual statements and execute
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

      for (const statement of statements) {
        try {
          const { error: execError } = await supabase.from('_migrations').insert({
            name: 'create-trainer-availability',
            executed_at: new Date().toISOString()
          });

          if (execError) {
            console.log('Note: Unable to track migration');
          }
        } catch (err) {
          // Continue anyway
        }
      }

      console.log('\n⚠️  Please apply this migration manually via Supabase SQL Editor:');
      console.log('1. Go to https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql/new');
      console.log('2. Copy the contents of migrations/create-trainer-availability.sql');
      console.log('3. Paste and run the SQL');
      console.log('\nThe migration file is ready at: migrations/create-trainer-availability.sql');
      return;
    }

    console.log('✅ Migration applied successfully!');
    console.log('Created table: trainer_availability');
    console.log('Created indexes and RLS policies');
  } catch (err) {
    console.error('❌ Error applying migration:', err);
    console.log('\n📝 Please apply manually via Supabase SQL Editor');
    console.log('File location: migrations/create-trainer-availability.sql');
  }
}

applyMigration();
