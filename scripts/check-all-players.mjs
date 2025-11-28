import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkPlayers() {
  console.log('Checking player profiles...\n');

  // Get all player profiles
  const { data: allPlayers, error: allError } = await supabase
    .from('player_profiles')
    .select('id, user_id, sport, is_visible_in_search, is_active, photo_url')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('Error fetching all players:', allError);
    return;
  }

  console.log(`Total player profiles: ${allPlayers.length}`);
  console.log(`Visible in search: ${allPlayers.filter(p => p.is_visible_in_search).length}`);
  console.log(`Active: ${allPlayers.filter(p => p.is_active).length}`);
  console.log(`Has photo: ${allPlayers.filter(p => p.photo_url).length}`);

  console.log('\nAll players:');
  allPlayers.forEach((player, index) => {
    console.log(`${index + 1}. ID: ${player.id}`);
    console.log(`   User ID: ${player.user_id}`);
    console.log(`   Sport: ${player.sport}`);
    console.log(`   Visible: ${player.is_visible_in_search}`);
    console.log(`   Active: ${player.is_active}`);
    console.log(`   Has Photo: ${!!player.photo_url}`);
    console.log('');
  });

  // Check what the anon query returns (what the UI sees)
  const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew');

  const { data: visiblePlayers, error: visibleError } = await anonClient
    .from('player_profiles')
    .select('*')
    .eq('is_visible_in_search', true)
    .eq('is_active', true);

  console.log('\nPlayers visible to anon users (what the UI sees):');
  console.log(`Count: ${visiblePlayers?.length || 0}`);

  if (visibleError) {
    console.error('Error fetching visible players:', visibleError);
  }
}

checkPlayers();
