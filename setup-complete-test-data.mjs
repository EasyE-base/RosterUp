import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.pVCYqBvEoSQbSmhQnJqYJ7lgLqkE_c_WMXX7-IfZfZo';

// Use service role key to bypass RLS for test data setup
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🎯 Complete Test Data Setup for Guest Player Feature\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function setupTestData() {
  try {
    // Step 1: Create test users
    console.log('👥 Step 1: Creating test users...');

    // Organization user
    const orgEmail = `test-org-${Date.now()}@example.com`;
    const orgPassword = 'TestPass123!';

    const { data: orgAuthData, error: orgAuthError } = await supabase.auth.admin.createUser({
      email: orgEmail,
      password: orgPassword,
      email_confirm: true,
      user_metadata: {
        account_type: 'organization',
        full_name: 'Test Organization User'
      }
    });

    if (orgAuthError) {
      console.error('❌ Error creating org user:', orgAuthError);
      return;
    }

    const orgUserId = orgAuthData.user.id;
    console.log(`✅ Organization user created: ${orgEmail}`);
    console.log(`   User ID: ${orgUserId}`);
    console.log(`   Password: ${orgPassword}`);

    // Player user
    const playerEmail = `test-player-${Date.now()}@example.com`;
    const playerPassword = 'TestPass123!';

    const { data: playerAuthData, error: playerAuthError } = await supabase.auth.admin.createUser({
      email: playerEmail,
      password: playerPassword,
      email_confirm: true,
      user_metadata: {
        account_type: 'player',
        full_name: 'Test Player User'
      }
    });

    if (playerAuthError) {
      console.error('❌ Error creating player user:', playerAuthError);
      return;
    }

    const playerUserId = playerAuthData.user.id;
    console.log(`✅ Player user created: ${playerEmail}`);
    console.log(`   User ID: ${playerUserId}`);
    console.log(`   Password: ${playerPassword}`);

    // Step 2: Create organization
    console.log('\n🏢 Step 2: Creating organization...');

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        user_id: orgUserId,
        name: 'Elite Sports Academy',
        email: orgEmail,
        primary_sport: 'Softball',
        location_city: 'Los Angeles',
        location_state: 'CA',
        logo_url: null
      })
      .select()
      .single();

    if (orgError) {
      console.error('❌ Error creating organization:', orgError);
      return;
    }

    console.log(`✅ Organization created: ${org.name}`);
    console.log(`   Org ID: ${org.id}`);

    // Step 3: Create teams
    console.log('\n⚾ Step 3: Creating teams...');

    const teams = [
      {
        organization_id: org.id,
        name: 'Elite Softball Squad',
        sport: 'Softball',
        age_group: '16U',
        season: 'Summer 2025'
      },
      {
        organization_id: org.id,
        name: 'Elite Softball White',
        sport: 'Softball',
        age_group: '14U',
        season: 'Summer 2025'
      }
    ];

    const { data: createdTeams, error: teamsError } = await supabase
      .from('teams')
      .insert(teams)
      .select();

    if (teamsError) {
      console.error('❌ Error creating teams:', teamsError);
      return;
    }

    console.log(`✅ Created ${createdTeams.length} teams:`);
    createdTeams.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.name} (${t.sport} - ${t.age_group})`);
    });

    const primaryTeam = createdTeams[0];

    // Step 4: Create tournament
    console.log('\n🏆 Step 4: Creating tournament...');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const { data: tournament, error: tournError } = await supabase
      .from('tournaments')
      .insert({
        organization_id: org.id,
        title: 'Summer Showcase Tournament 2025',
        sport: 'Softball',
        age_group: '16U',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        registration_deadline: startDate.toISOString().split('T')[0],
        location_city: 'Los Angeles',
        location_state: 'CA',
        location_address: '123 Tournament Park Drive',
        max_teams: 16,
        entry_fee: 500,
        status: 'open',
        description: 'Premier showcase tournament for elite 16U softball teams. Perfect opportunity to be seen by college scouts and compete against top competition.',
        format_type: 'single_elimination'
      })
      .select()
      .single();

    if (tournError) {
      console.error('❌ Error creating tournament:', tournError);
      return;
    }

    console.log(`✅ Tournament created: ${tournament.title}`);
    console.log(`   Tournament ID: ${tournament.id}`);

    // Step 5: Register team for tournament
    console.log('\n📝 Step 5: Registering team for tournament...');

    const { error: regError } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournament.id,
        team_id: primaryTeam.id,
        organization_id: org.id,
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      });

    if (regError) {
      console.error('❌ Error registering team:', regError);
      return;
    }

    console.log(`✅ Team "${primaryTeam.name}" registered for tournament`);

    // Step 6: Create player profile
    console.log('\n🎮 Step 6: Creating player profile...');

    const { data: profile, error: profileError } = await supabase
      .from('player_profiles')
      .insert({
        user_id: playerUserId,
        sport: 'Softball',
        age_group: '16U',
        classification: 'High School',
        primary_position: 'Pitcher',
        secondary_positions: ['First Base', 'Outfield'],
        location_city: 'San Diego',
        location_state: 'CA',
        bio: 'Experienced pitcher looking for tournament opportunities. Strong fastball and changeup. Team player with competitive spirit.',
        height_feet: 5,
        height_inches: 9,
        weight: 145,
        grad_year: 2026,
        gpa: 3.8,
        act_score: 28
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating player profile:', profileError);
      return;
    }

    console.log(`✅ Player profile created`);
    console.log(`   Player ID: ${profile.id}`);

    // Step 7: Apply as guest player
    console.log('\n🤝 Step 7: Player applying as guest player...');

    const { error: guestError } = await supabase
      .from('guest_players')
      .insert({
        tournament_id: tournament.id,
        player_id: profile.id,
        status: 'available',
        updated_at: new Date().toISOString()
      });

    if (guestError) {
      console.error('❌ Error applying as guest player:', guestError);
      return;
    }

    console.log('✅ Player applied as guest player for tournament');

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✨ TEST DATA SETUP COMPLETE! ✨');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📋 Test Accounts Created:\n');

    console.log('1️⃣  ORGANIZATION ACCOUNT:');
    console.log(`   Email: ${orgEmail}`);
    console.log(`   Password: ${orgPassword}`);
    console.log(`   Organization: ${org.name}`);
    console.log(`   Team: ${primaryTeam.name}`);
    console.log('');

    console.log('2️⃣  PLAYER ACCOUNT:');
    console.log(`   Email: ${playerEmail}`);
    console.log(`   Password: ${playerPassword}`);
    console.log('');

    console.log('🏆 Tournament Details:');
    console.log(`   Title: ${tournament.title}`);
    console.log(`   ID: ${tournament.id}`);
    console.log(`   URL: http://localhost:5173/tournaments/${tournament.id}`);
    console.log('');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 TESTING INSTRUCTIONS:');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('TEST FLOW #1: Team invites guest player');
    console.log('─────────────────────────────────────────');
    console.log('1. Open browser at http://localhost:5173');
    console.log('2. Log in with ORGANIZATION account:');
    console.log(`   ${orgEmail} / ${orgPassword}`);
    console.log('3. Navigate to tournament:');
    console.log(`   http://localhost:5173/tournaments/${tournament.id}`);
    console.log('4. You should see "Guest Players" button (cyan/blue)');
    console.log('5. Click "Guest Players" button');
    console.log('6. Verify you see:');
    console.log('   - "Inviting for: Elite Softball Squad" badge');
    console.log('   - Available Guest Players section with 1 player');
    console.log('   - Player card with full profile information');
    console.log('7. Click "Invite to Team" button');
    console.log('8. Player should move to "Players You Invited" section');
    console.log('');

    console.log('TEST FLOW #2: Player accepts invitation');
    console.log('─────────────────────────────────────────');
    console.log('1. Open NEW browser tab (or incognito)');
    console.log('2. Log in with PLAYER account:');
    console.log(`   ${playerEmail} / ${playerPassword}`);
    console.log('3. Navigate to tournament:');
    console.log(`   http://localhost:5173/tournaments/${tournament.id}`);
    console.log('4. You should see invitation notification');
    console.log('5. Click "Accept" button');
    console.log('6. Status should change to "Joined as Guest Player"');
    console.log('');

    console.log('TEST FLOW #3: Test "Register Team" button');
    console.log('─────────────────────────────────────────');
    console.log('1. Create a NEW tournament as organization');
    console.log('2. Log out and create DIFFERENT organization account');
    console.log('3. Create a Softball team for new org');
    console.log('4. Browse to the tournament you created');
    console.log('5. You should see "Register Team" button (green)');
    console.log('6. Click it and select your team');
    console.log('7. Button should change to "Guest Players"');
    console.log('');

    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('💾 Credentials saved to: TEST_CREDENTIALS.txt');

    // Write credentials to file
    const credentialsContent = `
GUEST PLAYER FEATURE - TEST CREDENTIALS
Generated: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════

ORGANIZATION ACCOUNT:
Email: ${orgEmail}
Password: ${orgPassword}
Organization: ${org.name}
Team: ${primaryTeam.name}

PLAYER ACCOUNT:
Email: ${playerEmail}
Password: ${playerPassword}

TOURNAMENT:
Title: ${tournament.title}
ID: ${tournament.id}
URL: http://localhost:5173/tournaments/${tournament.id}

═══════════════════════════════════════════════════════════

QUICK TEST:
1. Log in as organization: ${orgEmail}
2. Go to: http://localhost:5173/tournaments/${tournament.id}
3. Click "Guest Players" button
4. Invite the available player
5. Log in as player: ${playerEmail}
6. Accept invitation

═══════════════════════════════════════════════════════════
`;

    await Deno.writeTextFile('TEST_CREDENTIALS.txt', credentialsContent);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupTestData();
