import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.YVi0LHzKWZ3-9lHpLuQOy-jOQDXEPgH0HuMqKc-nA_o'
);

async function createPlayerAccount() {
  console.log('Creating test player account...\n');

  const email = 'testplayer123@example.com';
  const password = 'player123456';
  const fullName = 'Alex Johnson';
  const age = 20;

  try {
    // 1. Create auth user
    console.log('Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    const userId = authData.user.id;
    console.log('✓ Auth user created:', userId);

    // 2. Create profile
    console.log('\nStep 2: Creating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        user_type: 'player'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }
    console.log('✓ Profile created');

    // 3. Create player record
    console.log('\nStep 3: Creating player record...');
    const { error: playerError } = await supabase
      .from('players')
      .insert({
        user_id: userId,
        age: age,
        country: 'United States',
        rating: 0,
        profile_visibility: 'public',
        parent_email: null // Age 20, no parent needed
      });

    if (playerError) {
      console.error('Player error:', playerError);
      throw playerError;
    }
    console.log('✓ Player record created');

    console.log('\n✅ SUCCESS! Player account created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Name:', fullName);
    console.log('Age:', age);
    console.log('User ID:', userId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now log in with these credentials!');

  } catch (error) {
    console.error('\n❌ Error creating player account:', error.message);
    throw error;
  }
}

createPlayerAccount().catch(console.error);
