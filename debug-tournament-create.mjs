import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debugging Tournament Creation\n');

// Check if user is logged in
const { data: { session }, error: sessionError } = await supabase.auth.getSession();

if (sessionError) {
  console.error('❌ Session error:', sessionError);
}

if (!session) {
  console.log('❌ No active session - user needs to be logged in');
  console.log('Please log in through the UI first\n');
  process.exit(0);
}

console.log('✅ User logged in:', session.user.email);
console.log('User ID:', session.user.id);

// Check if user has an organization
const { data: org, error: orgError } = await supabase
  .from('organizations')
  .select('*')
  .eq('user_id', session.user.id)
  .maybeSingle();

if (orgError) {
  console.error('\n❌ Error checking organization:', orgError);
}

if (!org) {
  console.log('\n❌ No organization found for this user');
  console.log('Please create an organization through the UI first\n');
  process.exit(0);
}

console.log('\n✅ Organization found:', org.name);
console.log('Organization ID:', org.id);

// Try to create a test tournament
console.log('\n🧪 Attempting to create test tournament...\n');

const startDate = new Date();
startDate.setDate(startDate.getDate() + 30);
const endDate = new Date(startDate);
endDate.setDate(endDate.getDate() + 2);

const tournamentData = {
  organization_id: org.id,
  title: 'Test Tournament ' + Date.now(),
  sport: 'Softball',
  age_group: '16U',
  start_date: startDate.toISOString().split('T')[0],
  end_date: endDate.toISOString().split('T')[0],
  registration_deadline: startDate.toISOString().split('T')[0],
  location_city: 'Los Angeles',
  location_state: 'CA',
  location_address: '123 Test Street',
  max_teams: 16,
  entry_fee: 500,
  status: 'open',
  description: 'Test tournament',
  format_type: 'single_elimination'
};

console.log('Tournament data:');
console.log(JSON.stringify(tournamentData, null, 2));

const { data: tournament, error: tournError } = await supabase
  .from('tournaments')
  .insert(tournamentData)
  .select()
  .single();

if (tournError) {
  console.log('\n❌ ERROR CREATING TOURNAMENT:');
  console.log('Code:', tournError.code);
  console.log('Message:', tournError.message);
  console.log('Details:', tournError.details);
  console.log('Hint:', tournError.hint);
  console.log('\nFull error object:');
  console.log(JSON.stringify(tournError, null, 2));
} else {
  console.log('\n✅ Tournament created successfully!');
  console.log('Tournament ID:', tournament.id);
  console.log('Title:', tournament.title);
}
