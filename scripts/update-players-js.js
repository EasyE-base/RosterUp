import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

const playersData = [
    {
        name: 'Emma Johnson',
        details: {
            photo_url: '/players/player1.jpg',
            bio: 'Power pitcher with a 45 mph fastball. Started playing at age 6, loves striking out batters and hitting home runs. Dream is to pitch in college.',
            position: ['Pitcher', 'First Base'],
            age_group: '10U',
            classification: 'A',
            location_city: 'Phoenix',
            location_state: 'Arizona',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Sophia Martinez',
        details: {
            photo_url: '/players/player2.jpg',
            bio: 'Quick-handed infielder with amazing reflexes. Known for making diving plays and turning double plays. Batting leadoff this season.',
            position: ['Shortstop', 'Second Base'],
            age_group: '10U',
            classification: 'B',
            location_city: 'Orlando',
            location_state: 'Florida',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Olivia Chen',
        details: {
            photo_url: '/players/player3.jpg',
            bio: 'Strong catcher with a cannon arm. Throws out 70% of base stealers. Also bats cleanup and drives in lots of runs. Leadership is her strength.',
            position: ['Catcher'],
            age_group: '12U',
            classification: 'A',
            location_city: 'Dallas',
            location_state: 'Texas',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Ava Thompson',
        details: {
            photo_url: '/players/player4.jpg',
            bio: 'Speedy outfielder who loves chasing down fly balls. Fast runner with a great attitude. Just moved up from coach pitch this year.',
            position: ['Outfield', 'Third Base'],
            age_group: '8U',
            classification: 'C',
            location_city: 'Seattle',
            location_state: 'Washington',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Isabella Garcia',
        details: {
            photo_url: '/players/player5.jpg',
            bio: 'Ace pitcher with a devastating changeup. 50 mph fastball and great control. Also plays centerfield when not pitching. Team captain.',
            position: ['Pitcher', 'Outfield'],
            age_group: '12U',
            classification: 'A',
            location_city: 'Atlanta',
            location_state: 'Georgia',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Mia Anderson',
        details: {
            photo_url: '/players/player6.jpg',
            bio: 'Power hitter who leads the team in home runs. Great glove at first base. Always encouraging teammates and brings positive energy.',
            position: ['First Base', 'Third Base'],
            age_group: '10U',
            classification: 'B',
            location_city: 'Denver',
            location_state: 'Colorado',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Charlotte Williams',
        details: {
            photo_url: '/players/player7.jpg',
            bio: 'Smart infielder with excellent footwork. Great at turning double plays and loves baseball. Practices every day in the backyard.',
            position: ['Second Base', 'Shortstop'],
            age_group: '10U',
            classification: 'C',
            location_city: 'Portland',
            location_state: 'Oregon',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Amelia Davis',
        details: {
            photo_url: '/players/player8.jpg',
            bio: 'Speedster in centerfield with great instincts. Covers tons of ground and tracks down every ball. Leadoff hitter with lots of stolen bases.',
            position: ['Outfield'],
            age_group: '12U',
            classification: 'B',
            location_city: 'Charlotte',
            location_state: 'North Carolina',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Harper Brown',
        details: {
            photo_url: '/players/player9.jpg',
            bio: 'Fearless third baseman who loves the hot corner. Starting to learn pitching this year. Always first to practice and last to leave.',
            position: ['Third Base', 'Pitcher'],
            age_group: '8U',
            classification: 'C',
            location_city: 'Nashville',
            location_state: 'Tennessee',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    },
    {
        name: 'Evelyn Miller',
        details: {
            photo_url: '/players/player10.jpg',
            bio: 'Elite shortstop with range and arm strength. Also pitches when needed. Committed to playing high school ball. Team MVP last season.',
            position: ['Shortstop', 'Pitcher'],
            age_group: '12U',
            classification: 'A',
            location_city: 'Raleigh',
            location_state: 'North Carolina',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true
        }
    }
];

async function updatePlayers() {
    console.log('Fetching players...');
    const { data: players, error } = await supabase
        .from('player_profiles')
        .select('id, user_id, created_at')
        .eq('sport', 'Softball')
        .order('created_at', { ascending: true })
        .limit(10);

    if (error) {
        console.error('Error fetching players:', error);
        return;
    }

    if (!players || players.length < 10) {
        console.warn(`Found only ${players ? players.length : 0} players. Expected at least 10.`);
        if (!players || players.length === 0) return;
    }

    console.log(`Found ${players.length} players. Updating...`);

    for (let i = 0; i < players.length; i++) {
        if (i >= playersData.length) break;

        const player = players[i];
        const updateData = playersData[i];

        console.log(`Updating player ${i + 1}: ${updateData.name} (ID: ${player.id})`);

        // Update profiles (name)
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ full_name: updateData.name })
            .eq('id', player.user_id);

        if (profileError) {
            console.error(`  Error updating profile for ${updateData.name}:`, profileError);
        } else {
            console.log(`  ✓ Profile name updated`);
        }

        // Update player_profiles (details)
        const { error: playerProfileError } = await supabase
            .from('player_profiles')
            .update({
                ...updateData.details,
                updated_at: new Date().toISOString()
            })
            .eq('id', player.id);

        if (playerProfileError) {
            console.error(`  Error updating player details for ${updateData.name}:`, playerProfileError);
        } else {
            console.log(`  ✓ Player details updated`);
        }
    }

    console.log('Update complete!');
}

updatePlayers();
