import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔧 Applying tournament_participants fixes...\n');

// Execute each SQL statement separately
const statements = [
  {
    name: 'Add status column',
    sql: `ALTER TABLE tournament_participants
          ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed'
          CHECK (status IN ('pending', 'confirmed', 'cancelled', 'waitlist'));`
  },
  {
    name: 'Enable RLS',
    sql: 'ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;'
  },
  {
    name: 'Drop old policies',
    sql: `DROP POLICY IF EXISTS "Anyone can view tournament participants" ON tournament_participants;
          DROP POLICY IF EXISTS "Organizations can manage tournament participants" ON tournament_participants;
          DROP POLICY IF EXISTS "Users can view tournament participants" ON tournament_participants;
          DROP POLICY IF EXISTS "Organizations can create tournament participants" ON tournament_participants;
          DROP POLICY IF EXISTS "Organizations can register teams" ON tournament_participants;
          DROP POLICY IF EXISTS "Organizations can update their registrations" ON tournament_participants;
          DROP POLICY IF EXISTS "Organizations can delete their registrations" ON tournament_participants;
          DROP POLICY IF EXISTS "Tournament hosts can manage participants" ON tournament_participants;`
  },
  {
    name: 'Policy: Anyone can view',
    sql: `CREATE POLICY "Anyone can view tournament participants"
          ON tournament_participants FOR SELECT
          TO authenticated, anon
          USING (true);`
  },
  {
    name: 'Policy: Register teams',
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
    name: 'Policy: Update registrations',
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
    name: 'Policy: Delete registrations',
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
    name: 'Policy: Tournament hosts',
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

for (const statement of statements) {
  try {
    console.log(`Executing: ${statement.name}...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement.sql });

    if (error) {
      console.log(`  ❌ ${error.message}`);
      failCount++;
    } else {
      console.log(`  ✅ Success`);
      successCount++;
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    failCount++;
  }
}

console.log(`\n📊 Results:`);
console.log(`  ✅ Successful: ${successCount}`);
console.log(`  ❌ Failed: ${failCount}`);

if (successCount > 0) {
  console.log(`\n🎉 Fixes applied! Refresh your app and try registering a team.`);
} else {
  console.log(`\n⚠️  All operations failed. The database may not have exec_sql function.`);
  console.log(`Please apply the SQL manually in Supabase dashboard.`);
}

process.exit(failCount > 0 ? 1 : 0);
