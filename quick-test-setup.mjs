import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Quick Test Setup - Guest Player Feature\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function quickSetup() {
  // Generate unique emails
  const timestamp = Date.now();
  const orgEmail = `test-org-${timestamp}@example.com`;
  const playerEmail = `test-player-${timestamp}@example.com`;
  const password = 'TestPass123!';

  console.log('👥 Creating Organization Account...');
  console.log(`   Email: ${orgEmail}`);
  console.log(`   Password: ${password}`);

  // Sign up as organization
  const { data: orgAuth, error: orgError } = await supabase.auth.signUp({
    email: orgEmail,
    password: password,
    options: {
      data: {
        account_type: 'organization',
        full_name: 'Test Organization'
      }
    }
  });

  if (orgError) {
    console.error('❌ Error creating organization account:', orgError.message);
    return;
  }

  console.log('✅ Organization account created');
  const orgUserId = orgAuth.user.id;

  // Wait a moment for the account to be fully set up
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create organization record
  const { data: org, error: orgRecordError } = await supabase
    .from('organizations')
    .insert({
      user_id: orgUserId,
      name: 'Elite Sports Academy',
      email: orgEmail,
      primary_sport: 'Softball',
      location_city: 'Los Angeles',
      location_state: 'CA'
    })
    .select()
    .single();

  if (orgRecordError) {
    console.error('❌ Error creating organization record:', orgRecordError);
    return;
  }

  console.log(`✅ Organization: ${org.name}`);

  // Create teams
  console.log('\n⚾ Creating Teams...');
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .insert([
      {
        organization_id: org.id,
        name: 'Elite Softball Squad',
        sport: 'Softball',
        age_group: '16U',
        season: 'Summer 2025'
      },
      {
        organization_id: org.id,
        name: 'Elite White 14U',
        sport: 'Softball',
        age_group: '14U',
        season: 'Summer 2025'
      }
    ])
    .select();

  if (teamsError) {
    console.error('❌ Error creating teams:', teamsError);
    return;
  }

  console.log(`✅ Created ${teams.length} teams`);
  teams.forEach(t => console.log(`   - ${t.name}`));

  // Create tournament
  console.log('\n🏆 Creating Tournament...');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);

  const { data: tournament, error: tournError } = await supabase
    .from('tournaments')
    .insert({
      organization_id: org.id,
      title: 'Summer Showcase 2025',
      sport: 'Softball',
      age_group: '16U',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      registration_deadline: startDate.toISOString().split('T')[0],
      location_city: 'Los Angeles',
      location_state: 'CA',
      location_address: '123 Tournament Park',
      max_teams: 16,
      entry_fee: 500,
      status: 'open',
      description: 'Premier showcase tournament for 16U softball.',
      format_type: 'single_elimination'
    })
    .select()
    .single();

  if (tournError) {
    console.error('❌ Error creating tournament:', tournError);
    return;
  }

  console.log(`✅ Tournament: ${tournament.title}`);

  // Register team for tournament
  console.log('\n📝 Registering Team...');
  const { error: regError } = await supabase
    .from('tournament_participants')
    .insert({
      tournament_id: tournament.id,
      team_id: teams[0].id,
      organization_id: org.id,
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    });

  if (regError) {
    console.error('❌ Error registering team:', regError);
    return;
  }

  console.log(`✅ "${teams[0].name}" registered for tournament`);

  // Sign out org user
  await supabase.auth.signOut();

  // Create player account
  console.log('\n👤 Creating Player Account...');
  console.log(`   Email: ${playerEmail}`);
  console.log(`   Password: ${password}`);

  const { data: playerAuth, error: playerError } = await supabase.auth.signUp({
    email: playerEmail,
    password: password,
    options: {
      data: {
        account_type: 'player',
        full_name: 'Test Player'
      }
    }
  });

  if (playerError) {
    console.error('❌ Error creating player account:', playerError.message);
    return;
  }

  console.log('✅ Player account created');
  const playerUserId = playerAuth.user.id;

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create player profile
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
      bio: 'Experienced pitcher looking for tournament opportunities. Strong fastball and great team player.',
      height_feet: 5,
      height_inches: 9,
      weight: 145,
      grad_year: 2026,
      gpa: 3.8
    })
    .select()
    .single();

  if (profileError) {
    console.error('❌ Error creating player profile:', profileError);
    return;
  }

  console.log('✅ Player profile created');

  // Apply as guest player
  console.log('\n🤝 Applying as Guest Player...');
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

  console.log('✅ Applied as guest player');

  await supabase.auth.signOut();

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✨ SETUP COMPLETE! ✨');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📋 TEST CREDENTIALS:\n');
  console.log('ORGANIZATION ACCOUNT:');
  console.log(`  Email: ${orgEmail}`);
  console.log(`  Password: ${password}`);
  console.log(`  Organization: ${org.name}`);
  console.log(`  Team: ${teams[0].name}`);
  console.log('');
  console.log('PLAYER ACCOUNT:');
  console.log(`  Email: ${playerEmail}`);
  console.log(`  Password: ${password}`);
  console.log('');
  console.log('TOURNAMENT:');
  console.log(`  Title: ${tournament.title}`);
  console.log(`  URL: http://localhost:5173/tournaments/${tournament.id}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TESTING INSTRUCTIONS:');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('STEP 1: Test Team Inviting Guest Player');
  console.log('────────────────────────────────────────');
  console.log('1. Go to: http://localhost:5173/login');
  console.log(`2. Login as organization: ${orgEmail}`);
  console.log(`3. Go to tournament: http://localhost:5173/tournaments/${tournament.id}`);
  console.log('4. Click "Guest Players" button (cyan/blue)');
  console.log('5. You should see:');
  console.log('   ✓ "Inviting for: Elite Softball Squad" badge');
  console.log('   ✓ Available Guest Players section with 1 player');
  console.log('   ✓ Player card with full profile');
  console.log('6. Click "Invite to Team"');
  console.log('7. Player moves to "Players You Invited" section\n');

  console.log('STEP 2: Test Player Accepting Invitation');
  console.log('────────────────────────────────────────');
  console.log('1. Open NEW browser tab (or incognito window)');
  console.log(`2. Login as player: ${playerEmail}`);
  console.log(`3. Go to: http://localhost:5173/tournaments/${tournament.id}`);
  console.log('4. You should see invitation with Accept/Decline buttons');
  console.log('5. Click "Accept"');
  console.log('6. Status changes to "Joined as Guest Player"\n');

  console.log('STEP 3: Test Register Team Button');
  console.log('────────────────────────────────────────');
  console.log('1. While logged in as organization');
  console.log('2. Create a NEW tournament (Softball, 16U, Open status)');
  console.log('3. Log out and create DIFFERENT organization account');
  console.log('4. Create a Softball team');
  console.log('5. Browse to the tournament from step 2');
  console.log('6. You should see GREEN "Register Team" button');
  console.log('7. Click it → select team → register');
  console.log('8. Button changes to "Guest Players"\n');

  console.log('═══════════════════════════════════════════════════════════\n');

  // Save credentials
  const credFile = `
GUEST PLAYER FEATURE - TEST CREDENTIALS
Generated: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════

ORGANIZATION ACCOUNT:
Email: ${orgEmail}
Password: ${password}
Organization: ${org.name}
Team: ${teams[0].name}

PLAYER ACCOUNT:
Email: ${playerEmail}
Password: ${password}

TOURNAMENT:
Title: ${tournament.title}
ID: ${tournament.id}
URL: http://localhost:5173/tournaments/${tournament.id}

═══════════════════════════════════════════════════════════

QUICK START:
1. Login as org: ${orgEmail}
2. Go to: http://localhost:5173/tournaments/${tournament.id}
3. Click "Guest Players"
4. Invite the player
5. Login as player: ${playerEmail}
6. Accept invitation

═══════════════════════════════════════════════════════════
`;

  console.log('💾 Credentials saved to: TEST_CREDENTIALS.txt\n');

  // Write using Deno API
  try {
    await import('fs').then(fs => {
      fs.promises.writeFile('TEST_CREDENTIALS.txt', credFile);
    });
  } catch (e) {
    // Ignore if file write fails
  }
}

quickSetup().catch(console.error);
