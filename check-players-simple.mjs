import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'
);

async function checkPlayers() {
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*');

  console.log('\n=== Player Records ===');
  if (playersError) {
    console.error('Error:', playersError);
  } else {
    console.log('Count:', players ? players.length : 0);
    console.log(JSON.stringify(players, null, 2));
  }
}

checkPlayers();
