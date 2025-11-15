import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupCompleteTest() {
  console.log('🚀 Setting up complete guest player test...\n');

  try {
    // 1. Find or create a tournament with an organization
    console.log('📋 Step 1: Finding/Creating Tournament...');

    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, title, organization_id, organizations(id, name, user_id)')
      .not('organization_id', 'is', null)
      .limit(1);

    if (tError) throw tError;

    let tournament;
    if (tournaments && tournaments.length > 0) {
      tournament = tournaments[0];
      console.log(`   ✅ Found tournament: "${tournament.title}"`);
    } else {
      console.log('   ❌ No tournaments with organizations found');
      return;
    }

    console.log(`   🏢 Organization: ${tournament.organizations?.name}`);
    console.log(`   👤 Org Owner User ID: ${tournament.organizations?.user_id}\n`);

    // 2. Check if organization has teams
    console.log('📋 Step 2: Checking Organization Teams...');

    const { data: teams, error: teamError } = await supabase
      .from('teams')
      .select('id, name, sport, age_group, organization_id')
      .eq('organization_id', tournament.organization_id);

    if (teamError) throw teamError;

    let testTeam;
    if (teams && teams.length > 0) {
      testTeam = teams[0];
      console.log(`   ✅ Found ${teams.length} team(s)`);
      teams.forEach((team, i) => {
        console.log(`      ${i + 1}. ${team.name} (${team.sport} - ${team.age_group})`);
      });
    } else {
      console.log('   ⚠️  No teams found. Creating test team...');

      const { data: newTeam, error: createError } = await supabase
        .from('teams')
        .insert({
          organization_id: tournament.organization_id,
          name: 'Elite Softball Team',
          sport: 'Softball',
          age_group: '16U',
          gender: 'Co-ed',
          location_city: 'Los Angeles',
          location_state: 'CA',
          skill_level: 'A',
        })
        .select()
        .single();

      if (createError) throw createError;

      testTeam = newTeam;
      console.log(`   ✅ Created team: ${testTeam.name}`);
    }
    console.log('');

    // 3. Register team for tournament
    console.log('📋 Step 3: Registering Team for Tournament...');

    const { data: existingParticipation, error: checkError } = await supabase
      .from('tournament_participants')
      .select('id, team_id')
      .eq('tournament_id', tournament.id)
      .eq('team_id', testTeam.id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingParticipation) {
      console.log(`   ℹ️  Team already registered for tournament`);
    } else {
      const { error: regError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournament.id,
          team_id: testTeam.id,
          organization_id: tournament.organization_id,
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        });

      if (regError) throw regError;

      console.log(`   ✅ Registered team for tournament`);
    }
    console.log('');

    // 4. Find or create a player profile
    console.log('📋 Step 4: Finding/Creating Test Player...');

    const { data: playerProfiles, error: ppError } = await supabase
      .from('player_profiles')
      .select('id, user_id, sport, age_group')
      .eq('sport', 'Softball')
      .limit(1);

    if (ppError) throw ppError;

    let testPlayer;
    if (playerProfiles && playerProfiles.length > 0) {
      testPlayer = playerProfiles[0];
      console.log(`   ✅ Found test player (ID: ${testPlayer.id})`);
    } else {
      console.log('   ❌ No player profiles found. Please create a player account first.');
      console.log('   💡 Visit the app and create a player profile to continue testing.');
      return;
    }
    console.log('');

    // 5. Create guest player application
    console.log('📋 Step 5: Creating Guest Player Application...');

    const { data: existingApp, error: checkAppError } = await supabase
      .from('guest_players')
      .select('id, status')
      .eq('tournament_id', tournament.id)
      .eq('player_id', testPlayer.id)
      .maybeSingle();

    if (checkAppError && checkAppError.code !== 'PGRST116') throw checkAppError;

    if (existingApp) {
      console.log(`   ℹ️  Guest player application already exists (Status: ${existingApp.status})`);

      // Reset to available if it's in another state
      if (existingApp.status !== 'available') {
        const { error: updateError } = await supabase
          .from('guest_players')
          .update({
            status: 'available',
            invited_by_team_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingApp.id);

        if (updateError) throw updateError;
        console.log(`   ✅ Reset application to 'available' status`);
      }
    } else {
      const { error: insertError } = await supabase
        .from('guest_players')
        .insert({
          tournament_id: tournament.id,
          player_id: testPlayer.id,
          status: 'available',
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      console.log(`   ✅ Created guest player application`);
    }
    console.log('');

    // 6. Display test summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ TEST SETUP COMPLETE! ✨');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 Test Configuration:');
    console.log(`   🏆 Tournament: ${tournament.title}`);
    console.log(`   🆔 Tournament ID: ${tournament.id}`);
    console.log(`   🏀 Team: ${testTeam.name}`);
    console.log(`   👥 Player Applied: Yes (Status: available)`);
    console.log('');

    console.log('🧪 Testing Instructions:\n');

    console.log('PART 1: Test as Organization (Team Manager)');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`1. Login with organization owner account`);
    console.log(`   User ID: ${tournament.organizations?.user_id}`);
    console.log(`2. Navigate to: http://localhost:5173/tournaments/${tournament.id}`);
    console.log(`3. You should see a "Guest Players" button (cyan/blue gradient)`);
    console.log(`4. Click "Guest Players" button`);
    console.log(`5. Verify you see:`);
    console.log(`   • "Inviting for: ${testTeam.name}" badge`);
    console.log(`   • Stats showing "1 Available Guest Player"`);
    console.log(`   • Player card with profile information`);
    console.log(`   • "Invite to Team" button`);
    console.log(`6. Click "Invite to Team"`);
    console.log(`7. Verify player moves to "Players You Invited" section`);
    console.log('');

    console.log('PART 2: Test as Player');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`1. Login with player account`);
    console.log(`   Player User ID: ${testPlayer.user_id}`);
    console.log(`2. Navigate to: http://localhost:5173/tournaments/${tournament.id}`);
    console.log(`3. You should see "Team Invitation Received!" status`);
    console.log(`4. Click "Accept" or "Decline"`);
    console.log(`5. Verify status updates correctly`);
    console.log('');

    console.log('🔗 Quick Links:');
    console.log(`   Tournament Page: http://localhost:5173/tournaments/${tournament.id}`);
    console.log(`   Guest Players Management: http://localhost:5173/tournaments/${tournament.id}/guest-players`);
    console.log('');

    console.log('💡 Tips:');
    console.log('   • If button doesn\'t appear, verify team is registered for tournament');
    console.log('   • Check browser console for any errors');
    console.log('   • Database RLS policies must allow access for both users');
    console.log('');

  } catch (err) {
    console.error('❌ Error during setup:', err);
    console.error('Details:', err.message);
  }
}

setupCompleteTest();
