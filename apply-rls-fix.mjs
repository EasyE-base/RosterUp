import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Create admin client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function applyRLSFix() {
  console.log('🔧 Applying RLS policy fix for player_media table...\n');

  try {
    // Read the SQL file
    const sql = fs.readFileSync('./fix-player-media-rls.sql', 'utf8');

    // Split into individual statements (filter out comments and empty lines)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('SELECT')) {
        // This is the verification query
        console.log('📊 Verifying policy...\n');
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          // Try direct query
          const result = await supabase.from('pg_policies').select('*');
          console.log('Policy check result:', result);
        } else {
          console.log('✅ Policy verified:', data);
        }
      } else {
        console.log(`Executing: ${statement.substring(0, 80)}...`);

        // Execute the statement
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.error('❌ Error:', error);
          console.log('\n⚠️  If you see permission errors, you need to run this SQL manually in Supabase SQL Editor:');
          console.log('\n' + sql);
          return;
        } else {
          console.log('✅ Success\n');
        }
      }
    }

    console.log('\n🎉 RLS policy fix applied successfully!');
    console.log('\nNow try uploading an image again - it should work!');

  } catch (err) {
    console.error('❌ Error reading or executing SQL:', err);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n');
    const sql = fs.readFileSync('./fix-player-media-rls.sql', 'utf8');
    console.log(sql);
  }
}

applyRLSFix();
