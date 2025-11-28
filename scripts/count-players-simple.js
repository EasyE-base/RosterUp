const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

fetch(`${supabaseUrl}/rest/v1/player_profiles?select=id,sport,is_active,is_visible_in_search,photo_url&order=created_at.desc`, {
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log(`Total players in database: ${data.length}`);
  console.log(`Visible + Active: ${data.filter(p => p.is_active && p.is_visible_in_search).length}`);
  console.log(`Has photo: ${data.filter(p => p.photo_url).length}`);
  console.log('\nBreakdown by sport:');
  const sports = {};
  data.forEach(p => {
    sports[p.sport] = (sports[p.sport] || 0) + 1;
  });
  console.log(sports);
  console.log('\nAll players:');
  data.forEach((p, i) => {
    console.log(`${i+1}. Sport: ${p.sport}, Active: ${p.is_active}, Visible: ${p.is_visible_in_search}, Photo: ${!!p.photo_url}`);
  });
})
.catch(err => console.error('Error:', err));
