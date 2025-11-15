import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking Database Schema & Testing Insert\n');

// Check current session
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  console.log('❌ Not logged in. Please log in through the UI first.\n');
  console.log('Then run this script again.\n');
  process.exit(0);
}

console.log('✅ Logged in as:', session.user.email);

// Get organization
const { data: org } = await supabase
  .from('organizations')
  .select('id, name')
  .eq('user_id', session.user.id)
  .maybeSingle();

if (!org) {
  console.log('❌ No organization found\n');
  process.exit(0);
}

console.log('✅ Organization:', org.name);
console.log('');

// Try minimal insert to see what's required
console.log('🧪 Testing minimal tournament insert...\n');

const minimalData = {
  organization_id: org.id,
  title: 'Test Tournament',
  description: 'Test',
  sport: 'Softball',
  start_date: '2025-07-01',
  end_date: '2025-07-03',
  registration_deadline: '2025-06-30',
  city: 'Los Angeles',
  state: 'CA',
  country: 'USA',
  status: 'open'
};

console.log('Trying to insert:');
console.log(JSON.stringify(minimalData, null, 2));
console.log('');

const { data: result, error } = await supabase
  .from('tournaments')
  .insert(minimalData)
  .select()
  .single();

if (error) {
  console.log('❌ ERROR:');
  console.log('Message:', error.message);
  console.log('Code:', error.code);
  console.log('Details:', error.details);
  console.log('Hint:', error.hint);
  console.log('');
  console.log('Full error:');
  console.log(JSON.stringify(error, null, 2));
} else {
  console.log('✅ SUCCESS! Tournament created:');
  console.log('ID:', result.id);
  console.log('Title:', result.title);
  console.log('');
  console.log('Deleting test tournament...');

  await supabase
    .from('tournaments')
    .delete()
    .eq('id', result.id);

  console.log('✅ Test tournament deleted');
}
