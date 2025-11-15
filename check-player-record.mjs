import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.YVi0LHzKWZ3-9lHpLuQOy-jOQDXEPgH0HuMqKc-nA_o'
);

async function checkPlayerRecord() {
  // Get the test player user
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  console.log('\n=== All Users ===');
  users.users.forEach(user => {
    console.log(`- ${user.email} (ID: ${user.id})`);
  });

  // Check for player profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_type', 'player');

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }

  console.log('\n=== Player Profiles ===');
  console.log(profiles);

  // Check for player records
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*');

  if (playersError) {
    console.error('Error fetching players:', playersError);
    return;
  }

  console.log('\n=== Player Records ===');
  console.log(players);
}

checkPlayerRecord();
