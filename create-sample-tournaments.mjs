import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleTournaments() {
  console.log('🏆 Creating sample tournaments...\n');

  try {
    // First, get an organization to associate with tournaments
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1)
      .single();

    if (orgError || !orgs) {
      console.error('❌ No organizations found. Creating tournaments requires an organization.');
      console.log('ℹ️  Please create an organization first from the app.');
      return;
    }

    console.log(`✅ Using organization: ${orgs.name} (${orgs.id})\n`);

    // Create sample tournaments
    const tournaments = [
      {
        organization_id: orgs.id,
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
        organization_id: orgs.id,
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
        organization_id: orgs.id,
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

    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournaments)
      .select();

    if (error) {
      console.error('❌ Error creating tournaments:', error);
      return;
    }

    console.log(`✅ Successfully created ${data.length} tournaments:\n`);
    data.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.title}`);
      console.log(`   ID: ${tournament.id}`);
      console.log(`   Dates: ${tournament.start_date} to ${tournament.end_date}`);
      console.log(`   Location: ${tournament.location}`);
      console.log(`   Status: ${tournament.status}`);
      console.log(`   Max Teams: ${tournament.max_teams}`);
      console.log('');
    });

    console.log('✅ Tournaments created successfully! Players can now apply as guest players.');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createSampleTournaments();
