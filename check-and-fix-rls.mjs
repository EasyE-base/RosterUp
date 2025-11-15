import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking tournament_participants RLS policies...\n');

// Check if we're logged in
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  console.log('❌ Not logged in. Please log in through the UI first.\n');
  process.exit(0);
}

console.log('✅ Logged in as:', session.user.email);

// Get organization
const { data: org } = await supabase
  .from('organizations')
  .select('id, name')
  .eq('user_id', session.user.id)
  .maybeSingle();

if (!org) {
  console.log('❌ No organization found\n');
  process.exit(0);
}

console.log('✅ Organization:', org.name, '\n');

// Test 1: Try to SELECT from tournament_participants
console.log('📊 Test 1: SELECT from tournament_participants...');
const { data: participants, error: selectError } = await supabase
  .from('tournament_participants')
  .select('*')
  .limit(1);

if (selectError) {
  console.log('❌ SELECT Error:');
  console.log('  Code:', selectError.code);
  console.log('  Message:', selectError.message);
  console.log('  Details:', selectError.details);
  console.log('  Hint:', selectError.hint);
} else {
  console.log('✅ SELECT works');
  console.log('  Rows:', participants ? participants.length : 0);
}

console.log('');

// Test 2: Try to INSERT a test record
console.log('📊 Test 2: INSERT into tournament_participants...');

// First, get a tournament
const { data: tournaments } = await supabase
  .from('tournaments')
  .select('id, title')
  .limit(1);

if (!tournaments || tournaments.length === 0) {
  console.log('⚠️  No tournaments found to test with\n');
} else {
  const tournamentId = tournaments[0].id;
  console.log('  Using tournament:', tournaments[0].title);

  // Get a team from this org
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('organization_id', org.id)
    .limit(1);

  if (!teams || teams.length === 0) {
    console.log('⚠️  No teams found to test with\n');
  } else {
    const teamId = teams[0].id;
    console.log('  Using team:', teams[0].name);

    const testData = {
      tournament_id: tournamentId,
      team_id: teamId,
      organization_id: org.id,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('tournament_participants')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.log('❌ INSERT Error:');
      console.log('  Code:', insertError.code);
      console.log('  Message:', insertError.message);
      console.log('  Details:', insertError.details);
      console.log('  Hint:', insertError.hint);
      console.log('\n🔧 This is the error causing your registration to fail!\n');
      console.log('To fix this, run the RLS policy migration:');
      console.log('  node apply-tournament-participants-rls.mjs');
      console.log('\nOr manually apply fix-tournament-participants-rls.sql to your database');
    } else {
      console.log('✅ INSERT works');
      console.log('  ID:', insertResult.id);
      console.log('\n🧹 Cleaning up test record...');

      // Delete the test record
      await supabase
        .from('tournament_participants')
        .delete()
        .eq('id', insertResult.id);

      console.log('✅ Test record deleted');
    }
  }
}

console.log('\n✅ RLS check complete');
