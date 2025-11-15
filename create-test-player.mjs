import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestPlayer() {
  try {
    console.log('Creating test player account...');

    // Sign up with regular auth flow
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'testplayer@rosterup.com',
      password: 'TestPlayer123!',
      options: {
        data: {
          role: 'player',
          full_name: 'Test Player'
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Sign in to get a session
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'testplayer@rosterup.com',
      password: 'TestPlayer123!'
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }

    console.log('✅ Signed in successfully');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'testplayer@rosterup.com',
        role: 'player',
        full_name: 'Test Player'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Don't return, might already exist from trigger
    } else {
      console.log('✅ Profile created');
    }

    // Create player profile
    const { data: playerProfile, error: playerError } = await supabase
      .from('player_profiles')
      .insert({
        user_id: authData.user.id,
        first_name: 'Test',
        last_name: 'Player',
        date_of_birth: '2008-01-15',
        sport: 'Baseball',
        primary_position: 'Pitcher',
        secondary_positions: ['First Base'],
        grad_year: 2026,
        academic_year: 'Sophomore',
        gpa: 3.8,
        graduation_year: 2026,
        recruiting_status: 'open',
        preferred_contact_method: 'email',
        bio: 'Test player profile for system testing. This is a demo account to showcase the enhanced recruiting features.',
        phone: '(555) 123-4567',
        location: 'Los Angeles, CA',
        school: 'Test High School'
      })
      .select()
      .single();

    if (playerError) {
      console.error('Player profile error:', playerError);
      return;
    }

    console.log('✅ Player profile created:', playerProfile.id);

    console.log('\n🎉 Test player account created successfully!');
    console.log('\n📧 Email: testplayer@rosterup.com');
    console.log('🔑 Password: TestPlayer123!');
    console.log('🆔 User ID:', authData.user.id);
    console.log('👤 Player Profile ID:', playerProfile.id);

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestPlayer();
