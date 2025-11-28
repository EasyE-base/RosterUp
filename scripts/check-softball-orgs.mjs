import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'
);

console.log('Checking softball organizations in database...\n');

// Get all softball organizations
const { data: orgs, error: orgsError } = await supabase
  .from('organizations')
  .select('id, name, city, state, logo_url, created_at')
  .eq('primary_sport', 'Softball')
  .order('created_at', { ascending: false });

if (orgsError) {
  console.error('Error fetching organizations:', orgsError);
  process.exit(1);
}

console.log(`Found ${orgs.length} softball organizations:\n`);
console.table(orgs.map(org => ({
  name: org.name,
  city: org.city,
  state: org.state,
  logo_url: org.logo_url || '(none)',
  created: new Date(org.created_at).toLocaleString()
})));

// Check ALL organizations first
console.log('\nChecking ALL organizations (not just softball)...\n');

const { data: allOrgs, error: allOrgsError } = await supabase
  .from('organizations')
  .select('id, name, primary_sport, city, state')
  .order('created_at', { ascending: false });

if (allOrgsError) {
  console.error('Error fetching all organizations:', allOrgsError);
} else {
  console.log(`Total organizations in database: ${allOrgs.length}\n`);
  console.table(allOrgs);
}

// Check for teams (without classification column)
console.log('\nChecking teams for softball organizations...\n');

const { data: orgsWithTeams, error: teamsError } = await supabase
  .from('organizations')
  .select(`
    name,
    city,
    state,
    teams (
      id,
      name,
      age_group,
      status
    )
  `)
  .eq('primary_sport', 'Softball')
  .order('created_at', { ascending: false });

if (teamsError) {
  console.error('Error fetching teams:', teamsError);
} else {
  orgsWithTeams.forEach(org => {
    console.log(`\n${org.name} (${org.city}, ${org.state})`);
    if (org.teams && org.teams.length > 0) {
      org.teams.forEach(team => {
        console.log(`  ✓ ${team.name} - ${team.age_group} - ${team.status}`);
      });
    } else {
      console.log('  ✗ No teams');
    }
  });
}

console.log('\n✅ Check complete!');
