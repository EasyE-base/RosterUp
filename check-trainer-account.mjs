import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI'
);

console.log('🔍 Checking trainer account setup...\n');

// Get profile
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'trainer@example.com')
  .single();

console.log('Profile:', profile);
console.log('Profile Error:', profileError);

// Get trainer
const { data: trainer, error: trainerError } = await supabase
  .from('trainers')
  .select('*')
  .eq('user_id', profile?.id)
  .maybeSingle();

console.log('\nTrainer:', trainer);
console.log('Trainer Error:', trainerError);

console.log('\n📊 Summary:');
console.log('Email:', profile?.email);
console.log('User Type:', profile?.user_type);
console.log('Has Trainer Record:', !!trainer);
console.log('Trainer ID:', trainer?.id);
