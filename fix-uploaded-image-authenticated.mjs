import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixImage() {
  console.log('🔧 Fixing uploaded image with authentication...\n');

  // Sign in as the test player
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'testplayer@example.com',
    password: 'testpassword123'
  });

  if (authError) {
    console.error('❌ Error signing in:', authError);
    return;
  }

  console.log('✅ Signed in as:', authData.user.email);
  console.log('   User ID:', authData.user.id);

  // Get the player profile ID
  const { data: playerProfile, error: profileError } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', authData.user.id)
    .single();

  if (profileError) {
    console.error('❌ Error finding player profile:', profileError);
    return;
  }

  console.log('✅ Found player profile ID:', playerProfile.id);

  // Now insert the media record (authenticated as the player)
  const imageUrl = `https://hnaqmskjbsrltdcvinai.supabase.co/storage/v1/object/public/player-media/photos/${authData.user.id}/1762749339265-b35onv.jpg`;

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
    console.log('\n⚠️  The RLS policy may not have been applied correctly.');
    console.log('Please verify you ran this SQL in Supabase SQL Editor:\n');
    console.log('DROP POLICY IF EXISTS player_media_owner ON player_media;');
    console.log('CREATE POLICY player_media_owner ON player_media');
    console.log('  FOR ALL');
    console.log('  USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()))');
    console.log('  WITH CHECK (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));');
    return;
  }

  console.log('\n✅ Successfully created media record!');
  console.log(`   ID: ${data.id}`);
  console.log(`   URL: ${data.file_url}`);
  console.log('\n✨ Image should now be visible in the photo gallery!');

  // Sign out
  await supabase.auth.signOut();
}

fixImage();
