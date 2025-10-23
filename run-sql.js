// Run SQL to add clone columns
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://gxswglqujavrcepvujpk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4c3dnbHF1amF2cmNlcHZ1anBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQyMzIyNywiZXhwIjoyMDYwMDAyMjI3fQ.fZBKhsfe9hXs80whGQxh-eN9NwdgDZuxlZqJhWLuKSo'
);

const sql = fs.readFileSync('add-clone-columns.sql', 'utf8');

// Split by semicolons and run each statement
const statements = sql.split(';').filter(s => s.trim());

for (const statement of statements) {
  if (statement.trim()) {
    console.log('Running:', statement.substring(0, 100) + '...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('✓ Success');
    }
  }
}

console.log('Done!');
