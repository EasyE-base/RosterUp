import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = `
-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Players can create their own applications" ON tryout_applications;

-- Create the correct RLS policy for tryout applications
CREATE POLICY "Players can create their own applications"
ON tryout_applications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM player_profiles
    WHERE player_profiles.id = player_id
    AND player_profiles.user_id = auth.uid()
  )
);

-- Also add a policy to allow players to read their own applications
DROP POLICY IF EXISTS "Players can view their own applications" ON tryout_applications;

CREATE POLICY "Players can view their own applications"
ON tryout_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM player_profiles
    WHERE player_profiles.id = player_id
    AND player_profiles.user_id = auth.uid()
  )
);

-- Allow players to update their own applications
DROP POLICY IF EXISTS "Players can update their own applications" ON tryout_applications;

CREATE POLICY "Players can update their own applications"
ON tryout_applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM player_profiles
    WHERE player_profiles.id = player_id
    AND player_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM player_profiles
    WHERE player_profiles.id = player_id
    AND player_profiles.user_id = auth.uid()
  )
);
`;

console.log('Applying RLS policies for tryout_applications...');

const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('Error applying RLS policies:', error);

  // Try alternative approach - execute statements one by one
  console.log('\nTrying alternative approach...');

  const statements = sql.split(';').filter(s => s.trim().length > 0);

  for (const statement of statements) {
    console.log(`\nExecuting: ${statement.trim().substring(0, 50)}...`);
    const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
    if (stmtError) {
      console.error('Error:', stmtError.message);
    } else {
      console.log('✓ Success');
    }
  }
} else {
  console.log('✓ RLS policies applied successfully!');
}

console.log('\nDone!');
