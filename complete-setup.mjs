import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🎬 Complete Guest Player Test Setup\n');
console.log('This script will set up everything needed for testing.\n');

// Get current user (from existing session if any)
const { data: { session } } = await supabase.auth.getSession();
const userId = session?.user?.id;

console.log('Current user:', userId || 'Not logged in (using anon access)');

// Step 1: Find organizations with teams
console.log('\n📋 Step 1: Finding organizations with teams...');

const { data: orgs } = await supabase
  .from('organizations')
  .select('id, name, user_id')
  .limit(1);

if (!orgs || orgs.length === 0) {
  console.log('❌ No organizations found in database');
  console.log('💡 Please create an organization through the UI first');
  console.log('   Visit: http://localhost:5173/signup');
  process.exit(0);
}

const org = orgs[0];
console.log(`✅ Using organization: ${org.name} (User: ${org.user_id})`);

// Step 2: Find teams for this org
console.log('\n📋 Step 2: Finding teams...');

const { data: teams } = await supabase
  .from('teams')
  .select('id, name, sport, age_group')
  .eq('organization_id', org.id);

if (!teams || teams.length === 0) {
  console.log('❌ No teams found');
  console.log('💡 Please create a team through the UI');
  process.exit(0);
}

console.log(`✅ Found ${teams.length} team(s):`);
teams.forEach((t, i) => console.log(`   ${i + 1}. ${t.name} (${t.sport} - ${t.age_group})`));

const team = teams[0];

// Step 3: Find or create tournament
console.log('\n📋 Step 3: Finding/Creating tournament...');

const { data: existingTournaments } = await supabase
  .from('tournaments')
  .select('id, title, organization_id')
  .eq('organization_id', org.id)
  .eq('sport', team.sport)
  .eq('status', 'open')
  .limit(1);

let tournament;

if (existingTournaments && existingTournaments.length > 0) {
  tournament = existingTournaments[0];
  console.log(`✅ Using existing tournament: ${tournament.title}`);
} else {
  console.log('Creating new tournament...');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);

  const { data: newTourn, error: tournErr } = await supabase
    .from('tournaments')
    .insert({
      organization_id: org.id,
      title: 'Guest Player Test Tournament',
      sport: team.sport,
      age_group: team.age_group,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      registration_deadline: startDate.toISOString().split('T')[0],
      location_city: 'Los Angeles',
      location_state: 'CA',
      location_address: '123 Test St',
      max_teams: 16,
      entry_fee: 500,
      status: 'open',
      description: 'Test tournament for guest player feature',
      format_type: 'single_elimination'
    })
    .select()
    .single();

  if (tournErr) {
    console.error('❌ Error creating tournament:', tournErr);
    process.exit(1);
  }

  tournament = newTourn;
  console.log(`✅ Created tournament: ${tournament.title}`);
}

console.log(`   Tournament ID: ${tournament.id}`);

// Step 4: Register team for tournament
console.log('\n📋 Step 4: Registering team for tournament...');

const { data: existingReg } = await supabase
  .from('tournament_participants')
  .select('id')
  .eq('tournament_id', tournament.id)
  .eq('team_id', team.id)
  .maybeSingle();

if (existingReg) {
  console.log('✅ Team already registered');
} else {
  const { error: regErr } = await supabase
    .from('tournament_participants')
    .insert({
      tournament_id: tournament.id,
      team_id: team.id,
      organization_id: org.id,
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    });

  if (regErr) {
    console.error('❌ Error:', regErr);
  } else {
    console.log(`✅ Registered "${team.name}" for tournament`);
  }
}

// Step 5: Get a player profile to use as guest player
console.log('\n📋 Step 5: Finding player for guest player test...');

const { data: players } = await supabase
  .from('player_profiles')
  .select('id, user_id, sport, age_group')
  .eq('sport', team.sport)
  .limit(5);

if (!players || players.length === 0) {
  console.log('❌ No player profiles found');
  console.log('💡 Create a player account to test guest player flow');
} else {
  console.log(`✅ Found ${players.length} player profile(s)`);
  const player = players[0];

  //  Check if already applied
  const { data: existingApp } = await supabase
    .from('guest_players')
    .select('id, status')
    .eq('tournament_id', tournament.id)
    .eq('player_id', player.id)
    .maybeSingle();

  if (existingApp) {
    console.log(`✅ Player already applied (Status: ${existingApp.status})`);
  } else {
    console.log('Creating guest player application...');

    const { error: appErr } = await supabase
      .from('guest_players')
      .insert({
        tournament_id: tournament.id,
        player_id: player.id,
        status: 'available',
        updated_at: new Date().toISOString()
      });

    if (appErr) {
      console.error('❌ Error:', appErr);
    } else {
      console.log('✅ Player applied as guest player');
    }
  }
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✨ SETUP COMPLETE! ✨');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('🧪 Testing Instructions:\n');
console.log('1. Navigate to tournament page:');
console.log(`   http://localhost:5173/tournaments/${tournament.id}`);
console.log('');
console.log('2. You should see the "Guest Players" button (cyan/blue)');
console.log('');
console.log('3. Click it to test the guest player management interface');
console.log('');
console.log(`👤 Organization User ID: ${org.user_id}`);
console.log(`🏀 Team: ${team.name}`);
console.log(`🏆 Tournament: ${tournament.title}`);
console.log('');
