import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Reading SQL file...');
const sql = readFileSync('./fix-tryout-applications-fk.sql', 'utf-8');

console.log('\n=== SQL to be executed ===');
console.log(sql);
console.log('=== End of SQL ===\n');

console.log('Please run this SQL manually in your Supabase SQL Editor:');
console.log('1. Go to https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql/new');
console.log('2. Copy and paste the SQL above');
console.log('3. Click "Run" to execute\n');

console.log('This will fix the foreign key constraint so tryout_applications.player_id points to player_profiles(id) instead of players(id)');
