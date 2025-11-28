import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!; // Using anon key is fine for reading public profile usually, but let's see.
// Actually, for profiles we might need service role if RLS blocks reading others, but usually users can read their own. 
// But here we are running as a script. We should use service role if available, or just try anon.
// The user's previous logs showed the ID: 893e7c5f-df6b-4c06-8f19-226498eed5da

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
  const userId = '893e7c5f-df6b-4c06-8f19-226498eed5da';
  console.log('Checking profile for user:', userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
  } else {
    console.log('Profile Data:', data);
    console.log('User Type:', data.user_type);
    console.log('Is Trainer?', data.user_type === 'trainer');
  }
}

checkProfile();
