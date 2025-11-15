import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupTestData() {
  console.log('🔧 Setting up test data for guest player functionality...\n');

  try {
    // Step 1: Get the test player
    const testPlayerId = '5aa46c2e-ec89-49b6-ba5f-03f9a17f2315';

    const { data: player, error: playerError } = await supabase
      .from('player_profiles')
      .select('user_id, first_name, last_name')
      .eq('id', testPlayerId)
      .single();

    if (playerError || !player) {
      console.error('❌ Test player not found');
      return;
    }

    console.log(`✅ Found test player: ${player.first_name} ${player.last_name}`);
    console.log(`   User ID: ${player.user_id}\n`);

    // Step 2: Create or get an organization
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
      .maybeSingle();

    let orgId;

    if (existingOrg) {
      orgId = existingOrg.id;
      console.log(`✅ Using existing organization: ${existingOrg.name}`);
      console.log(`   ID: ${orgId}\n`);
    } else {
      // Create a test organization using the player's user_id
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          user_id: player.user_id,
          name: 'Test Sports Organization',
          primary_sport: 'Softball',
          description: 'Test organization for development and testing',
          location: 'Test City, TC',
        })
        .select()
        .single();

      if (orgError) {
        console.error('❌ Error creating organization:', orgError);
        return;
      }

      orgId = newOrg.id;
      console.log(`✅ Created new organization: ${newOrg.name}`);
      console.log(`   ID: ${orgId}\n`);
    }

    // Step 3: Check for existing tournaments
    const { data: existingTournaments, error: checkError } = await supabase
      .from('tournaments')
      .select('id, title')
      .eq('organization_id', orgId);

    if (checkError) {
      console.error('❌ Error checking tournaments:', checkError);
      return;
    }

    if (existingTournaments && existingTournaments.length > 0) {
      console.log(`✅ Found ${existingTournaments.length} existing tournaments:`);
      existingTournaments.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.title} (${t.id})`);
      });
      console.log('\n✅ Test data setup complete!');
      return;
    }

    // Step 4: Create sample tournaments
    const tournaments = [
      {
        organization_id: orgId,
        title: 'Summer Championship 2025',
        description: 'Annual summer softball championship tournament. Open to all teams in the region.',
        start_date: '2025-07-15',
        end_date: '2025-07-17',
        location: 'Central Sports Complex',
        max_teams: 16,
        entry_fee: 500,
        status: 'open',
        tournament_type: 'elimination',
        age_group: '18U',
        sanctioning_body: 'USSSA',
      },
      {
        organization_id: orgId,
        title: 'Fall Classic Tournament',
        description: 'Premier fall tournament featuring top teams from across the state.',
        start_date: '2025-10-05',
        end_date: '2025-10-08',
        location: 'Riverside Park',
        max_teams: 12,
        entry_fee: 400,
        status: 'open',
        tournament_type: 'round_robin',
        age_group: '16U',
        sanctioning_body: 'ASA',
      },
      {
        organization_id: orgId,
        title: 'Winter Showcase 2025',
        description: 'Indoor winter showcase tournament for competitive teams.',
        start_date: '2025-12-10',
        end_date: '2025-12-12',
        location: 'Indoor Sports Arena',
        max_teams: 8,
        entry_fee: 350,
        status: 'open',
        tournament_type: 'pool_play',
        age_group: '14U',
        sanctioning_body: 'NSA',
      }
    ];

    const { data: newTournaments, error: tournamentError } = await supabase
      .from('tournaments')
      .insert(tournaments)
      .select();

    if (tournamentError) {
      console.error('❌ Error creating tournaments:', tournamentError);
      return;
    }

    console.log(`✅ Successfully created ${newTournaments.length} tournaments:\n`);
    newTournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.title}`);
      console.log(`   ID: ${tournament.id}`);
      console.log(`   Dates: ${tournament.start_date} to ${tournament.end_date}`);
      console.log(`   Location: ${tournament.location}`);
      console.log('');
    });

    console.log('✅ Test data setup complete! You can now:');
    console.log('   1. Navigate to tournaments page');
    console.log('   2. Click on a tournament');
    console.log('   3. Test the "Apply as Guest Player" button');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

setupTestData();
