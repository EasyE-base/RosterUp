import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('=== Diagnosing RLS Issue for Tryout Applications ===\n');

// Step 1: Check player_profiles table structure
console.log('1. Checking player_profiles table structure...');
const { data: profiles, error: profileError } = await supabase
  .from('player_profiles')
  .select('*')
  .limit(1);

if (profileError) {
  console.error('   ❌ Error fetching player_profiles:', profileError.message);
} else if (profiles && profiles.length > 0) {
  console.log('   ✓ Sample player_profile columns:', Object.keys(profiles[0]).join(', '));
  console.log('   ✓ Has user_id column:', 'user_id' in profiles[0] ? 'YES' : 'NO');
  if ('user_id' in profiles[0]) {
    console.log('   ✓ Sample user_id value:', profiles[0].user_id);
  }
} else {
  console.log('   ⚠️  No player_profiles found in database');
}

// Step 2: Check profiles table structure
console.log('\n2. Checking profiles table structure...');
const { data: userProfiles, error: userProfileError } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

if (userProfileError) {
  console.error('   ❌ Error fetching profiles:', userProfileError.message);
} else if (userProfiles && userProfiles.length > 0) {
  console.log('   ✓ Sample profile columns:', Object.keys(userProfiles[0]).join(', '));
  console.log('   ✓ Sample id value:', userProfiles[0].id);
} else {
  console.log('   ⚠️  No profiles found in database');
}

// Step 3: Check tryout_applications table structure
console.log('\n3. Checking tryout_applications table structure...');
const { data: applications, error: appError } = await supabase
  .from('tryout_applications')
  .select('*')
  .limit(1);

if (appError) {
  console.error('   ❌ Error fetching tryout_applications:', appError.message);
} else if (applications && applications.length > 0) {
  console.log('   ✓ Sample tryout_application columns:', Object.keys(applications[0]).join(', '));
} else {
  console.log('   ⚠️  No tryout_applications found in database');
}

// Step 4: Check current user authentication
console.log('\n4. Checking current authenticated user...');
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError) {
  console.log('   ⚠️  No authenticated user (using service role)');
} else if (user) {
  console.log('   ✓ Current user ID:', user.id);
  console.log('   ✓ User email:', user.email);
}

// Step 5: Find relationship between auth user and player_profile
if (profiles && profiles.length > 0 && 'user_id' in profiles[0]) {
  console.log('\n5. Testing relationship: auth.uid() → player_profiles...');

  // Get first profile
  const { data: firstProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1)
    .single();

  if (firstProfile) {
    console.log('   ✓ Sample auth user id (from profiles):', firstProfile.id);

    // Find player_profile for this user
    const { data: playerProfile, error: ppError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', firstProfile.id)
      .maybeSingle();

    if (ppError) {
      console.error('   ❌ Error finding player_profile:', ppError.message);
    } else if (playerProfile) {
      console.log('   ✓ Found player_profile for user:', playerProfile.id);
      console.log('   ✓ player_profile.user_id:', playerProfile.user_id);
      console.log('   ✓ Relationship CONFIRMED: profiles.id → player_profiles.user_id');
    } else {
      console.log('   ⚠️  No player_profile found for this user');
    }
  }
}

// Step 6: Check RLS policies
console.log('\n6. Checking current RLS policies on tryout_applications...');
const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
  sql_query: `
    SELECT
      policyname,
      cmd,
      CASE
        WHEN qual IS NOT NULL THEN 'USING: ' || pg_get_expr(qual, 'tryout_applications'::regclass)
        ELSE 'No USING clause'
      END as using_clause,
      CASE
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || pg_get_expr(with_check, 'tryout_applications'::regclass)
        ELSE 'No WITH CHECK clause'
      END as with_check_clause
    FROM pg_policies
    WHERE tablename = 'tryout_applications'
    ORDER BY policyname;
  `
});

if (policyError) {
  console.error('   ❌ Error fetching policies:', policyError.message);
  console.log('   ℹ️  Note: exec_sql function may not be available');
} else {
  console.log('   ✓ Current RLS policies:');
  if (policies && policies.length > 0) {
    policies.forEach(policy => {
      console.log(`\n   Policy: ${policy.policyname}`);
      console.log(`   Command: ${policy.cmd}`);
      console.log(`   ${policy.using_clause}`);
      console.log(`   ${policy.with_check_clause}`);
    });
  } else {
    console.log('   ⚠️  No RLS policies found on tryout_applications table');
  }
}

console.log('\n=== Diagnosis Complete ===\n');
