import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Use anon key - service role key appears to be invalid
const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'
);

// Read the SQL file
const sqlContent = fs.readFileSync('/Users/erictrovarelli/Downloads/project 2/scripts/create-10-orgs-and-teams-v2.sql', 'utf8');

// Split SQL into statements
const statements = sqlContent
  .split('\n')
  .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
  .join('\n');

console.log('Creating 10 organizations and teams...\n');

try {
  // Execute the SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: statements
  });

  if (error) {
    console.error('Error executing SQL:', error);

    // If exec_sql doesn't exist, try running statements individually
    console.log('\nTrying alternative approach...\n');

    // Step 1: Create organizations
    const orgs = [
      { name: 'Lady Bandits Softball', primary_sport: 'Softball', city: 'Baltimore', state: 'Maryland' },
      { name: 'Flemington Flames', primary_sport: 'Softball', city: 'Flemington', state: 'New Jersey' },
      { name: 'Maryland Sting Softball', primary_sport: 'Softball', city: 'Annapolis', state: 'Maryland' },
      { name: 'Neshaminy Shock Travel Softball', primary_sport: 'Softball', city: 'Langhorne', state: 'Pennsylvania' },
      { name: 'Bama Slammers Fastpitch', primary_sport: 'Softball', city: 'Philadelphia', state: 'Pennsylvania' },
      { name: 'Boom Williston Fastpitch', primary_sport: 'Softball', city: 'Wilmington', state: 'Delaware' },
      { name: 'Ohio Lasers Softball', primary_sport: 'Softball', city: 'Richmond', state: 'Virginia' },
      { name: 'Worthington Spirit Softball', primary_sport: 'Softball', city: 'Arlington', state: 'Virginia' },
      { name: 'Storm Travel Softball', primary_sport: 'Softball', city: 'Dover', state: 'Delaware' },
      { name: 'Illinois Lightning Travel Softball', primary_sport: 'Softball', city: 'Trenton', state: 'New Jersey' }
    ];

    const { data: insertedOrgs, error: orgError } = await supabase
      .from('organizations')
      .insert(orgs)
      .select('id, name, city, state');

    if (orgError) {
      console.error('Error creating organizations:', orgError);
      process.exit(1);
    }

    console.log('✅ Created 10 organizations:');
    console.table(insertedOrgs);

    // Step 2: Create teams
    const teamNames = ['18U Elite', '16U Gold', '14U Thunder', '12U Lightning', '16U Fierce', '14U Storm', '18U Impact', '12U Spirit', '16U Dynasty', '14U Elite'];
    const ageGroups = ['18U', '16U', '14U', '12U', '16U', '14U', '18U', '12U', '16U', '14U'];
    const classifications = ['A', 'B', 'A', 'C', 'B', 'A', 'B', 'C', 'A', 'B'];

    const teams = insertedOrgs.map((org, index) => ({
      organization_id: org.id,
      name: teamNames[index],
      sport: 'Softball',
      age_group: ageGroups[index],
      gender: 'Girls',
      classification: classifications[index],
      season: 'Spring 2025',
      status: 'active'
    }));

    const { data: insertedTeams, error: teamError } = await supabase
      .from('teams')
      .insert(teams)
      .select('id, name, age_group, classification');

    if (teamError) {
      console.error('Error creating teams:', teamError);
      process.exit(1);
    }

    console.log('\n✅ Created 10 teams:');
    console.table(insertedTeams);

    // Step 3: Verify results
    const { data: verification, error: verifyError } = await supabase
      .from('organizations')
      .select(`
        name,
        city,
        state,
        teams (
          name,
          age_group,
          classification
        )
      `)
      .eq('primary_sport', 'Softball')
      .order('created_at', { ascending: false })
      .limit(10);

    if (verifyError) {
      console.error('Error verifying:', verifyError);
    } else {
      console.log('\n✅ Verification - Organizations with Teams:');
      verification.forEach(org => {
        console.log(`\n${org.name} (${org.city}, ${org.state})`);
        org.teams.forEach(team => {
          console.log(`  └─ ${team.name} - ${team.age_group} - Class ${team.classification}`);
        });
      });
    }

    console.log('\n✅ All done! 10 organizations and teams created successfully.');
  } else {
    console.log('✅ SQL executed successfully:', data);
  }
} catch (err) {
  console.error('Unexpected error:', err);
  process.exit(1);
}
