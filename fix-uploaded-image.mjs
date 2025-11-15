import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixImage() {
  console.log('🔧 Fixing uploaded image...\n');

  // First, get the player profile ID for user 3231a3c2-2a31-41be-a48d-106ac1e169bb
  const userId = '3231a3c2-2a31-41be-a48d-106ac1e169bb';

  const { data: playerProfile, error: profileError } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('❌ Error finding player profile:', profileError);
    return;
  }

  console.log(`✅ Found player profile ID: ${playerProfile.id}`);

  // Now insert the media record
  const imageUrl = `https://hnaqmskjbsrltdcvinai.supabase.co/storage/v1/object/public/player-media/photos/${userId}/1762749339265-b35onv.jpg`;

  const { data, error } = await supabase
    .from('player_media')
    .insert({
      player_id: playerProfile.id,
      media_type: 'photo',
      file_url: imageUrl,
      file_size: 172940,
      mime_type: 'image/jpeg',
      is_featured: false,
      display_order: 0
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error inserting media record:', error);
    return;
  }

  console.log(`✅ Successfully created media record!`);
  console.log(`   ID: ${data.id}`);
  console.log(`   URL: ${data.file_url}`);
  console.log('\n✨ Image should now be visible in the photo gallery!');
}

fixImage();
