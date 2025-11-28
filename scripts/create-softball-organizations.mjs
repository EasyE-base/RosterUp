import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5OTM1MSwiZXhwIjoyMDc1Nzc1MzUxfQ.vU3r17Jz0rBvjfVfq4P2JYfM3h-SYYCMVjJW6rFCOCI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ORGANIZATIONS_DATA = [
  {
    name: 'Diamond Elite Softball',
    city: 'Atlanta',
    state: 'Georgia',
    description: 'Premier competitive softball organization in the Southeast',
    website: 'https://diamondelite.com',
    teams: [
      { name: 'Diamond Elite 10U', age_group: '10U', gender: 'Female' },
      { name: 'Diamond Elite 12U', age_group: '12U', gender: 'Female' },
      { name: 'Diamond Elite 14U', age_group: '14U', gender: 'Female' },
    ],
  },
  {
    name: 'Thunder Fastpitch',
    city: 'Nashville',
    state: 'Tennessee',
    description: 'Developing future collegiate softball players',
    website: 'https://thunderfastpitch.com',
    teams: [
      { name: 'Thunder 12U Gold', age_group: '12U', gender: 'Female' },
      { name: 'Thunder 14U Gold', age_group: '14U', gender: 'Female' },
      { name: 'Thunder 16U Gold', age_group: '16U', gender: 'Female' },
    ],
  },
  {
    name: 'Lady Lightning Softball',
    city: 'Charlotte',
    state: 'North Carolina',
    description: 'Championship softball program with proven track record',
    website: 'https://ladylightning.com',
    teams: [
      { name: 'Lady Lightning 10U', age_group: '10U', gender: 'Female' },
      { name: 'Lady Lightning 14U', age_group: '14U', gender: 'Female' },
      { name: 'Lady Lightning 18U', age_group: '18U', gender: 'Female' },
    ],
  },
  {
    name: 'Carolina Crush Fastpitch',
    city: 'Raleigh',
    state: 'North Carolina',
    description: 'Elite travel softball organization',
    website: 'https://carolinacrush.com',
    teams: [
      { name: 'Crush 12U Elite', age_group: '12U', gender: 'Female' },
      { name: 'Crush 14U Elite', age_group: '14U', gender: 'Female' },
    ],
  },
  {
    name: 'Firecrackers Softball',
    city: 'Birmingham',
    state: 'Alabama',
    description: 'National softball program with multiple teams',
    website: 'https://firecrackersoftball.com',
    teams: [
      { name: 'Firecrackers 10U', age_group: '10U', gender: 'Female' },
      { name: 'Firecrackers 12U', age_group: '12U', gender: 'Female' },
      { name: 'Firecrackers 16U', age_group: '16U', gender: 'Female' },
    ],
  },
  {
    name: 'Aces Fastpitch',
    city: 'Memphis',
    state: 'Tennessee',
    description: 'Building champions on and off the field',
    website: 'https://acesfastpitch.com',
    teams: [
      { name: 'Aces 12U', age_group: '12U', gender: 'Female' },
      { name: 'Aces 14U', age_group: '14U', gender: 'Female' },
    ],
  },
  {
    name: 'Southern Storm Softball',
    city: 'Greenville',
    state: 'South Carolina',
    description: 'Competitive fastpitch softball organization',
    website: 'https://southernstorm.com',
    teams: [
      { name: 'Storm 10U', age_group: '10U', gender: 'Female' },
      { name: 'Storm 12U', age_group: '12U', gender: 'Female' },
      { name: 'Storm 14U', age_group: '14U', gender: 'Female' },
    ],
  },
  {
    name: 'Gator Fastpitch',
    city: 'Jacksonville',
    state: 'Florida',
    description: 'Florida\'s premier fastpitch organization',
    website: 'https://gatorfastpitch.com',
    teams: [
      { name: 'Gator 12U Gold', age_group: '12U', gender: 'Female' },
      { name: 'Gator 14U Gold', age_group: '14U', gender: 'Female' },
      { name: 'Gator 16U Gold', age_group: '16U', gender: 'Female' },
    ],
  },
  {
    name: 'Batbusters Softball',
    city: 'Miami',
    state: 'Florida',
    description: 'National powerhouse softball program',
    website: 'https://batbusters.com',
    teams: [
      { name: 'Batbusters 10U', age_group: '10U', gender: 'Female' },
      { name: 'Batbusters 14U', age_group: '14U', gender: 'Female' },
      { name: 'Batbusters 18U', age_group: '18U', gender: 'Female' },
    ],
  },
  {
    name: 'Gold Coast Hurricanes',
    city: 'Tampa',
    state: 'Florida',
    description: 'Elite competitive softball with college prep focus',
    website: 'https://goldcoasthurricanes.com',
    teams: [
      { name: 'Hurricanes 12U', age_group: '12U', gender: 'Female' },
      { name: 'Hurricanes 14U', age_group: '14U', gender: 'Female' },
      { name: 'Hurricanes 16U', age_group: '16U', gender: 'Female' },
    ],
  },
];

async function createOrganizations() {
  console.log('🏆 Creating 10 Softball Organizations...\n');

  for (let i = 0; i < ORGANIZATIONS_DATA.length; i++) {
    const orgData = ORGANIZATIONS_DATA[i];
    const email = `${orgData.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
    const password = 'TestPass123!';

    try {
      console.log(`📋 ${i + 1}. Creating ${orgData.name}...`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`   ❌ Auth error: ${authError.message}`);
        continue;
      }

      const userId = authData.user.id;
      console.log(`   ✅ User created: ${email}`);

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        email,
        user_type: 'organization',
        full_name: orgData.name,
      });

      if (profileError) {
        console.error(`   ❌ Profile error: ${profileError.message}`);
        continue;
      }
      console.log(`   ✅ Profile created`);

      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          user_id: userId,
          name: orgData.name,
          description: orgData.description,
          website: orgData.website,
          city: orgData.city,
          state: orgData.state,
          country: 'USA',
          location: `${orgData.city}, ${orgData.state}`,
          logo_url: null, // Will update with actual logos later
        })
        .select()
        .single();

      if (orgError) {
        console.error(`   ❌ Organization error: ${orgError.message}`);
        continue;
      }
      console.log(`   ✅ Organization created`);

      // Create teams
      for (const teamData of orgData.teams) {
        const { error: teamError } = await supabase.from('teams').insert({
          organization_id: organization.id,
          name: teamData.name,
          sport: 'Softball',
          age_group: teamData.age_group,
          gender: teamData.gender,
          description: `Competitive ${teamData.age_group} fastpitch softball team`,
          season: 'Spring 2025',
          roster_limit: 15,
          is_active: true,
        });

        if (teamError) {
          console.error(`   ❌ Team error: ${teamError.message}`);
        } else {
          console.log(`   ✅ Team created: ${teamData.name}`);
        }
      }

      console.log('');
    } catch (err) {
      console.error(`   ❌ Unexpected error: ${err.message}\n`);
    }
  }

  console.log('\n✅ Organization creation complete!');
  console.log('\n📊 Summary:');
  console.log('   - 10 organizations created');
  console.log('   - ~28 teams created');
  console.log('   - All accounts use password: TestPass123!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run update-organization-logos.mjs to add logo URLs');
  console.log('   2. Verify organizations on frontend');
}

createOrganizations();
