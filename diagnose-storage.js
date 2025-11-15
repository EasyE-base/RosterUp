/**
 * Advanced Supabase Storage Diagnostic Script
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n🔬 Advanced Supabase Storage Diagnostic\n');
console.log('═'.repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing credentials\n');
  process.exit(1);
}

console.log(`\n📍 Project URL: ${supabaseUrl}`);
console.log(`📍 Project ID: ${supabaseUrl.split('//')[1].split('.')[0]}`);
console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 30)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function advancedDiagnostics() {
  console.log('\n' + '═'.repeat(60));
  console.log('\n🔍 Diagnostic Tests\n');

  // Test 1: List buckets with detailed error info
  console.log('Test 1: List Storage Buckets (with full error details)');
  try {
    const response = await supabase.storage.listBuckets();
    console.log('   Raw response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('   ❌ Error details:');
      console.error('      Message:', response.error.message);
      console.error('      Status:', response.error.status);
      console.error('      Full error:', response.error);
    } else if (response.data) {
      console.log(`   ✅ Found ${response.data.length} bucket(s)`);
      response.data.forEach(bucket => {
        console.log(`      - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        console.log(`        ID: ${bucket.id}`);
        console.log(`        Created: ${bucket.created_at}`);
      });
    }
  } catch (error) {
    console.error('   ❌ Exception:', error.message);
    console.error('   Stack:', error.stack);
  }

  console.log('\n' + '-'.repeat(60) + '\n');

  // Test 2: Try to access website-assets directly
  console.log('Test 2: Direct Access to "website-assets" Bucket');
  try {
    const { data, error } = await supabase.storage
      .from('website-assets')
      .list('', { limit: 1 });

    if (error) {
      console.log('   ❌ Cannot access bucket');
      console.log('      Error:', error.message);
      console.log('      Status:', error.statusCode);
      console.log('      This confirms the bucket does NOT exist or is not accessible');
    } else {
      console.log('   ✅ Bucket exists and is accessible!');
      console.log('      Contents:', data);
    }
  } catch (error) {
    console.error('   ❌ Exception:', error.message);
  }

  console.log('\n' + '-'.repeat(60) + '\n');

  // Test 3: Check Supabase service status
  console.log('Test 3: Supabase API Connection');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    console.log('   API Status:', response.status);
    console.log('   API OK:', response.ok ? '✅ Yes' : '❌ No');

    if (!response.ok) {
      console.log('   Response:', await response.text());
    }
  } catch (error) {
    console.error('   ❌ Cannot connect to Supabase API:', error.message);
  }

  console.log('\n' + '-'.repeat(60) + '\n');

  // Test 4: Try alternative bucket names (in case of typo)
  console.log('Test 4: Check for Common Bucket Name Variations');
  const variations = [
    'website-assets',
    'websiteassets',
    'website_assets',
    'WebsiteAssets',
    'Website-Assets',
    'assets',
    'images'
  ];

  for (const name of variations) {
    try {
      const { data, error } = await supabase.storage
        .from(name)
        .list('', { limit: 1 });

      if (!error) {
        console.log(`   ✅ Found bucket: "${name}"`);
      }
    } catch (error) {
      // Silent - just checking
    }
  }
  console.log('   (Only showing buckets that exist)');

  console.log('\n' + '═'.repeat(60));
  console.log('\n📋 Summary & Recommendations\n');

  // Provide recommendations
  console.log('Possible Issues:\n');

  console.log('1. ❌ Bucket Not Created Yet');
  console.log('   - Go to: ' + supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '') + '/storage/buckets');
  console.log('   - Create a new bucket named "website-assets"');
  console.log('   - Make sure to toggle "Public bucket" ON\n');

  console.log('2. ❌ Wrong Supabase Project');
  console.log('   - Verify you\'re in the correct project');
  console.log('   - Project ID should be: ' + supabaseUrl.split('//')[1].split('.')[0]);
  console.log('   - Check: https://supabase.com/dashboard/projects\n');

  console.log('3. ❌ API Key Permissions');
  console.log('   - Your anon key might not have storage.listBuckets permission');
  console.log('   - This is OK - just create the bucket and it will work\n');

  console.log('4. ❌ Bucket Created but API Not Seeing It');
  console.log('   - Try refreshing the Supabase dashboard');
  console.log('   - Wait 30 seconds and run this test again');
  console.log('   - Check if bucket shows in dashboard\n');

  console.log('═'.repeat(60) + '\n');
  console.log('💡 Next Steps:\n');
  console.log('1. Verify bucket exists in Supabase Dashboard');
  console.log('2. Take a screenshot of your Storage page');
  console.log('3. Share the screenshot to confirm bucket creation');
  console.log('4. Try uploading directly in Supabase Dashboard first\n');
}

advancedDiagnostics();
