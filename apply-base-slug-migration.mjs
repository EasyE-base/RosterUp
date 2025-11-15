#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Testing base_slug column in website_pages...\n');

// Test if base_slug column exists by trying to query it
async function testBaseSlugColumn() {
  try {
    const { data, error } = await supabase
      .from('website_pages')
      .select('id, slug, base_slug')
      .limit(1);

    if (error) {
      if (error.message.includes('base_slug') || error.message.includes('column') || error.code === '42703') {
        console.log('❌ base_slug column does NOT exist');
        console.log('Error:', error.message);
        return false;
      }
      console.log('⚠️  Unexpected error:', error.message);
      return false;
    }

    console.log('✅ base_slug column EXISTS');
    return true;
  } catch (err) {
    console.error('Test failed:', err);
    return false;
  }
}

const columnExists = await testBaseSlugColumn();

if (columnExists) {
  console.log('\n✅ Migration is already applied!');
  console.log('The database already has the base_slug column in website_pages table.');
} else {
  console.log('\n⚠️  Migration is needed but cannot be run with anon key');
  console.log('Please run the migration manually using one of these methods:\n');
  console.log('📝 Method 1: Supabase Dashboard (RECOMMENDED)');
  console.log('   1. Go to: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai');
  console.log('   2. Navigate to SQL Editor in the left sidebar');
  console.log('   3. Click "New Query"');
  console.log('   4. Paste and run this SQL:\n');
  console.log('   ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS base_slug text;');
  console.log('   CREATE INDEX IF NOT EXISTS website_pages_base_slug_idx ON website_pages (website_id, base_slug);\n');
  console.log('📝 Method 2: CLI (requires database password)');
  console.log('   supabase db push\n');
  console.log('Migration file: supabase/migrations/20251031000000_add_base_slug_to_pages.sql');
}
