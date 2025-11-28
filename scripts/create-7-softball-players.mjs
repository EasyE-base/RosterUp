import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, anonKey);

const players = [
  {
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@example.com',
    age_group: '16U',
    classification: 'A',
    position: ['Pitcher', 'First Base'],
    city: 'Austin',
    state: 'TX',
    bio: 'Experienced pitcher with strong batting average. Looking to join a competitive travel team for the upcoming season.',
    photo: 'https://i.pravatar.cc/400?img=5'
  },
  {
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    age_group: '14U',
    classification: 'B',
    position: ['Catcher', 'Outfield'],
    city: 'San Diego',
    state: 'CA',
    bio: 'Dedicated catcher with excellent game awareness. Team captain for my high school team.',
    photo: 'https://i.pravatar.cc/400?img=9'
  },
  {
    name: 'Olivia Thompson',
    email: 'olivia.thompson@example.com',
    age_group: '18U',
    classification: 'A',
    position: ['Shortstop', 'Second Base'],
    city: 'Atlanta',
    state: 'GA',
    bio: 'Fast and agile infielder committed to playing at the collegiate level. Strong leadership skills.',
    photo: 'https://i.pravatar.cc/400?img=10'
  },
  {
    name: 'Ava Martinez',
    email: 'ava.martinez@example.com',
    age_group: '16U',
    classification: 'C',
    position: ['Outfield'],
    city: 'Phoenix',
    state: 'AZ',
    bio: 'Speed and power hitter looking for opportunities to showcase my skills in tournaments.',
    photo: 'https://i.pravatar.cc/400?img=20'
  },
  {
    name: 'Isabella Garcia',
    email: 'isabella.garcia@example.com',
    age_group: '12U',
    classification: 'B',
    position: ['Third Base', 'Pitcher'],
    city: 'Dallas',
    state: 'TX',
    bio: 'Young athlete with natural talent and a passion for the game. Eager to learn and grow.',
    photo: 'https://i.pravatar.cc/400?img=23'
  },
  {
    name: 'Mia Wilson',
    email: 'mia.wilson@example.com',
    age_group: '14U',
    classification: 'A',
    position: ['First Base', 'Outfield'],
    city: 'Seattle',
    state: 'WA',
    bio: 'Strong hitter with consistent performance. Looking for a team that values teamwork and dedication.',
    photo: 'https://i.pravatar.cc/400?img=24'
  },
  {
    name: 'Charlotte Davis',
    email: 'charlotte.davis@example.com',
    age_group: '18U',
    classification: 'B',
    position: ['Second Base', 'Shortstop'],
    city: 'Denver',
    state: 'CO',
    bio: 'Versatile infielder with quick reflexes. Team player with a winning attitude.',
    photo: 'https://i.pravatar.cc/400?img=25'
  }
];

async function createPlayers() {
  console.log('Creating 7 softball player profiles...\n');

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const timestamp = Date.now() + i;
    const email = `softball${timestamp}@example.com`;
    const password = 'TestPass123!';

    console.log(`${i + 1}. Creating ${player.name}...`);

    try {
      // 1. Create auth user using regular signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password
      });

      if (authError) {
        console.error(`   ❌ Auth error: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        console.error(`   ❌ No user returned`);
        continue;
      }

      console.log(`   ✓ Auth user created: ${authData.user.id}`);

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: email,
          full_name: player.name,
          user_type: 'player'
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error(`   ❌ Profile error: ${profileError.message}`);
        continue;
      }

      console.log(`   ✓ Profile created`);

      // 3. Create player_profile
      const { error: playerError } = await supabase
        .from('player_profiles')
        .upsert({
          user_id: authData.user.id,
          sport: 'Softball',
          age_group: player.age_group,
          classification: player.classification,
          position: player.position,
          location_city: player.city,
          location_state: player.state,
          bio: player.bio,
          photo_url: player.photo,
          recruiting_status: 'open',
          is_visible_in_search: true,
          is_active: true
        }, {
          onConflict: 'user_id'
        });

      if (playerError) {
        console.error(`   ❌ Player profile error: ${playerError.message}`);
        continue;
      }

      console.log(`   ✓ Player profile created`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Password: ${password}`);

      // Sign out so we can create the next user
      await supabase.auth.signOut();
      console.log('');

    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  console.log('\n✅ Done! Created 7 softball player profiles.');
  console.log('\nYou should now see 10 total players at http://localhost:5174/players');
}

createPlayers();
