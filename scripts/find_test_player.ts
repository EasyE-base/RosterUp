
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTestPlayer() {
    // Query profiles table which contains email
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', '%test%');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log('Found profiles matching "test":');
    for (const p of profiles) {
        console.log(`User ID: ${p.id}, Email: ${p.email}, Name: ${p.full_name}, Type: ${p.user_type}`);

        // Check if they have a player record
        const { data: player } = await supabase
            .from('players')
            .select('id')
            .eq('user_id', p.id)
            .single();

        if (player) {
            console.log(`  -> Linked Player ID: ${player.id}`);
        }
    }

    // Also check player_profiles just in case
    const { data: playerProfiles, error: profileError } = await supabase
        .from('player_profiles')
        .select('*');

    if (profileError) {
        console.log("Error fetching player_profiles", profileError)
    } else {
        console.log(`Total player_profiles: ${playerProfiles?.length || 0}`);
    }
}

findTestPlayer();
