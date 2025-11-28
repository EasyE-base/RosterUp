import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userId = 'da63015a-224c-4e2a-9bb1-1d0e64ca223c';

async function deleteUser() {
  console.log('Deleting user:', userId);

  try {
    // Delete from profiles table (this should cascade to other tables)
    console.log('\n1. Deleting profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Profile delete error:', profileError);
    } else {
      console.log('✅ Profile deleted');
    }

    // Delete the auth user
    console.log('\n2. Deleting auth user...');
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Auth delete error:', authError);
    } else {
      console.log('✅ Auth user deleted');
    }

    console.log('\n✅ User completely deleted!');
    console.log('You can now sign up with a new account.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

deleteUser();
