import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupOrgForTesting() {
  console.log('🔧 Setting up organization for testing...\n');

  const tournamentId = '092dbff2-9013-4ed9-9eeb-15230025c394';

  try {
    // Get the tournament and its organization
    const { data: tournament, error: tError } = await supabase
      .from('tournaments')
      .select('id, title, organization_id, organizations(id, name, user_id)')
      .eq('id', tournamentId)
      .maybeSingle();

    if (tError || !tournament) {
      console.error('❌ Tournament not found or error:', tError);
      return;
    }

    console.log('🏆 Tournament:', tournament.title);

    if (!tournament.organization_id) {
      console.log('⚠️  This tournament has no organization. Cannot test guest player management.');
      return;
    }

    console.log('🏢 Organization:', tournament.organizations?.name);
    console.log('👤 Organization Owner User ID:', tournament.organizations?.user_id);
    console.log('\n');

    // Check for guest players
    const { data: guestPlayers, error: gpError } = await supabase
      .from('guest_players')
      .select(`
        id,
        status,
        created_at,
        player_profiles!inner(id, sport, age_group)
      `)
      .eq('tournament_id', tournamentId);

    if (gpError) {
      console.error('❌ Error checking guest players:', gpError);
    } else {
      console.log(`📊 Guest Players: ${guestPlayers?.length || 0}`);
      if (guestPlayers && guestPlayers.length > 0) {
        guestPlayers.forEach((gp, i) => {
          console.log(`   ${i + 1}. Status: ${gp.status}`);
        });
      }
    }

    // Check for teams in this organization
    const { data: teams, error: teamError } = await supabase
      .from('teams')
      .select('id, name, sport, age_group')
      .eq('organization_id', tournament.organization_id);

    if (teamError) {
      console.error('❌ Error fetching teams:', teamError);
    } else {
      console.log(`\n🏀 Teams: ${teams?.length || 0}`);
      if (teams && teams.length > 0) {
        teams.forEach((team, i) => {
          console.log(`   ${i + 1}. ${team.name} (${team.sport} - ${team.age_group})`);
        });
      } else {
        console.log('   ⚠️  No teams found. Creating a test team...');

        // Create a test team
        const { data: newTeam, error: createError } = await supabase
          .from('teams')
          .insert({
            organization_id: tournament.organization_id,
            name: 'Elite Softball Squad',
            sport: 'Softball',
            age_group: '16U',
            gender: 'Co-ed',
            location_city: 'Los Angeles',
            location_state: 'CA',
            skill_level: 'A',
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating team:', createError);
        } else {
          console.log('✅ Created test team:', newTeam.name);
        }
      }
    }

    console.log('\n📍 To test the guest player management:');
    console.log('   1. The test player has already applied as a guest player');
    console.log('   2. Navigate to: http://localhost:5173/tournaments/' + tournamentId + '/guest-players');
    console.log('   3. You should see the guest player management interface');
    console.log('\n   Note: You need to be logged in as the organization owner to access this page.');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

setupOrgForTesting();
