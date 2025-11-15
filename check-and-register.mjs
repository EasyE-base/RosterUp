import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tournamentId = '092dbff2-9013-4ed9-9eeb-15230025c394';

async function checkAndRegister() {
  console.log('🔍 Checking tournament...\n');

  // Get the tournament
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*, organizations(id, name, user_id)')
    .eq('id', tournamentId)
    .maybeSingle();

  if (tErr) {
    console.error('❌ Error:', tErr);
    return;
  }

  if (!tournament) {
    console.log('❌ Tournament not found. Let me find a softball tournament...\n');

    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, title, sport, organization_id')
      .eq('sport', 'Softball')
      .not('organization_id', 'is', null)
      .limit(5);

    console.log('Available Softball tournaments:');
    tournaments?.forEach((t, i) => {
      console.log(`${i + 1}. ${t.title} (ID: ${t.id})`);
    });
    return;
  }

  console.log('✅ Tournament found:', tournament.title);
  console.log('Org:', tournament.organizations?.name);

  // Get a team
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, sport')
    .eq('organization_id', tournament.organization_id)
    .eq('sport', 'Softball');

  if (!teams || teams.length === 0) {
    console.log('❌ No softball teams found for this organization');
    return;
  }

  console.log(`\nFound ${teams.length} softball team(s):`);
  teams.forEach((t, i) => console.log(`  ${i + 1}. ${t.name}`));

  const team = teams[0];

  // Check if registered
  const { data: existing } = await supabase
    .from('tournament_participants')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('team_id', team.id)
    .maybeSingle();

  if (existing) {
    console.log('\n✅ Team already registered!');
    console.log('🔄 Refresh the page to see the "Guest Players" button');
    return;
  }

  // Register
  console.log(`\n📝 Registering "${team.name}"...`);

  const { error } = await supabase
    .from('tournament_participants')
    .insert({
      tournament_id: tournamentId,
      team_id: team.id,
      organization_id: tournament.organization_id,
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    });

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Team registered successfully!');
    console.log('\n🎉 Refresh the page to see the "Guest Players" button!');
  }
}

checkAndRegister();
