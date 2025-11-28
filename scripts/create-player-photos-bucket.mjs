import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, anonKey);

async function checkAndCreateBucket() {
  console.log('Checking existing storage buckets...\n');

  // List all buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  console.log('Existing buckets:');
  buckets.forEach(bucket => {
    console.log(`  - ${bucket.name} (public: ${bucket.public})`);
  });

  // Check if player-photos bucket exists
  const playerPhotosBucket = buckets.find(b => b.name === 'player-photos');

  if (playerPhotosBucket) {
    console.log('\n✅ player-photos bucket already exists!');
  } else {
    console.log('\n❌ player-photos bucket not found.');
    console.log('\nTo create the bucket, please:');
    console.log('1. Go to Supabase Dashboard → Storage');
    console.log('2. Click "New Bucket"');
    console.log('3. Name it "player-photos"');
    console.log('4. Make it PUBLIC');
    console.log('5. Allow file uploads: JPG, JPEG, PNG, WEBP');
    console.log('6. Max file size: 5MB');
  }

  // Check what buckets we CAN use
  console.log('\nTrying to use existing buckets...');
  if (buckets.length > 0) {
    console.log(`\nLet me try uploading to the first available bucket: ${buckets[0].name}`);
    return buckets[0].name;
  }
}

checkAndCreateBucket().then(bucketName => {
  if (bucketName) {
    console.log(`\nYou can use bucket: ${bucketName}`);
  }
});
