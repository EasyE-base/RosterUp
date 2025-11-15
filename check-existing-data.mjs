import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking Existing Database Data\n');

// Check organizations
const { data: orgs } = await supabase
  .from('organizations')
  .select('id, name, user_id, primary_sport')
  .limit(5);

console.log(`Organizations: ${orgs?.length || 0}`);
if (orgs && orgs.length > 0) {
  orgs.forEach((o, i) => {
    console.log(`  ${i + 1}. ${o.name} (${o.primary_sport}) - User: ${o.user_id}`);
  });
}

// Check teams
const { data: teams } = await supabase
  .from('teams')
  .select('id, name, sport, age_group, organization_id')
  .limit(10);

console.log(`\nTeams: ${teams?.length || 0}`);
if (teams && teams.length > 0) {
  teams.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (${t.sport} - ${t.age_group})`);
  });
}

// Check tournaments
const { data: tournaments } = await supabase
  .from('tournaments')
  .select('id, title, sport, status, organization_id')
  .limit(10);

console.log(`\nTournaments: ${tournaments?.length || 0}`);
if (tournaments && tournaments.length > 0) {
  tournaments.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.title} (${t.sport} - ${t.status})`);
  });
}

// Check player profiles
const { data: players } = await supabase
  .from('player_profiles')
  .select('id, user_id, sport, age_group, primary_position')
  .limit(5);

console.log(`\nPlayer Profiles: ${players?.length || 0}`);
if (players && players.length > 0) {
  players.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.sport} ${p.age_group} ${p.primary_position} - User: ${p.user_id}`);
  });
}

// Check tournament participants
const { data: participants } = await supabase
  .from('tournament_participants')
  .select('tournament_id, team_id, status')
  .limit(5);

console.log(`\nTournament Participants: ${participants?.length || 0}`);

// Check guest players
const { data: guestPlayers } = await supabase
  .from('guest_players')
  .select('tournament_id, player_id, status')
  .limit(5);

console.log(`Guest Players: ${guestPlayers?.length || 0}`);

console.log('\n═══════════════════════════════════════════════════════════\n');

if (orgs && orgs.length > 0 && teams && teams.length > 0) {
  console.log('✅ Found existing data!');
  console.log('You can use existing accounts for testing.\n');

  // If we have org + team, check if we can find a tournament to use
  const orgWithTeams = orgs[0];
  const orgTeams = teams.filter(t => t.organization_id === orgWithTeams.id);

  if (orgTeams.length > 0 && tournaments && tournaments.length > 0) {
    const tournament = tournaments.find(t => t.sport === orgTeams[0].sport);
    if (tournament) {
      console.log(`Try visiting: http://localhost:5173/tournaments/${tournament.id}`);
    }
  }
} else {
  console.log('❌ Database is empty');
  console.log('Please create accounts through the UI:');
  console.log('  1. Visit: http://localhost:5173/signup');
  console.log('  2. Create an organization account');
  console.log('  3. Create teams');
  console.log('  4. Create tournaments');
  console.log('  5. Create a player account (in incognito/different browser)');
}
