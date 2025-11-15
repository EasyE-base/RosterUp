import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  try {
    // Check profiles table
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profError) {
      console.error('❌ Error querying profiles:', profError);
    } else {
      console.log('✅ Profiles table accessible');
      if (profiles && profiles.length > 0) {
        console.log('Sample profile columns:', Object.keys(profiles[0]));
      }
    }
    console.log('');

    // Check organizations table
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);

    if (orgError) {
      console.error('❌ Error querying organizations:', orgError);
    } else {
      console.log('✅ Organizations table accessible');
      if (orgs && orgs.length > 0) {
        console.log('Sample organization columns:', Object.keys(orgs[0]));
      } else {
        console.log('No organizations found');
      }
    }
    console.log('');

    // Check users via auth (might not work with anon key)
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('ℹ️  Cannot access auth with anon key (expected)');
    } else {
      console.log('Auth session:', authData);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkSchema();
