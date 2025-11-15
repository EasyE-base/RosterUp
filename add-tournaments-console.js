// COPY EVERYTHING BELOW THIS LINE AND PASTE INTO BROWSER CONSOLE
// Make sure you're logged in at http://localhost:5173/tournaments first

async function addTournaments() {
  const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

  const supabaseModule = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabase = supabaseModule.createClient(supabaseUrl, supabaseKey);

  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;

  if (!user) {
    console.error('Not logged in');
    return;
  }

  const orgsResult = await supabase.from('organizations').select('id, name').eq('user_id', user.id).limit(1);
  const orgs = orgsResult.data;

  if (!orgs || orgs.length === 0) {
    console.error('No organization found');
    return;
  }

  const orgId = orgs[0].id;
  console.log('Using organization:', orgs[0].name, '- ID:', orgId);

  const tournaments = [
    {
      organization_id: orgId,
      title: 'Summer Softball Classic 2024',
      sport: 'Softball',
      description: 'Premier summer softball tournament featuring top teams from across the region.',
      start_date: '2024-07-15',
      end_date: '2024-07-17',
      registration_deadline: '2024-07-08',
      location_name: 'Regional Sports Complex',
      city: 'San Diego',
      state: 'CA',
      country: 'USA',
      latitude: 32.7157,
      longitude: -117.1611,
      format_type: 'single_elimination',
      max_participants: 32,
      current_participants: 28,
      entry_fee: 450,
      prize_info: '$5,000 First Place',
      status: 'open',
      rules: { age_limit: '18U' }
    },
    {
      organization_id: orgId,
      title: 'Elite Fastpitch Showcase',
      sport: 'Softball',
      description: 'High-level showcase tournament for elite fastpitch teams.',
      start_date: '2024-08-05',
      end_date: '2024-08-07',
      registration_deadline: '2024-07-29',
      location_name: 'Championship Fields',
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA',
      latitude: 33.4484,
      longitude: -112.0740,
      format_type: 'pool_play',
      max_participants: 48,
      current_participants: 41,
      entry_fee: 500,
      prize_info: 'Trophies & Medals',
      status: 'open',
      rules: { divisions: ['16U', '18U'] }
    },
    {
      organization_id: orgId,
      title: 'Midwest Softball Championship',
      sport: 'Softball',
      description: 'Annual championship tournament from the Midwest region.',
      start_date: '2024-09-20',
      end_date: '2024-09-22',
      registration_deadline: '2024-09-13',
      location_name: 'Midwest Sports Park',
      city: 'Kansas City',
      state: 'MO',
      country: 'USA',
      latitude: 39.0997,
      longitude: -94.5786,
      format_type: 'double_elimination',
      max_participants: 24,
      current_participants: 15,
      entry_fee: 400,
      prize_info: '$3,000 Prize Pool',
      status: 'open',
      rules: { format: 'Double Elimination' }
    },
    {
      organization_id: orgId,
      title: 'Coastal Softball Invitational',
      sport: 'Softball',
      description: 'Beautiful coastal tournament with ocean views.',
      start_date: '2024-08-15',
      end_date: '2024-08-17',
      registration_deadline: '2024-08-08',
      location_name: 'Beachside Sports Complex',
      city: 'Virginia Beach',
      state: 'VA',
      country: 'USA',
      latitude: 36.8529,
      longitude: -75.9780,
      format_type: 'pool_play',
      max_participants: 28,
      current_participants: 22,
      entry_fee: 375,
      prize_info: 'Team Awards',
      status: 'open',
      rules: { weather_policy: 'Rain or shine' }
    },
    {
      organization_id: orgId,
      title: 'All-Star Softball Series',
      sport: 'Softball',
      description: 'Multi-weekend series culminating in championship finals.',
      start_date: '2024-10-05',
      end_date: '2024-10-07',
      registration_deadline: '2024-09-28',
      location_name: 'Premier Diamond Complex',
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      latitude: 33.7490,
      longitude: -84.3880,
      format_type: 'round_robin',
      max_participants: 20,
      current_participants: 18,
      entry_fee: 425,
      prize_info: '$4,000 Championship Prize',
      status: 'open',
      rules: { series_format: true }
    },
    {
      organization_id: orgId,
      title: 'Youth Basketball Tournament',
      sport: 'Basketball',
      description: 'AAU-sanctioned youth basketball tournament.',
      start_date: '2024-07-20',
      end_date: '2024-07-22',
      registration_deadline: '2024-07-13',
      location_name: 'Metro Sports Arena',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
      format_type: 'single_elimination',
      max_participants: 16,
      current_participants: 14,
      entry_fee: 350,
      prize_info: 'Championship Rings',
      status: 'open',
      rules: { age_groups: ['12U', '14U', '16U'] }
    },
    {
      organization_id: orgId,
      title: 'Premier Soccer Cup',
      sport: 'Soccer',
      description: 'Competitive soccer tournament for youth select teams.',
      start_date: '2024-08-10',
      end_date: '2024-08-12',
      registration_deadline: '2024-08-03',
      location_name: 'Elite Soccer Complex',
      city: 'Dallas',
      state: 'TX',
      country: 'USA',
      latitude: 32.7767,
      longitude: -96.7970,
      format_type: 'pool_play',
      max_participants: 32,
      current_participants: 29,
      entry_fee: 400,
      prize_info: 'Trophies for Top 3',
      status: 'open',
      rules: { fifa_rules: true }
    },
    {
      organization_id: orgId,
      title: 'Fall Softball Showcase',
      sport: 'Softball',
      description: 'End of season showcase tournament.',
      start_date: '2024-11-01',
      end_date: '2024-11-03',
      registration_deadline: '2024-10-25',
      location_name: 'Tournament Fields Complex',
      city: 'Orlando',
      state: 'FL',
      country: 'USA',
      latitude: 28.5383,
      longitude: -81.3792,
      format_type: 'showcase',
      max_participants: 40,
      current_participants: 8,
      entry_fee: 475,
      prize_info: 'College Coach Attendance',
      status: 'open',
      rules: { showcase_format: true }
    },
    {
      organization_id: orgId,
      title: 'Holiday Hoops Classic',
      sport: 'Basketball',
      description: 'Holiday basketball tournament during winter break.',
      start_date: '2024-12-20',
      end_date: '2024-12-22',
      registration_deadline: '2024-12-13',
      location_name: 'Convention Center Arena',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      latitude: 41.8781,
      longitude: -87.6298,
      format_type: 'double_elimination',
      max_participants: 20,
      current_participants: 5,
      entry_fee: 425,
      prize_info: 'Championship Banners',
      status: 'open',
      rules: { holiday_format: true }
    },
    {
      organization_id: orgId,
      title: 'Spring Training Softball',
      sport: 'Softball',
      description: 'Early season tournament for team building.',
      start_date: '2025-03-15',
      end_date: '2025-03-17',
      registration_deadline: '2025-03-08',
      location_name: 'Spring Training Complex',
      city: 'Scottsdale',
      state: 'AZ',
      country: 'USA',
      latitude: 33.4942,
      longitude: -111.9261,
      format_type: 'pool_play',
      max_participants: 36,
      current_participants: 32,
      entry_fee: 395,
      prize_info: 'Team Medals',
      status: 'open',
      rules: { spring_format: true }
    }
  ];

  console.log('Inserting', tournaments.length, 'tournaments...');

  const result = await supabase.from('tournaments').insert(tournaments).select();

  if (result.error) {
    console.error('Error:', result.error);
    return;
  }

  console.log('Success! Added', result.data.length, 'tournaments');
  console.log('Reloading page in 2 seconds...');

  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

addTournaments();
