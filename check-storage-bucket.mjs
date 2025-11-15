import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBucket() {
  console.log('🔍 Checking Supabase Storage Configuration\n');

  // List all buckets
  console.log('1️⃣ Listing all storage buckets...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Error listing buckets:', listError);
    return;
  }

  console.log(`✅ Found ${buckets.length} bucket(s):\n`);
  buckets.forEach((bucket, i) => {
    console.log(`   ${i + 1}. ${bucket.name}`);
    console.log(`      - Public: ${bucket.public}`);
    console.log(`      - ID: ${bucket.id}`);
    console.log(`      - Created: ${bucket.created_at}`);
    console.log('');
  });

  // Check if player-media bucket exists
  const playerMediaBucket = buckets.find(b => b.name === 'player-media');

  if (!playerMediaBucket) {
    console.error('❌ "player-media" bucket NOT FOUND!');
    console.error('\nThis is the problem! The bucket needs to be created.');
    console.error('\nTo fix:');
    console.error('1. Go to Supabase Dashboard → Storage');
    console.error('2. Create a new bucket named "player-media"');
    console.error('3. Make it PUBLIC');
    console.error('4. Set appropriate file size limits\n');
    return;
  }

  console.log('✅ "player-media" bucket exists!');
  console.log(`   - Public: ${playerMediaBucket.public}`);

  if (!playerMediaBucket.public) {
    console.error('\n⚠️  WARNING: Bucket is NOT public!');
    console.error('Images won\'t be accessible via public URLs.');
    console.error('\nTo fix: Make the bucket public in Supabase Dashboard\n');
  }

  // Try to list files in the bucket
  console.log('\n2️⃣ Listing files in player-media bucket...');
  const { data: files, error: filesError } = await supabase.storage
    .from('player-media')
    .list('photos', {
      limit: 10,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (filesError) {
    console.error('❌ Error listing files:', filesError);
    return;
  }

  console.log(`✅ Found ${files.length} item(s) in photos/ folder\n`);

  if (files.length > 0) {
    files.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file.name} (${Math.round(file.metadata?.size / 1024)}KB)`);
    });
  }
}

checkBucket().catch(console.error);
