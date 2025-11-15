import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseImageIssue() {
  console.log('🔍 Diagnosing image storage issue...\n');

  try {
    // Check recent player_media entries
    const { data: media, error: mediaError } = await supabase
      .from('player_media')
      .select('*')
      .eq('media_type', 'photo')
      .order('created_at', { ascending: false })
      .limit(5);

    if (mediaError) {
      console.error('❌ Error fetching media:', mediaError);
      return;
    }

    console.log(`📊 Found ${media?.length || 0} recent photos\n`);

    if (media && media.length > 0) {
      media.forEach((item, index) => {
        console.log(`Photo #${index + 1}:`);
        console.log(`  URL: ${item.file_url}`);
        console.log(`  Created: ${item.created_at}`);
        console.log(`  Size: ${item.file_size} bytes`);
        console.log('');
      });

      // Test if we can access the first image
      const testUrl = media[0].file_url;
      console.log(`\n🧪 Testing URL access: ${testUrl}`);

      try {
        const response = await fetch(testUrl);
        console.log(`  Status: ${response.status} ${response.statusText}`);
        console.log(`  Content-Type: ${response.headers.get('content-type')}`);

        if (response.status === 200) {
          console.log('  ✅ Image is accessible!');
        } else if (response.status === 404) {
          console.log('  ❌ Image not found - file may not exist in storage');
        } else if (response.status === 403) {
          console.log('  ❌ Access forbidden - storage bucket needs public access policy');
        }
      } catch (fetchError) {
        console.log('  ❌ Fetch failed:', fetchError.message);
      }
    }

    // List storage buckets
    console.log('\n📦 Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    } else {
      console.log('Available buckets:');
      buckets?.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'PUBLIC' : 'PRIVATE'})`);
      });
    }

    // Try to list files in player-media bucket
    console.log('\n📁 Checking files in player-media bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from('player-media')
      .list('photos', {
        limit: 10,
        offset: 0,
      });

    if (filesError) {
      console.error('❌ Error listing files:', filesError);
    } else {
      console.log(`Found ${files?.length || 0} folders in photos/`);
      if (files && files.length > 0) {
        files.forEach(file => {
          console.log(`  - ${file.name}`);
        });
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

diagnoseImageIssue();
