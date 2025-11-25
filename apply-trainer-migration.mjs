#!/usr/bin/env node

/**
 * Helper script to apply the trainer role migration
 *
 * This script reads the migration SQL file and executes it against the Supabase database.
 * It requires direct database access credentials.
 *
 * Usage:
 *   node apply-trainer-migration.mjs
 *
 * Prerequisites:
 *   - PostgreSQL connection string with admin access
 *   - Or use Supabase SQL Editor directly
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials (service role key required for migrations)
const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

console.log('📋 Trainer Role Migration Helper\n');
console.log('⚠️  WARNING: This script requires direct database access.');
console.log('⚠️  Supabase client library does not support raw SQL execution.\n');
console.log('✅ RECOMMENDED APPROACH:');
console.log('   1. Open Supabase Dashboard: https://supabase.com/dashboard');
console.log('   2. Navigate to: SQL Editor');
console.log('   3. Create a new query');
console.log('   4. Copy the contents of: supabase/migrations/20250116000000_add_trainer_role.sql');
console.log('   5. Paste into the SQL Editor');
console.log('   6. Click "Run" to execute\n');

console.log('📄 Migration file location:');
console.log('   ' + join(__dirname, 'supabase/migrations/20250116000000_add_trainer_role.sql'));
console.log('');

console.log('🔗 Direct link to SQL Editor:');
console.log('   https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql/new');
console.log('');

console.log('📝 What this migration does:');
console.log('   ✓ Adds "trainer" to profiles.user_type enum');
console.log('   ✓ Creates trainers table with intro videos and location fields');
console.log('   ✓ Creates training_sessions table with rich media support');
console.log('   ✓ Creates session_bookings table for booking requests');
console.log('   ✓ Sets up RLS policies for all tables');
console.log('   ✓ Creates indexes for performance');
console.log('   ✓ Adds updated_at triggers');
console.log('');

console.log('🗃️  Storage buckets to create manually:');
console.log('   After running the migration, create these storage buckets in Supabase Dashboard:');
console.log('');
console.log('   1. trainer-videos');
console.log('      - Public: ✅');
console.log('      - File size limit: 500MB');
console.log('      - Allowed types: video/mp4, video/quicktime, video/webm');
console.log('');
console.log('   2. trainer-photos');
console.log('      - Public: ✅');
console.log('      - File size limit: 10MB');
console.log('      - Allowed types: image/jpeg, image/png, image/webp');
console.log('');
console.log('   3. session-media');
console.log('      - Public: ✅');
console.log('      - File size limit: 500MB');
console.log('      - Allowed types: image/*, video/*');
console.log('');

console.log('🔐 Storage bucket RLS policies to create:');
console.log('   For each bucket, add these policies in Storage settings:');
console.log('');
console.log('   SELECT (Read):');
console.log('     - Policy name: "Public read access"');
console.log('     - SQL: true');
console.log('');
console.log('   INSERT (Upload):');
console.log('     - Policy name: "Authenticated users can upload"');
console.log('     - SQL: (auth.role() = \'authenticated\')');
console.log('');
console.log('   UPDATE:');
console.log('     - Policy name: "Users can update their own files"');
console.log('     - SQL: (auth.uid() = owner)');
console.log('');
console.log('   DELETE:');
console.log('     - Policy name: "Users can delete their own files"');
console.log('     - SQL: (auth.uid() = owner)');
console.log('');

console.log('✨ Ready to proceed!');
console.log('   Copy the migration SQL and run it in Supabase SQL Editor.');
console.log('');

// Optional: Read and display the SQL file
try {
  const migrationPath = join(__dirname, 'supabase/migrations/20250116000000_add_trainer_role.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('📄 Migration SQL Preview (first 500 characters):');
  console.log('─'.repeat(80));
  console.log(migrationSQL.substring(0, 500) + '...');
  console.log('─'.repeat(80));
  console.log('');
  console.log(`Full file: ${migrationSQL.length} characters, ${migrationSQL.split('\n').length} lines`);
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
}
