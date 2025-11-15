import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debugging Tournament Participant Errors\n');

// Check current session
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

console.log('✅ Organization:', org.name, `(${org.id})\n`);

// Test 1: Load tournaments table (same query as TournamentDetails line 80-84)
console.log('📊 Test 1: Loading tournament (simulating TournamentDetails.loadTournament)...\n');

// Get first tournament
const { data: tournaments } = await supabase
  .from('tournaments')
  .select('id')
  .limit(1);

if (!tournaments || tournaments.length === 0) {
  console.log('❌ No tournaments found in database\n');
  process.exit(0);
}

const tournamentId = tournaments[0].id;
console.log(`Using tournament ID: ${tournamentId}\n`);

const { data: tournament, error: tourError } = await supabase
  .from('tournaments')
  .select('*, organizations(name, city, state, logo_url)')
  .eq('id', tournamentId)
  .maybeSingle();

if (tourError) {
  console.log('❌ ERROR loading tournament:');
  console.log('Message:', tourError.message);
  console.log('Code:', tourError.code);
  console.log('Details:', tourError.details);
  console.log('Full error:', JSON.stringify(tourError, null, 2));
} else {
  console.log('✅ Tournament loaded successfully');
  console.log('Title:', tournament.title);
}

console.log('\n' + '='.repeat(60) + '\n');

// Test 2: Load participants (same query as TournamentDetails line 98-102)
console.log('📊 Test 2: Loading participants (simulating TournamentDetails.loadParticipants)...\n');

const { data: participants, error: partError } = await supabase
  .from('tournament_participants')
  .select('*, organizations(name, city, state), teams(name, sport, age_group, gender, logo_url)')
  .eq('tournament_id', tournamentId)
  .order('confirmed_at', { ascending: true });

if (partError) {
  console.log('❌ ERROR loading participants:');
  console.log('Message:', partError.message);
  console.log('Code:', partError.code);
  console.log('Details:', partError.details);
  console.log('Full error:', JSON.stringify(partError, null, 2));
  console.log('\n🔍 Let\'s check what columns exist in tournament_participants...\n');

  // Try a simpler query to see what's available
  const { data: simple, error: simpleError } = await supabase
    .from('tournament_participants')
    .select('*')
    .limit(1);

  if (simpleError) {
    console.log('❌ Even simple SELECT * failed:');
    console.log('Message:', simpleError.message);
  } else if (simple && simple.length > 0) {
    console.log('✅ Simple query works. Available columns:');
    console.log(Object.keys(simple[0]));
  } else {
    console.log('⚠️ No participants in database');
  }
} else {
  console.log('✅ Participants loaded successfully');
  console.log('Count:', participants ? participants.length : 0);
  if (participants && participants.length > 0) {
    console.log('Sample participant:', JSON.stringify(participants[0], null, 2));
  }
}

console.log('\n' + '='.repeat(60) + '\n');

// Test 3: Get teams for current org
console.log('📊 Test 3: Getting teams for current organization...\n');

const { data: teams, error: teamsError } = await supabase
  .from('teams')
  .select('id, name, sport, age_group')
  .eq('organization_id', org.id);

if (teamsError) {
  console.log('❌ ERROR loading teams:');
  console.log('Message:', teamsError.message);
} else {
  console.log('✅ Teams loaded successfully');
  console.log('Count:', teams ? teams.length : 0);
  if (teams && teams.length > 0) {
    console.log('Teams:', teams);
  }
}

console.log('\n' + '='.repeat(60) + '\n');

// Test 4: Try to register a team (if we have one)
if (teams && teams.length > 0 && tournament) {
  console.log('📊 Test 4: Testing team registration...\n');

  const testTeam = teams[0];
  console.log(`Attempting to register team: ${testTeam.name} (${testTeam.id})`);
  console.log('To tournament:', tournament.title);

  const insertData = {
    tournament_id: tournamentId,
    team_id: testTeam.id,
    organization_id: org.id,
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
  };

  console.log('\nData to insert:');
  console.log(JSON.stringify(insertData, null, 2));

  const { data: result, error: insertError } = await supabase
    .from('tournament_participants')
    .insert(insertData)
    .select()
    .single();

  if (insertError) {
    console.log('\n❌ ERROR inserting participant:');
    console.log('Message:', insertError.message);
    console.log('Code:', insertError.code);
    console.log('Details:', insertError.details);
    console.log('Hint:', insertError.hint);
    console.log('Full error:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('\n✅ SUCCESS! Team registered:');
    console.log('ID:', result.id);
    console.log('\n🧹 Cleaning up - deleting test registration...');

    await supabase
      .from('tournament_participants')
      .delete()
      .eq('id', result.id);

    console.log('✅ Test registration deleted');
  }
}

console.log('\n✅ Debug script complete');
