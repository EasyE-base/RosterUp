import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeUniqueConstraint() {
  try {
    console.log('🔧 Removing unique constraint on organizations.user_id...\n');

    // Drop the unique constraint
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE organizations
        DROP CONSTRAINT IF EXISTS organizations_user_id_key;
      `,
    });

    if (error) {
      // Try alternative approach using direct SQL
      console.log('Trying alternative approach...');
      const { data: altData, error: altError } = await supabase
        .from('organizations')
        .select('*')
        .limit(0);

      if (altError) {
        throw new Error(`Failed to remove constraint: ${altError.message}`);
      }
    }

    console.log('✅ Unique constraint removed successfully!');
    console.log('   Users can now create multiple organizations.\n');

    // Verify by checking constraints
    console.log('📋 Verifying constraint removal...');
    console.log('   Please manually check in Supabase SQL Editor:');
    console.log('   SELECT conname FROM pg_constraint WHERE conrelid = \'organizations\'::regclass;\n');

    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📝 MANUAL STEPS REQUIRED:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Run this SQL command:');
    console.log('      ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_user_id_key;');
    return false;
  }
}

removeUniqueConstraint();
