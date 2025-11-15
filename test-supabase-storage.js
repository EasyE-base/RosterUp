/**
 * Supabase Storage Test Script
 *
 * Run this script to verify your Supabase Storage setup:
 * node test-supabase-storage.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n🔍 Supabase Storage Test\n');
console.log('═'.repeat(50));

// Check environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Error: Missing Supabase credentials in .env file\n');
  console.log('Required environment variables:');
  console.log('  - VITE_SUPABASE_URL');
  console.log('  - VITE_SUPABASE_ANON_KEY\n');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageSetup() {
  try {
    console.log('🔌 Testing Supabase connection...\n');

    // Test 1: List all buckets
    console.log('Test 1: Listing storage buckets');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message);
      return;
    }

    console.log(`✅ Found ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} ${bucket.public ? '(public)' : '(private)'}`);
    });
    console.log();

    // Test 2: Check if website-assets bucket exists
    console.log('Test 2: Checking for website-assets bucket');
    const websiteAssetsBucket = buckets.find(b => b.name === 'website-assets');

    if (!websiteAssetsBucket) {
      console.error('❌ Bucket "website-assets" NOT FOUND\n');
      console.log('📝 Setup Instructions:\n');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Click "Storage" in the sidebar');
      console.log('4. Click "New bucket"');
      console.log('5. Name it "website-assets"');
      console.log('6. Toggle "Public bucket" to ON');
      console.log('7. Click "Create bucket"\n');
      return;
    }

    console.log('✅ Bucket "website-assets" found');
    console.log(`   Public: ${websiteAssetsBucket.public ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   ID: ${websiteAssetsBucket.id}`);
    console.log();

    if (!websiteAssetsBucket.public) {
      console.warn('⚠️  Warning: Bucket is NOT public. Make it public for image URLs to work.\n');
    }

    // Test 3: List files in the bucket
    console.log('Test 3: Listing files in website-assets');
    const { data: files, error: filesError } = await supabase.storage
      .from('website-assets')
      .list('website-images', { limit: 10 });

    if (filesError) {
      console.warn('⚠️  Could not list files:', filesError.message);
    } else {
      console.log(`✅ Found ${files.length} file(s) in website-images/`);
      if (files.length > 0) {
        files.forEach(file => {
          console.log(`   - ${file.name} (${(file.metadata.size / 1024).toFixed(2)} KB)`);
        });
      }
    }
    console.log();

    // Test 4: Check bucket policies (requires service_role key, skipping for now)
    console.log('Test 4: Checking storage policies');
    console.log('⚠️  Policy check requires admin access (skipped)');
    console.log('   Manually verify in Supabase Dashboard > Storage > Policies\n');

    // Final summary
    console.log('═'.repeat(50));
    console.log('\n✅ Storage Setup Status:\n');
    console.log(`   Supabase Connection: ${buckets ? '✅ Working' : '❌ Failed'}`);
    console.log(`   website-assets Bucket: ${websiteAssetsBucket ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   Bucket Public: ${websiteAssetsBucket?.public ? '✅ Yes' : '❌ No'}`);
    console.log();

    if (websiteAssetsBucket && websiteAssetsBucket.public) {
      console.log('🎉 Storage is ready for image uploads!\n');
      console.log('Next steps:');
      console.log('1. Run: pnpm run dev');
      console.log('2. Open your website builder');
      console.log('3. Enter edit mode');
      console.log('4. Try uploading an image');
      console.log('5. Check browser console for debug logs\n');
    } else {
      console.log('⚠️  Storage setup incomplete. Follow the instructions above.\n');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('\nFull error:', error);
    console.log();
  }
}

// Run the tests
testStorageSetup();
