import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, anonKey);

const imageFiles = [
  '/Users/erictrovarelli/Downloads/IMG_4108.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4109.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4110.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4111.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4112.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4113.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4114.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4115.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4116.JPG',
  '/Users/erictrovarelli/Downloads/IMG_4117.JPG'
];

async function uploadImages() {
  console.log('Uploading 10 player images to Supabase storage...\n');

  const uploadedUrls = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i];
    const fileName = `player-${i + 1}-${Date.now()}.jpg`;

    console.log(`${i + 1}. Uploading ${filePath.split('/').pop()}...`);

    try {
      // Read the file
      const fileBuffer = readFileSync(filePath);

      // Upload to Supabase storage
      const { data, error} = await supabase.storage
        .from('player-media')
        .upload(`photos/${fileName}`, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error(`   ❌ Upload error: ${error.message}`);
        uploadedUrls.push(null);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('player-media')
        .getPublicUrl(`photos/${fileName}`);

      console.log(`   ✓ Uploaded: ${urlData.publicUrl}`);
      uploadedUrls.push(urlData.publicUrl);

    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      uploadedUrls.push(null);
    }
  }

  console.log('\n✅ Upload complete!');
  console.log(`\nSuccessfully uploaded: ${uploadedUrls.filter(url => url !== null).length}/10`);

  // Now update player profiles with these URLs
  console.log('\nUpdating player profiles with new photo URLs...\n');

  // Get all player profiles ordered by creation
  const { data: players, error: fetchError } = await supabase
    .from('player_profiles')
    .select('id, user_id')
    .order('created_at', { ascending: true })
    .limit(10);

  if (fetchError) {
    console.error('Error fetching players:', fetchError);
    return;
  }

  for (let i = 0; i < players.length && i < uploadedUrls.length; i++) {
    if (!uploadedUrls[i]) continue;

    const player = players[i];
    console.log(`${i + 1}. Updating player ${player.id}...`);

    const { error: updateError } = await supabase
      .from('player_profiles')
      .update({ photo_url: uploadedUrls[i] })
      .eq('id', player.id);

    if (updateError) {
      console.error(`   ❌ Update error: ${updateError.message}`);
    } else {
      console.log(`   ✓ Updated with ${uploadedUrls[i]}`);
    }
  }

  console.log('\n✅ All done! Player profiles updated with uploaded images.');
  console.log('Visit http://localhost:5174/players to see the updated photos!');
}

uploadImages();
