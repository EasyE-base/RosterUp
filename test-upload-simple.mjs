import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testUpload() {
  console.log('🧪 Testing RLS Policy Fix\n');

  // Step 1: Sign in as test user
  console.log('1️⃣ Signing in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'testplayer@rosterup.com',
    password: 'TestPlayer123!'
  });

  if (authError) {
    console.error('❌ Auth failed:', authError.message);
    return;
  }
  console.log('✅ Signed in as:', authData.user.email);

  // Step 2: Get player profile ID
  console.log('\n2️⃣ Getting player profile...');
  const { data: profile, error: profileError } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', authData.user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile fetch failed:', profileError.message);
    return;
  }
  console.log('✅ Player ID:', profile.id);

  // Step 3: Use existing test image or create simple one
  console.log('\n3️⃣ Preparing test image...');
  // Create a simple 1x1 PNG
  const buffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  );
  const fileName = `test-rls-${Date.now()}.png`;
  console.log('✅ Prepared test image:', fileName);

  // Step 4: Upload to storage
  console.log('\n4️⃣ Uploading to storage...');
  const filePath = `photos/${authData.user.id}/${fileName}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('player-media')
    .upload(filePath, buffer, {
      contentType: 'image/png',
      cacheControl: '3600'
    });

  if (uploadError) {
    console.error('❌ Storage upload failed:', uploadError.message);
    return;
  }
  console.log('✅ Uploaded to storage:', filePath);

  // Step 5: Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('player-media')
    .getPublicUrl(filePath);

  console.log('✅ Public URL:', publicUrl);

  // Step 6: Insert database record (THIS IS THE CRITICAL TEST)
  console.log('\n5️⃣ Inserting database record (RLS policy test)...');
  const { data: insertData, error: insertError } = await supabase
    .from('player_media')
    .insert({
      player_id: profile.id,
      media_type: 'photo',
      file_url: publicUrl,
      file_size: buffer.length,
      mime_type: 'image/png',
      is_featured: false,
      display_order: 0
    })
    .select();

  if (insertError) {
    console.error('\n❌ DATABASE INSERT FAILED - RLS POLICY STILL BLOCKING!');
    console.error('Error:', insertError.message);
    console.error('\n⚠️  This means the SQL fix has NOT been applied yet.');
    console.error('The RLS policy is still missing the WITH CHECK clause.\n');
    console.error('📋 To fix this, you need to run the SQL in: fix-player-media-rls.sql');
    console.error('   in the Supabase Dashboard SQL Editor.\n');
    return;
  }

  console.log('✅ DATABASE INSERT SUCCESS!');
  console.log('   Record ID:', insertData[0].id);
  console.log('\n🎉 SUCCESS! The RLS policy has been fixed!');
  console.log('   Images can now be uploaded and stored properly.\n');

  // Step 7: Verify we can read it back
  console.log('6️⃣ Verifying record can be read back...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('player_media')
    .select('*')
    .eq('id', insertData[0].id)
    .single();

  if (verifyError) {
    console.error('❌ Read verification failed:', verifyError.message);
    return;
  }

  console.log('✅ Record verified! All operations working correctly.\n');

  // Count total photos
  const { data: allPhotos } = await supabase
    .from('player_media')
    .select('id')
    .eq('media_type', 'photo');

  console.log(`📊 Total photos in database: ${allPhotos?.length || 0}\n`);
}

testUpload().catch(console.error);
