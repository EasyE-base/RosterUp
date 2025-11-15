import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTeamAssetsBucket() {
  console.log('Creating team-assets storage bucket...');

  try {
    // Create the bucket
    const { data: bucket, error: createError } = await supabase.storage.createBucket('team-assets', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });

    if (createError) {
      if (createError.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
      } else {
        throw createError;
      }
    } else {
      console.log('✅ Bucket created successfully');
    }

    console.log('\nBucket details:');
    const { data: buckets } = await supabase.storage.listBuckets();
    const teamAssetsBucket = buckets?.find(b => b.name === 'team-assets');
    console.log(teamAssetsBucket);

    console.log('\n✅ Team assets bucket is ready!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTeamAssetsBucket();
