import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTournamentsWithGuestPlayers() {
  console.log('🔍 Checking tournaments and guest players...\n');

  try {
    // Get all guest players
    const { data: guestPlayers, error: gpError } = await supabase
      .from('guest_players')
      .select('*');

    if (gpError) {
      console.error('❌ Error fetching guest players:', gpError);
      return;
    }

    console.log(`📊 Total Guest Player Applications: ${guestPlayers?.length || 0}\n`);

    if (guestPlayers && guestPlayers.length > 0) {
      guestPlayers.forEach((gp, i) => {
        console.log(`${i + 1}. Guest Player Application:`);
        console.log(`   ID: ${gp.id}`);
        console.log(`   Tournament ID: ${gp.tournament_id}`);
        console.log(`   Player ID: ${gp.player_id}`);
        console.log(`   Status: ${gp.status}`);
        console.log(`   Created: ${new Date(gp.created_at).toLocaleString()}`);
        console.log('');
      });

      // For each unique tournament, get tournament info
      const tournamentIds = [...new Set(guestPlayers.map(gp => gp.tournament_id))];

      console.log(`\n🏆 Tournaments with Guest Player Applications:\n`);

      for (const tournamentId of tournamentIds) {
        const { data: tournament, error: tError } = await supabase
          .from('tournaments')
          .select('id, title, organization_id')
          .eq('id', tournamentId)
          .maybeSingle();

        if (!tError && tournament) {
          const guestCount = guestPlayers.filter(gp => gp.tournament_id === tournamentId).length;
          console.log(`📍 ${tournament.title}`);
          console.log(`   Tournament ID: ${tournament.id}`);
          console.log(`   Organization ID: ${tournament.organization_id || 'None'}`);
          console.log(`   Guest Players: ${guestCount}`);
          console.log(`   URL: http://localhost:5173/tournaments/${tournament.id}/guest-players`);
          console.log('');
        }
      }
    } else {
      console.log('ℹ️  No guest player applications found.');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

listTournamentsWithGuestPlayers();
