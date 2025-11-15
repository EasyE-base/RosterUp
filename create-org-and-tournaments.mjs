import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createOrgAndTournaments() {
  console.log('🏆 Creating organization and tournaments...\n');

  try {
    // Get a player_profile to use their user_id for creating the org
    const { data: players, error: playerError } = await supabase
      .from('player_profiles')
      .select('user_id')
      .limit(1)
      .single();

    if (playerError || !players) {
      console.error('❌ No player profiles found');
      return;
    }

    const userId = players.user_id;
    console.log(`✅ Using user_id: ${userId}\n`);

    // Check if organization already exists for this user
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    let orgId;

    if (existingOrg) {
      orgId = existingOrg.id;
      console.log(`✅ Using existing organization: ${existingOrg.name}`);
      console.log(`   ID: ${orgId}\n`);
    } else {
      // Create a test organization
      console.log('📝 Creating new organization...');
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          user_id: userId,
          name: 'Elite Sports Academy',
          primary_sport: 'Softball',
          description: 'Premier sports organization hosting competitive tournaments',
          location: 'Los Angeles, CA',
        })
        .select()
        .single();

      if (orgError) {
        console.error('❌ Error creating organization:', orgError);
        return;
      }

      orgId = newOrg.id;
      console.log(`✅ Created organization: ${newOrg.name}`);
      console.log(`   ID: ${orgId}\n`);
    }

    // Check if tournaments already exist
    const { data: existingTournaments } = await supabase
      .from('tournaments')
      .select('id, title')
      .eq('organization_id', orgId);

    if (existingTournaments && existingTournaments.length > 0) {
      console.log(`✅ Found ${existingTournaments.length} existing tournaments:`);
      existingTournaments.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.title} (${t.id})`);
      });
      console.log('\n✅ Setup complete! Tournaments are ready for guest player applications.');
      return;
    }

    // Create sample tournaments
    console.log('📝 Creating tournaments...\n');
    const tournaments = [
      {
        organization_id: orgId,
        title: 'Summer Championship 2025',
        description: 'Annual summer softball championship tournament. Open to all teams in the region.',
        start_date: '2025-07-15',
        end_date: '2025-07-17',
        location: 'Central Sports Complex, Los Angeles',
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
        location: 'Riverside Park, San Diego',
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
        location: 'Indoor Sports Arena, Sacramento',
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
      console.error('Details:', JSON.stringify(tournamentError, null, 2));
      return;
    }

    console.log(`✅ Successfully created ${newTournaments.length} tournaments:\n`);
    newTournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.title}`);
      console.log(`   ID: ${tournament.id}`);
      console.log(`   Dates: ${tournament.start_date} to ${tournament.end_date}`);
      console.log(`   Location: ${tournament.location}`);
      console.log(`   Status: ${tournament.status}`);
      console.log('');
    });

    console.log('✅ Setup complete! You can now:');
    console.log('   1. Navigate to http://localhost:5173/tournaments');
    console.log('   2. Click on a tournament');
    console.log('   3. Test the "Apply as Guest Player" button');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createOrgAndTournaments();
