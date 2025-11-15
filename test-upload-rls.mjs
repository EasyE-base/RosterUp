import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { createCanvas } from 'canvas';

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
    email: 'test@example.com',
    password: 'TestPassword123!'
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

  // Step 3: Create test image
  console.log('\n3️⃣ Creating test image...');
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FF6B6B';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('RLS TEST', 50, 110);

  const buffer = canvas.toBuffer('image/png');
  const fileName = `test-rls-${Date.now()}.png`;
  console.log('✅ Created test image:', fileName);

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
    console.error('\nThis means the SQL fix has NOT been applied yet.');
    console.error('The RLS policy is still missing the WITH CHECK clause.\n');
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
}

testUpload().catch(console.error);
