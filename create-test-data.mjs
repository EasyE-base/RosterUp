import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestData() {
  console.log('🔍 Checking existing data...\n');

  try {
    // Check for organizations
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, user_id')
      .limit(5);

    if (orgError) throw orgError;

    console.log(`📊 Organizations: ${orgs?.length || 0}`);
    if (orgs && orgs.length > 0) {
      orgs.forEach((org, i) => {
        console.log(`   ${i + 1}. ${org.name} (User ID: ${org.user_id})`);
      });
    }
    console.log('');

    // Check for tournaments
    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, title, organization_id, status, organizations(name)')
      .limit(5);

    if (tError) throw tError;

    console.log(`🏆 Tournaments: ${tournaments?.length || 0}`);
    if (tournaments && tournaments.length > 0) {
      tournaments.forEach((t, i) => {
        console.log(`   ${i + 1}. "${t.title}" - Status: ${t.status}`);
        console.log(`      Org: ${t.organizations?.name || 'No Organization'}`);
        console.log(`      ID: ${t.id}`);
      });
    }
    console.log('');

    // Check for player profiles
    const { data: players, error: pError } = await supabase
      .from('player_profiles')
      .select('id, user_id, sport, age_group')
      .limit(5);

    if (pError) throw pError;

    console.log(`👥 Player Profiles: ${players?.length || 0}`);
    if (players && players.length > 0) {
      players.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.sport} - ${p.age_group} (User ID: ${p.user_id})`);
      });
    }
    console.log('');

    // Check for teams
    const { data: teams, error: teamError } = await supabase
      .from('teams')
      .select('id, name, sport, age_group, organization_id')
      .limit(5);

    if (teamError) throw teamError;

    console.log(`🏀 Teams: ${teams?.length || 0}`);
    if (teams && teams.length > 0) {
      teams.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name} (${t.sport} - ${t.age_group})`);
        console.log(`      Org ID: ${t.organization_id}`);
      });
    }
    console.log('');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 What we need for testing:');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (!orgs || orgs.length === 0) {
      console.log('❌ No organizations found');
      console.log('   → Create an organization account in the app');
    } else {
      console.log('✅ Organizations exist');
    }

    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No tournaments found');
      console.log('   → Create a tournament in the app');
    } else {
      const tournamentsWithOrgs = tournaments.filter(t => t.organization_id);
      if (tournamentsWithOrgs.length === 0) {
        console.log('⚠️  Tournaments exist but none have organizations');
        console.log('   → Create a tournament as an organization owner');
      } else {
        console.log('✅ Tournaments with organizations exist');
      }
    }

    if (!players || players.length === 0) {
      console.log('❌ No player profiles found');
      console.log('   → Create a player account in the app');
    } else {
      console.log('✅ Player profiles exist');
    }

    if (!teams || teams.length === 0) {
      console.log('❌ No teams found');
      console.log('   → Create a team in the app');
    } else {
      console.log('✅ Teams exist');
    }

    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Make sure you have both an organization account and a player account');
    console.log('   2. As organization: Create a tournament');
    console.log('   3. As organization: Create a team');
    console.log('   4. Then run: node test-guest-player-complete.mjs');
    console.log('');

  } catch (err) {
    console.error('❌ Error:', err);
    console.error('Details:', err.message);
  }
}

createTestData();
