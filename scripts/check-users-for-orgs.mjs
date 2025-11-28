import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'
);

console.log('Checking for existing users and profiles...\n');

// Check profiles table
const { data: profiles, error: profilesError } = await supabase
  .from('profiles')
  .select('id, user_type, email, created_at')
  .order('created_at', { ascending: false });

if (profilesError) {
  console.error('Error fetching profiles:', profilesError);
} else {
  console.log(`Found ${profiles.length} user profiles:\n`);
  console.table(profiles.map(p => ({
    id: p.id.substring(0, 8) + '...',
    type: p.user_type,
    email: p.email || '(no email)',
    created: new Date(p.created_at).toLocaleString()
  })));

  // Find organization users
  const orgUsers = profiles.filter(p => p.user_type === 'organization');
  console.log(`\n${orgUsers.length} organization users found`);

  if (orgUsers.length > 0) {
    console.log('\nUsing first organization user for all 10 orgs:');
    console.log('User ID:', orgUsers[0].id);
    console.log('Email:', orgUsers[0].email);
  } else {
    console.log('\n⚠️  No organization users found!');
    console.log('You need to create organization user accounts first.');
  }
}

// Check existing organizations
const { data: orgs, error: orgsError } = await supabase
  .from('organizations')
  .select('id, user_id, name, city, state')
  .order('created_at', { ascending: false });

if (orgsError) {
  console.error('\nError fetching organizations:', orgsError);
} else {
  console.log(`\n\nExisting organizations: ${orgs.length}\n`);
  if (orgs.length > 0) {
    console.table(orgs.map(o => ({
      name: o.name,
      city: o.city,
      state: o.state,
      user_id: o.user_id ? o.user_id.substring(0, 8) + '...' : 'null'
    })));
  }
}
