#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';

// Get service role key from Supabase Dashboard:
// https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/settings/api
// Look for "service_role" key (NOT the anon key)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

if (supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('\n❌ ERROR: No service role key found!\n');
  console.log('Please set SUPABASE_SERVICE_ROLE_KEY environment variable or update the script.\n');
  console.log('Get your service role key from:');
  console.log('https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/settings/api\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTrainerAccount(email, password, fullName) {
  console.log('\n📧 Creating trainer account...\n');

  try {
    // Step 1: Create auth user
    console.log('Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Auth user created:', userId);

    // Step 2: Create profile
    console.log('\nStep 2: Creating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        user_type: 'trainer'
      });

    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
      return;
    }
    console.log('✅ Profile created');

    // Step 3: Create trainer record
    console.log('\nStep 3: Creating trainer record...');
    const { error: trainerError } = await supabase
      .from('trainers')
      .insert({
        user_id: userId,
        sports: ['Baseball'],
        specializations: ['Hitting', 'Fielding'],
        is_featured: false,
        featured_priority: 0
      });

    if (trainerError) {
      console.error('❌ Trainer error:', trainerError.message);
      return;
    }
    console.log('✅ Trainer record created');

    // Success!
    console.log('\n🎉 SUCCESS! Trainer account created:\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User ID:', userId);
    console.log('\n✨ You can now log in at: http://localhost:5173/login\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('\n📝 Usage: node setup-trainer-account.mjs <email> <password> <full_name>\n');
  console.log('Example:');
  console.log('  node setup-trainer-account.mjs test@example.com password123 "John Trainer"\n');
  process.exit(1);
}

const [email, password, fullName] = args;

setupTrainerAccount(email, password, fullName);
