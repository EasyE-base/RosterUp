import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
    process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// 10 realistic youth softball player profiles
const PLAYER_DATA = [
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4109.JPG',
        imageFilename: 'player1.jpg',
        name: 'Emma Johnson',
        age: 10,
        ageGroup: '10U',
        position: ['Pitcher', 'First Base'],
        classification: 'A',
        city: 'Phoenix',
        state: 'Arizona',
        bio: 'Power pitcher with a 45 mph fastball. Started playing at age 6, loves striking out batters and hitting home runs. Dream is to pitch in college.',
        height: '4\'8"',
        weight: '85 lbs',
        battingAvg: '.425',
        era: '2.15'
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4110.JPG',
        imageFilename: 'player2.jpg',
        name: 'Sophia Martinez',
        age: 9,
        ageGroup: '10U',
        position: ['Shortstop', 'Second Base'],
        classification: 'B',
        city: 'Orlando',
        state: 'Florida',
        bio: 'Quick-handed infielder with amazing reflexes. Known for making diving plays and turning double plays. Batting leadoff this season.',
        height: '4\'6"',
        weight: '75 lbs',
        battingAvg: '.380',
        era: null
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4111.JPG',
        imageFilename: 'player3.jpg',
        name: 'Olivia Chen',
        age: 11,
        ageGroup: '12U',
        position: ['Catcher'],
        classification: 'A',
        city: 'Dallas',
        state: 'Texas',
        bio: 'Strong catcher with a cannon arm. Throws out 70% of base stealers. Also bats cleanup and drives in lots of runs. Leadership is her strength.',
        height: '5\'0"',
        weight: '95 lbs',
        battingAvg: '.405',
        era: null
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4112.JPG',
        imageFilename: 'player4.jpg',
        name: 'Ava Thompson',
        age: 8,
        ageGroup: '8U',
        position: ['Outfield', 'Third Base'],
        classification: 'C',
        city: 'Seattle',
        state: 'Washington',
        bio: 'Speedy outfielder who loves chasing down fly balls. Fast runner with a great attitude. Just moved up from coach pitch this year.',
        height: '4\'3"',
        weight: '65 lbs',
        battingAvg: '.315',
        era: null
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4113.JPG',
        imageFilename: 'player5.jpg',
        name: 'Isabella Garcia',
        age: 12,
        ageGroup: '12U',
        position: ['Pitcher', 'Outfield'],
        classification: 'A',
        city: 'Atlanta',
        state: 'Georgia',
        bio: 'Ace pitcher with a devastating changeup. 50 mph fastball and great control. Also plays centerfield when not pitching. Team captain.',
        height: '5\'3"',
        weight: '105 lbs',
        battingAvg: '.395',
        era: '1.85'
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4114.JPG',
        imageFilename: 'player6.jpg',
        name: 'Mia Anderson',
        age: 10,
        ageGroup: '10U',
        position: ['First Base', 'Third Base'],
        classification: 'B',
        city: 'Denver',
        state: 'Colorado',
        bio: 'Power hitter who leads the team in home runs. Great glove at first base. Always encouraging teammates and brings positive energy.',
        height: '4\'9"',
        weight: '88 lbs',
        battingAvg: '.410',
        era: null
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4115.JPG',
        imageFilename: 'player7.jpg',
        name: 'Charlotte Williams',
        age: 9,
        ageGroup: '10U',
        position: ['Second Base', 'Shortstop'],
        classification: 'C',
        city: 'Portland',
        state: 'Oregon',
        bio: 'Smart infielder with excellent footwork. Great at turning double plays and loves baseball. Practices every day in the backyard.',
        height: '4\'5"',
        weight: '72 lbs',
        battingAvg: '.340',
        era: null
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4116.JPG',
        imageFilename: 'player8.jpg',
        name: 'Amelia Davis',
        age: 11,
        ageGroup: '12U',
        position: ['Outfield'],
        classification: 'B',
        city: 'Charlotte',
        state: 'North Carolina',
        bio: 'Speedster in centerfield with great instincts. Covers tons of ground and tracks down every ball. Leadoff hitter with lots of stolen bases.',
        height: '5\'1"',
        weight: '92 lbs',
        battingAvg: '.368',
        era: null
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4117.JPG',
        imageFilename: 'player9.jpg',
        name: 'Harper Brown',
        age: 8,
        ageGroup: '8U',
        position: ['Third Base', 'Pitcher'],
        classification: 'C',
        city: 'Nashville',
        state: 'Tennessee',
        bio: 'Fearless third baseman who loves the hot corner. Starting to learn pitching this year. Always first to practice and last to leave.',
        height: '4\'2"',
        weight: '68 lbs',
        battingAvg: '.325',
        era: '4.50'
    },
    {
        imagePath: '/Users/erictrovarelli/Downloads/IMG_4118.JPG',
        imageFilename: 'player10.jpg',
        name: 'Evelyn Miller',
        age: 12,
        ageGroup: '12U',
        position: ['Shortstop', 'Pitcher'],
        classification: 'A',
        city: 'Raleigh',
        state: 'North Carolina',
        bio: 'Elite shortstop with range and arm strength. Also pitches when needed. Committed to playing high school ball. Team MVP last season.',
        height: '5\'4"',
        weight: '110 lbs',
        battingAvg: '.430',
        era: '2.40'
    }
];

async function copyImagesToPublic() {
    console.log('\n📂 Step 1: Copying images to public folder...');

    const publicDir = path.join(process.cwd(), 'public', 'players');

    // Create directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log('✅ Created /public/players directory');
    }

    const copiedImages: string[] = [];

    for (const player of PLAYER_DATA) {
        try {
            const destPath = path.join(publicDir, player.imageFilename);
            fs.copyFileSync(player.imagePath, destPath);
            copiedImages.push(`/players/${player.imageFilename}`);
            console.log(`✅ Copied ${player.imageFilename}`);
        } catch (err) {
            console.error(`❌ Error copying ${player.imagePath}:`, err);
            copiedImages.push(null);
        }
    }

    return copiedImages;
}

async function getExistingPlayers() {
    console.log('\n👥 Step 2: Fetching existing softball players...');

    const { data: players, error } = await supabase
        .from('player_profiles')
        .select('id, user_id, profiles(full_name, email)')
        .eq('sport', 'Softball')
        .limit(10);

    if (error) {
        console.error('❌ Error fetching players:', error);
        return [];
    }

    if (!players || players.length === 0) {
        console.error('❌ No existing softball players found in database');
        return [];
    }

    console.log(`✅ Found ${players.length} existing softball players`);
    return players;
}

async function updatePlayerProfile(
    playerId: string,
    userId: string,
    playerData: typeof PLAYER_DATA[0],
    photoUrl: string
) {
    // Update profiles table (name)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: playerData.name })
        .eq('id', userId);

    if (profileError) {
        console.error(`❌ Error updating profile for ${playerData.name}:`, profileError);
        return false;
    }

    // Update player_profiles table (all fields)
    const { error: playerError } = await supabase
        .from('player_profiles')
        .update({
            photo_url: photoUrl,
            bio: playerData.bio,
            position: playerData.position,
            age_group: playerData.ageGroup,
            classification: playerData.classification,
            location_city: playerData.city,
            location_state: playerData.state,
            sport: 'Softball',
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', playerId);

    if (playerError) {
        console.error(`❌ Error updating player_profile for ${playerData.name}:`, playerError);
        return false;
    }

    console.log(`✅ Updated ${playerData.name}`);
    return true;
}

async function main() {
    console.log('🏐 Starting Softball Player Profile Updates\n');
    console.log('='.repeat(50));

    // Step 1: Copy images to public folder
    const imageUrls = await copyImagesToPublic();

    // Check if all copies succeeded
    const failedCopies = imageUrls.filter(url => url === null).length;
    if (failedCopies > 0) {
        console.error(`\n⚠️  Warning: ${failedCopies} images failed to copy`);
    }

    // Step 2: Get existing players
    const existingPlayers = await getExistingPlayers();

    if (existingPlayers.length < 10) {
        console.error(`\n❌ Expected 10 players but found ${existingPlayers.length}`);
        process.exit(1);
    }

    // Step 3: Update player profiles
    console.log('\n✏️  Step 3: Updating player profiles in database...');

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < 10; i++) {
        const existingPlayer = existingPlayers[i];
        const newData = PLAYER_DATA[i];
        const photoUrl = imageUrls[i];

        if (!photoUrl) {
            console.error(`⚠️  Skipping ${newData.name} - image copy failed`);
            failureCount++;
            continue;
        }

        const success = await updatePlayerProfile(
            existingPlayer.id,
            existingPlayer.user_id,
            newData,
            photoUrl
        );

        if (success) {
            successCount++;
        } else {
            failureCount++;
        }

        // Small delay between updates
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Update Summary:');
    console.log(`   ✅ Successful: ${successCount}/10`);
    console.log(`   ❌ Failed: ${failureCount}/10`);

    if (successCount === 10) {
        console.log('\n🎉 All player profiles updated successfully!');
        console.log('\n🔗 View players at: http://localhost:5175/players');
        console.log('📁 Images stored in: /public/players/');
    } else if (successCount > 0) {
        console.log('\n⚠️  Some profiles updated successfully, but errors occurred');
    } else {
        console.log('\n❌ Update failed - no profiles were updated');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
