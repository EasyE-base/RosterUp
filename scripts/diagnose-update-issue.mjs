import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, anonKey);

async function diagnoseUpdateIssue() {
  console.log('=== DIAGNOSING UPDATE ISSUE ===\n');

  // Get the first player
  const { data: players, error: fetchError } = await supabase
    .from('player_profiles')
    .select('id, user_id, photo_url, created_at')
    .order('created_at', { ascending: true })
    .limit(1);

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  if (!players || players.length === 0) {
    console.log('No players found');
    return;
  }

  const player = players[0];
  console.log('Testing update on player:');
  console.log('  ID:', player.id);
  console.log('  User ID:', player.user_id);
  console.log('  Current photo:', player.photo_url);
  console.log('  Created at:', player.created_at);
  console.log();

  // Try to update
  const newPhotoUrl = '/player-photos/player-1.jpg';
  console.log('Attempting to update photo_url to:', newPhotoUrl);
  console.log();

  const { data: updateData, error: updateError } = await supabase
    .from('player_profiles')
    .update({ photo_url: newPhotoUrl })
    .eq('id', player.id)
    .select();

  if (updateError) {
    console.error('❌ UPDATE FAILED');
    console.error('Error code:', updateError.code);
    console.error('Error message:', updateError.message);
    console.error('Error details:', updateError.details);
    console.error('Error hint:', updateError.hint);
    console.error('Full error:', JSON.stringify(updateError, null, 2));
  } else {
    console.log('✅ UPDATE SUCCESSFUL');
    console.log('Updated data:', updateData);
  }

  console.log();

  // Verify the current value
  const { data: verifyData, error: verifyError } = await supabase
    .from('player_profiles')
    .select('photo_url')
    .eq('id', player.id)
    .single();

  if (verifyError) {
    console.error('Verification error:', verifyError);
  } else {
    console.log('Current value in database:', verifyData.photo_url);
  }
}

diagnoseUpdateIssue();
