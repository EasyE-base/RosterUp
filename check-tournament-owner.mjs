import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTournamentOwner() {
  console.log('🔍 Checking tournament ownership...\n');

  const tournamentId = '092dbff2-9013-4ed9-9eeb-15230025c394';

  try {
    // Get tournament with organization
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select(`
        id,
        title,
        organization_id,
        organizations (
          id,
          name,
          user_id
        )
      `)
      .eq('id', tournamentId)
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('🏆 Tournament:', tournament.title);
    console.log('🏢 Organization:', tournament.organizations?.name || 'No organization');
    console.log('👤 Organization User ID:', tournament.organizations?.user_id || 'N/A');
    console.log('\n');

    // Get guest player count
    const { data: guestPlayers, error: gpError } = await supabase
      .from('guest_players')
      .select('*')
      .eq('tournament_id', tournamentId);

    if (gpError) {
      console.error('❌ Error fetching guest players:', gpError);
    } else {
      console.log(`📊 Guest Players Applied: ${guestPlayers?.length || 0}`);
      if (guestPlayers && guestPlayers.length > 0) {
        guestPlayers.forEach((gp, i) => {
          console.log(`   ${i + 1}. Status: ${gp.status}, Player ID: ${gp.player_id}`);
        });
      }
    }

    // Check if organization has teams
    if (tournament.organizations?.id) {
      const { data: teams, error: teamError } = await supabase
        .from('teams')
        .select('id, name, sport, age_group')
        .eq('organization_id', tournament.organizations.id);

      if (teamError) {
        console.error('❌ Error fetching teams:', teamError);
      } else {
        console.log(`\n🏀 Organization Teams: ${teams?.length || 0}`);
        if (teams && teams.length > 0) {
          teams.forEach((team, i) => {
            console.log(`   ${i + 1}. ${team.name} (${team.sport} - ${team.age_group})`);
          });
        } else {
          console.log('   ⚠️  No teams found. The organization needs teams to invite guest players.');
        }
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkTournamentOwner();
