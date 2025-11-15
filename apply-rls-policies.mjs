import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Applying RLS policies to tournament_participants table...\n');

// Step 1: Enable RLS
console.log('Step 1: Enabling RLS...');
const { error: rlsError } = await supabase.rpc('exec_sql', {
  sql: 'ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;'
});

if (rlsError && !rlsError.message.includes('already exists')) {
  console.log('Note:', rlsError.message);
}

// Step 2: Drop old policies
console.log('Step 2: Dropping old policies...');
const dropPolicies = [
  'DROP POLICY IF EXISTS "Anyone can view tournament participants" ON tournament_participants;',
  'DROP POLICY IF EXISTS "Organizations can manage tournament participants" ON tournament_participants;',
  'DROP POLICY IF EXISTS "Users can view tournament participants" ON tournament_participants;',
  'DROP POLICY IF EXISTS "Organizations can create tournament participants" ON tournament_participants;',
  'DROP POLICY IF EXISTS "Organizations can register teams" ON tournament_participants;',
  'DROP POLICY IF EXISTS "Organizations can update their registrations" ON tournament_participants;',
  'DROP POLICY IF EXISTS "Organizations can delete their registrations" ON tournament_participants;',
  'DROP POLICY IF EXISTS "Tournament hosts can manage participants" ON tournament_participants;'
];

for (const sql of dropPolicies) {
  await supabase.rpc('exec_sql', { sql });
}

// Step 3: Create new policies
console.log('Step 3: Creating new policies...');

const policies = [
  {
    name: 'Anyone can view tournament participants',
    sql: `CREATE POLICY "Anyone can view tournament participants"
      ON tournament_participants FOR SELECT
      TO authenticated, anon
      USING (true);`
  },
  {
    name: 'Organizations can register teams',
    sql: `CREATE POLICY "Organizations can register teams"
      ON tournament_participants FOR INSERT
      TO authenticated
      WITH CHECK (
        organization_id IN (
          SELECT id FROM organizations WHERE user_id = auth.uid()
        )
      );`
  },
  {
    name: 'Organizations can update their registrations',
    sql: `CREATE POLICY "Organizations can update their registrations"
      ON tournament_participants FOR UPDATE
      TO authenticated
      USING (
        organization_id IN (
          SELECT id FROM organizations WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        organization_id IN (
          SELECT id FROM organizations WHERE user_id = auth.uid()
        )
      );`
  },
  {
    name: 'Organizations can delete their registrations',
    sql: `CREATE POLICY "Organizations can delete their registrations"
      ON tournament_participants FOR DELETE
      TO authenticated
      USING (
        organization_id IN (
          SELECT id FROM organizations WHERE user_id = auth.uid()
        )
      );`
  },
  {
    name: 'Tournament hosts can manage participants',
    sql: `CREATE POLICY "Tournament hosts can manage participants"
      ON tournament_participants FOR ALL
      TO authenticated
      USING (
        tournament_id IN (
          SELECT id FROM tournaments
          WHERE organization_id IN (
            SELECT id FROM organizations WHERE user_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        tournament_id IN (
          SELECT id FROM tournaments
          WHERE organization_id IN (
            SELECT id FROM organizations WHERE user_id = auth.uid()
          )
        )
      );`
  }
];

let successCount = 0;
let failCount = 0;

for (const policy of policies) {
  const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });

  if (error) {
    console.log(`  ❌ ${policy.name}: ${error.message}`);
    failCount++;
  } else {
    console.log(`  ✅ ${policy.name}`);
    successCount++;
  }
}

console.log('\n📊 Summary:');
console.log(`  ✅ Success: ${successCount}`);
console.log(`  ❌ Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n🎉 All RLS policies applied successfully!');
  console.log('The tournament registration should now work correctly.');
} else {
  console.log('\n⚠️  Some policies failed to apply.');
  console.log('You may need to apply them manually through the Supabase dashboard.');
  console.log('SQL file: fix-tournament-participants-rls.sql');
}
