import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 Adding address column to tournaments table...\n');

// Read the SQL file
const sql = readFileSync('add-address-column.sql', 'utf-8');

console.log('Executing SQL:');
console.log(sql);
console.log('');

// Execute the SQL
const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.log('Note: Direct SQL execution not available via RPC.');
  console.log('');
  console.log('✅ Please run this SQL manually in Supabase Dashboard:');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql/new');
  console.log('2. Paste this SQL:');
  console.log('');
  console.log('   ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS address TEXT;');
  console.log('');
  console.log('3. Click "Run"');
  console.log('');
  console.log('After that, try creating the tournament again!');
} else {
  console.log('✅ Address column added successfully!');
  console.log('');
  console.log('Now try creating your tournament again in the browser.');
}
