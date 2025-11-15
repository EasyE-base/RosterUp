import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Diagnosing Tournament Creation Issue\n');

// Check if logged in
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  console.log('❌ NOT LOGGED IN');
  console.log('Please log in through the browser first, then run this script.\n');
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
console.log('   Org ID:', org.id);
console.log('');

// Try to insert tournament with exact data from form
console.log('🧪 Attempting tournament insert...\n');

const tournamentData = {
  organization_id: org.id,
  title: 'Diagnostic Test Tournament',
  description: 'Testing insert',
  sport: 'Softball',
  sanctioning_body: null,
  image_url: null,
  age_group: null,
  classification_acceptance: 'OPEN',
  accepted_classifications: null,
  start_date: '2026-01-15',
  end_date: '2026-01-17',
  registration_deadline: '2026-01-10',
  location_name: 'Test Complex',
  address: null,
  city: 'Los Angeles',
  state: 'CA',
  country: 'USA',
  latitude: 0,
  longitude: 0,
  max_participants: 16,
  format_type: 'single_elimination',
  entry_fee: null,
  prize_info: null,
  requirements: [],
  status: 'open'
};

console.log('Inserting data:');
console.log(JSON.stringify(tournamentData, null, 2));
console.log('');

const { data: result, error } = await supabase
  .from('tournaments')
  .insert(tournamentData)
  .select()
  .single();

if (error) {
  console.log('❌ ERROR:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Message:', error.message);
  console.log('Code:', error.code);
  console.log('Details:', error.details);
  console.log('Hint:', error.hint);
  console.log('');
  console.log('Full error:');
  console.log(JSON.stringify(error, null, 2));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Specific diagnosis
  if (error.code === '42501') {
    console.log('🔍 DIAGNOSIS: RLS Policy Issue');
    console.log('The WITH CHECK clause might not be applied.');
    console.log('');
    console.log('RUN THIS SQL IN SUPABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DROP POLICY IF EXISTS "Organizations can manage their tournaments" ON tournaments;');
    console.log('');
    console.log('CREATE POLICY "Organizations can manage their tournaments"');
    console.log('  ON tournaments FOR ALL');
    console.log('  TO authenticated');
    console.log('  USING (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()))');
    console.log('  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else if (error.code === '23502') {
    console.log('🔍 DIAGNOSIS: Missing Required Field');
    console.log('A NOT NULL column is missing a value.');
    console.log('Check which field from the error details above.');
  } else {
    console.log('🔍 DIAGNOSIS: Unknown Error');
    console.log('Check the error details above.');
  }
} else {
  console.log('✅ SUCCESS! Tournament created!');
  console.log('Tournament ID:', result.id);
  console.log('Title:', result.title);
  console.log('');
  console.log('Deleting test tournament...');
  await supabase.from('tournaments').delete().eq('id', result.id);
  console.log('✅ Test tournament deleted');
  console.log('');
  console.log('🎉 TOURNAMENT CREATION IS WORKING!');
  console.log('Try creating a tournament in the browser again.');
}
