// Quick test to verify Smart Import page filtering and limits
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testSmartImport() {
  console.log('🧪 Testing Smart Import with 12 URLs (should process only 10)...\n');

  const testUrls = [
    'https://newjerseygators.com/',
    'https://newjerseygators.com/about/',
    'https://newjerseygators.com/teams/',
    'https://newjerseygators.com/schedule/',
    'https://newjerseygators.com/contact/',
    'https://newjerseygators.com/news/',
    'https://newjerseygators.com/recruiting/',
    'https://newjerseygators.com/tryouts/',
    'https://newjerseygators.com/sponsors/',
    'https://newjerseygators.com/gallery/',
    'https://newjerseygators.com/store/',
    'https://newjerseygators.com/donate/'
  ];

  console.log('📋 Test URLs:');
  testUrls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
  console.log();

  try {
    console.log('🚀 Calling vercel-agent-import Edge Function...\n');

    const { data, error } = await supabase.functions.invoke('vercel-agent-import', {
      body: {
        urls: testUrls,
        organizationId: 'test-org-' + Date.now(),
        subdomain: 'test-' + Date.now(),
        mode: 'smart'
      }
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Success!');
    console.log('📊 Result:');
    console.log(`  Pages requested: ${testUrls.length}`);
    console.log(`  Pages processed: ${data.pagesImported || 'unknown'}`);
    console.log(`  Website ID: ${data.websiteId || 'unknown'}`);
    console.log();

    if (data.pagesImported && data.pagesImported <= 10) {
      console.log('✅ PASS: Smart Import correctly limited to 10 pages');
    } else {
      console.log('⚠️  WARNING: More than 10 pages processed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('========================================');
console.log('  SMART IMPORT TEST');
console.log('========================================\n');

testSmartImport()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
