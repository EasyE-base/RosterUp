import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupCompleteEnvironment() {
  console.log('🚀 Setting up complete test environment...\n');

  try {
    // Use the first player profile we found
    const testPlayerUserId = '50b8ff56-dfba-42cf-b08a-ce6487ca32aa';

    console.log('📋 Step 1: Creating Test Organization...');

    // Check if profile exists for this user
    const { data: existingProfile, error: profError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .eq('user_id', testPlayerUserId)
      .maybeSingle();

    if (profError && profError.code !== 'PGRST116') throw profError;

    if (!existingProfile) {
      // Create profile
      const { error: createProfError } = await supabase
        .from('profiles')
        .insert({
          user_id: testPlayerUserId,
          first_name: 'Test',
          last_name: 'Organizer',
          account_type: 'organization'
        });

      if (createProfError && createProfError.code !== '23505') {
        throw createProfError;
      }
      console.log('   ✅ Created profile for test user');
    } else {
      console.log('   ℹ️  Profile already exists');
    }

    // Create organization
    const { data: existingOrg, error: checkOrgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('user_id', testPlayerUserId)
      .maybeSingle();

    if (checkOrgError && checkOrgError.code !== 'PGRST116') throw checkOrgError;

    let testOrg;
    if (existingOrg) {
      testOrg = existingOrg;
      console.log(`   ℹ️  Organization already exists: ${testOrg.name}`);
    } else {
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          user_id: testPlayerUserId,
          name: 'Test Softball Organization',
          primary_sport: 'Softball',
          city: 'Los Angeles',
          state: 'CA',
          mission: 'Testing guest player feature'
        })
        .select()
        .single();

      if (orgError) throw orgError;

      testOrg = newOrg;
      console.log(`   ✅ Created organization: ${testOrg.name}`);
    }
    console.log('');

    // Step 2: Create Team
    console.log('📋 Step 2: Creating Test Team...');

    const { data: existingTeam, error: checkTeamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('organization_id', testOrg.id)
      .maybeSingle();

    if (checkTeamError && checkTeamError.code !== 'PGRST116') throw checkTeamError;

    let testTeam;
    if (existingTeam) {
      testTeam = existingTeam;
      console.log(`   ℹ️  Team already exists: ${testTeam.name}`);
    } else {
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          organization_id: testOrg.id,
          name: 'Elite Softball Squad',
          sport: 'Softball',
          age_group: '16U',
          gender: 'Girls',
          location_city: 'Los Angeles',
          location_state: 'CA',
          skill_level: 'A'
        })
        .select()
        .single();

      if (teamError) throw teamError;

      testTeam = newTeam;
      console.log(`   ✅ Created team: ${testTeam.name}`);
    }
    console.log('');

    // Step 3: Create Tournament
    console.log('📋 Step 3: Creating Test Tournament...');

    const { data: existingTournament, error: checkTournError } = await supabase
      .from('tournaments')
      .select('id, title')
      .eq('organization_id', testOrg.id)
      .maybeSingle();

    if (checkTournError && checkTournError.code !== 'PGRST116') throw checkTournError;

    let testTournament;
    if (existingTournament) {
      testTournament = existingTournament;
      console.log(`   ℹ️  Tournament already exists: ${testTournament.title}`);
    } else {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      const { data: newTournament, error: tournError } = await supabase
        .from('tournaments')
        .insert({
          organization_id: testOrg.id,
          title: 'Guest Player Test Tournament',
          sport: 'Softball',
          age_group: '16U',
          gender: 'Girls',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          registration_deadline: startDate.toISOString().split('T')[0],
          location_city: 'Los Angeles',
          location_state: 'CA',
          location_address: '123 Tournament Way',
          max_teams: 16,
          entry_fee: 500,
          status: 'open',
          description: 'A test tournament for guest player functionality'
        })
        .select()
        .single();

      if (tournError) throw tournError;

      testTournament = newTournament;
      console.log(`   ✅ Created tournament: ${testTournament.title}`);
    }
    console.log('');

    // Step 4: Register Team for Tournament
    console.log('📋 Step 4: Registering Team for Tournament...');

    const { data: existingParticipation, error: checkPartError } = await supabase
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', testTournament.id)
      .eq('team_id', testTeam.id)
      .maybeSingle();

    if (checkPartError && checkPartError.code !== 'PGRST116') throw checkPartError;

    if (existingParticipation) {
      console.log('   ℹ️  Team already registered for tournament');
    } else {
      const { error: partError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: testTournament.id,
          team_id: testTeam.id,
          organization_id: testOrg.id,
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        });

      if (partError) throw partError;

      console.log('   ✅ Registered team for tournament');
    }
    console.log('');

    // Step 5: Get a different player to be the guest player
    console.log('📋 Step 5: Setting up Guest Player Application...');

    const { data: guestPlayerProfile, error: gpError } = await supabase
      .from('player_profiles')
      .select('id, user_id, sport, age_group')
      .neq('user_id', testPlayerUserId)
      .eq('sport', 'Softball')
      .limit(1)
      .maybeSingle();

    if (gpError && gpError.code !== 'PGRST116') throw gpError;

    if (!guestPlayerProfile) {
      console.log('   ⚠️  No other player profiles found to use as guest player');
      console.log('   💡 You can create another player account and apply manually');
    } else {
      const { data: existingApp, error: checkAppError } = await supabase
        .from('guest_players')
        .select('id, status')
        .eq('tournament_id', testTournament.id)
        .eq('player_id', guestPlayerProfile.id)
        .maybeSingle();

      if (checkAppError && checkAppError.code !== 'PGRST116') throw checkAppError;

      if (existingApp) {
        console.log(`   ℹ️  Guest player application already exists (Status: ${existingApp.status})`);

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
          console.log('   ✅ Reset guest player application to available');
        }
      } else {
        const { error: insertError } = await supabase
          .from('guest_players')
          .insert({
            tournament_id: testTournament.id,
            player_id: guestPlayerProfile.id,
            status: 'available',
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        console.log('   ✅ Created guest player application');
      }

      console.log('');

      // Display complete test information
      console.log('═══════════════════════════════════════════════════════════');
      console.log('✨ TEST ENVIRONMENT READY! ✨');
      console.log('═══════════════════════════════════════════════════════════\n');

      console.log('📊 Test Configuration:');
      console.log(`   🏢 Organization: ${testOrg.name}`);
      console.log(`   👤 Organization User ID: ${testPlayerUserId}`);
      console.log(`   🏀 Team: ${testTeam.name}`);
      console.log(`   🏆 Tournament: ${testTournament.title}`);
      console.log(`   🆔 Tournament ID: ${testTournament.id}`);
      console.log(`   👥 Guest Player User ID: ${guestPlayerProfile.user_id}`);
      console.log('');

      console.log('🧪 TESTING INSTRUCTIONS:\n');

      console.log('═══════════════════════════════════════════════════════════');
      console.log('PART 1: Test Guest Player Application (as Player)');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`1. Login with player account:`);
      console.log(`   User ID: ${guestPlayerProfile.user_id}`);
      console.log(`   (You may need to know the email/password for this account)`);
      console.log('');
      console.log(`2. Navigate to tournament:`);
      console.log(`   URL: http://localhost:5173/tournaments/${testTournament.id}`);
      console.log('');
      console.log('3. Verify you see:');
      console.log('   ✓ "Apply as Guest Player" button OR');
      console.log('   ✓ "Waiting for Team Invites" status (if already applied)');
      console.log('');
      console.log('4. If not applied, click "Apply as Guest Player"');
      console.log('5. Verify status changes to "Waiting for Team Invites"');
      console.log('');

      console.log('═══════════════════════════════════════════════════════════');
      console.log('PART 2: Test Guest Player Management (as Organization)');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`1. Login with organization account:`);
      console.log(`   User ID: ${testPlayerUserId}`);
      console.log(`   (This is the organization owner account)`);
      console.log('');
      console.log(`2. Navigate to tournament:`);
      console.log(`   URL: http://localhost:5173/tournaments/${testTournament.id}`);
      console.log('');
      console.log('3. Verify you see:');
      console.log('   ✓ "Guest Players" button (cyan/blue gradient)');
      console.log('   ✓ "Edit" button (if you own the tournament)');
      console.log('');
      console.log('4. Click "Guest Players" button');
      console.log('');
      console.log('5. On Guest Players page, verify you see:');
      console.log(`   ✓ Header: "Guest Players"`);
      console.log(`   ✓ Badge: "Inviting for: ${testTeam.name}"`);
      console.log('   ✓ Stats dashboard showing:');
      console.log('     - Available Guest Players: 1');
      console.log('     - Invited by Your Team: 0');
      console.log('     - Invited by Other Teams: 0');
      console.log('   ✓ Player card with profile information');
      console.log('   ✓ "Invite to Team" button');
      console.log('');
      console.log('6. Click "Invite to Team" button');
      console.log('');
      console.log('7. Verify:');
      console.log('   ✓ Player moves to "Players You Invited" section');
      console.log('   ✓ Stats update: "Invited by Your Team" shows 1');
      console.log('   ✓ Status shows "INVITED - Awaiting Response"');
      console.log('');

      console.log('═══════════════════════════════════════════════════════════');
      console.log('PART 3: Test Invitation Response (back as Player)');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`1. Login with player account again:`);
      console.log(`   User ID: ${guestPlayerProfile.user_id}`);
      console.log('');
      console.log(`2. Navigate to tournament:`);
      console.log(`   URL: http://localhost:5173/tournaments/${testTournament.id}`);
      console.log('');
      console.log('3. Verify you see:');
      console.log('   ✓ "Team Invitation Received!" status');
      console.log(`   ✓ Team name: ${testTeam.name}`);
      console.log('   ✓ "Accept" button (green)');
      console.log('   ✓ "Decline" button (gray)');
      console.log('');
      console.log('4. Click "Accept"');
      console.log('');
      console.log('5. Verify status changes to:');
      console.log('   ✓ "Joined as Guest Player"');
      console.log('   ✓ Green checkmark icon');
      console.log('');

      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔗 Quick Links:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Tournament Page: http://localhost:5173/tournaments/${testTournament.id}`);
      console.log(`Guest Players Management: http://localhost:5173/tournaments/${testTournament.id}/guest-players`);
      console.log('');

      console.log('💡 Troubleshooting Tips:');
      console.log('   • Open browser console (F12) to check for errors');
      console.log('   • Verify you\'re logged in with the correct account');
      console.log('   • Check Network tab to see API responses');
      console.log('   • If button doesn\'t appear, check team registration');
      console.log('   • RLS policies must allow access for both users');
      console.log('');

      console.log('🎉 Happy Testing!');
      console.log('');
    }

  } catch (err) {
    console.error('❌ Error during setup:', err);
    console.error('Details:', err.message);
    if (err.details) console.error('SQL Details:', err.details);
  }
}

setupCompleteEnvironment();
