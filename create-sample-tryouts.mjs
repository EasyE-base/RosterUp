import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.YVi0LHzKWZ3-9lHpLuQOy-jOQDXEPgH0HuMqKc-nA_o'
);

async function createSampleTryouts() {
  console.log('Creating sample tryouts...\n');

  try {
    // Get some teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, sport, organization_id, age_group, gender')
      .limit(10);

    if (teamsError) throw teamsError;

    if (!teams || teams.length === 0) {
      console.log('No teams found. Please create some teams first.');
      return;
    }

    console.log(`Found ${teams.length} teams\n`);

    // Create tryouts for the next 30 days
    const tryouts = [];
    const today = new Date();

    for (let i = 0; i < Math.min(8, teams.length); i++) {
      const team = teams[i];
      const daysAhead = Math.floor(Math.random() * 30) + 1;
      const tryoutDate = new Date(today);
      tryoutDate.setDate(today.getDate() + daysAhead);

      const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const descriptions = [
        'Looking for skilled players to join our competitive team. Come showcase your abilities!',
        'Open tryout for all skill levels. We value teamwork, dedication, and a positive attitude.',
        'Elite level tryout for experienced players. Bring your A-game!',
        'Youth development program tryout. Perfect for players looking to improve their skills.',
        'Competitive team tryout. We\'re building a championship roster!',
        'Recreational team tryout. Focus on fun, development, and team spirit.',
        'Travel team tryout. Must be committed to weekend tournaments.',
        'Select team tryout. Looking for the best players in the region.',
      ];

      const locations = [
        'Central Sports Complex',
        'Riverside Athletic Fields',
        'Community Recreation Center',
        'Memorial Stadium',
        'Westside Sports Park',
        'North County Sportsplex',
        'Champions Training Facility',
        'Elite Performance Center',
      ];

      const addresses = [
        '123 Main St, San Diego, CA',
        '456 Oak Avenue, Los Angeles, CA',
        '789 Pine Road, Phoenix, AZ',
        '321 Maple Drive, Las Vegas, NV',
        '654 Elm Street, Dallas, TX',
        '987 Cedar Lane, Atlanta, GA',
        '147 Birch Way, Miami, FL',
        '258 Spruce Court, Chicago, IL',
      ];

      tryouts.push({
        team_id: team.id,
        organization_id: team.organization_id,
        title: `${team.name} Tryout`,
        description: descriptions[i % descriptions.length],
        sport: team.sport,
        date: tryoutDate.toISOString().split('T')[0],
        start_time: `${startHour.toString().padStart(2, '0')}:00:00`,
        end_time: `${(startHour + 2).toString().padStart(2, '0')}:00:00`,
        location: locations[i % locations.length],
        address: addresses[i % addresses.length],
        total_spots: 20 + Math.floor(Math.random() * 30),
        spots_available: 20 + Math.floor(Math.random() * 30),
        requirements: JSON.stringify([
          'Athletic shoes and appropriate attire',
          'Water bottle',
          'Valid ID or registration form',
        ]),
        status: 'open',
      });
    }

    // Insert tryouts
    const { data: insertedTryouts, error: insertError } = await supabase
      .from('tryouts')
      .insert(tryouts)
      .select();

    if (insertError) throw insertError;

    console.log(`✅ Created ${insertedTryouts.length} sample tryouts:\n`);

    insertedTryouts.forEach((tryout, index) => {
      const team = teams.find(t => t.id === tryout.team_id);
      console.log(`${index + 1}. ${tryout.title}`);
      console.log(`   Sport: ${tryout.sport}`);
      console.log(`   Date: ${tryout.date} at ${tryout.start_time.substring(0, 5)}`);
      console.log(`   Location: ${tryout.location}`);
      console.log(`   Spots: ${tryout.total_spots}`);
      console.log('');
    });

    // Get the logged-in player (if exists)
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, user_id')
      .limit(1)
      .single();

    if (!playersError && players && insertedTryouts.length > 0) {
      console.log('Creating sample applications for player...\n');

      // Create 3 sample applications
      const applications = [
        {
          tryout_id: insertedTryouts[0].id,
          player_id: players.id,
          status: 'pending',
        },
      ];

      if (insertedTryouts.length > 1) {
        applications.push({
          tryout_id: insertedTryouts[1].id,
          player_id: players.id,
          status: 'accepted',
        });
      }

      if (insertedTryouts.length > 2) {
        applications.push({
          tryout_id: insertedTryouts[2].id,
          player_id: players.id,
          status: 'pending',
        });
      }

      const { error: appsError } = await supabase
        .from('tryout_applications')
        .insert(applications);

      if (appsError) {
        console.log('Note: Could not create sample applications:', appsError.message);
      } else {
        console.log(`✅ Created ${applications.length} sample applications`);
      }
    }

    console.log('\n🎉 Sample data created successfully!');
    console.log('Refresh the tryouts page to see the results.');

  } catch (error) {
    console.error('Error creating sample tryouts:', error);
  }
}

createSampleTryouts();
