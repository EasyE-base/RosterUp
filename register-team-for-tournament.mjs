import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tournamentId = '092dbff2-9013-4ed9-9eeb-15230025c394';

async function registerTeam() {
  console.log('🏀 Registering team for tournament...\n');

  // Get the tournament's organization
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('organization_id, title')
    .eq('id', tournamentId)
    .single();

  console.log('Tournament:', tournament.title);
  console.log('Org ID:', tournament.organization_id);

  // Get a team from this organization
  const { data: team } = await supabase
    .from('teams')
    .select('id, name')
    .eq('organization_id', tournament.organization_id)
    .limit(1)
    .single();

  console.log('Team:', team.name);

  // Check if already registered
  const { data: existing } = await supabase
    .from('tournament_participants')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('team_id', team.id)
    .maybeSingle();

  if (existing) {
    console.log('✅ Team already registered!');
  } else {
    // Register the team
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
    }
  }

  console.log('\n🎉 Now refresh the tournament page to see the "Guest Players" button!');
}

registerTeam();
