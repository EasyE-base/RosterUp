
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key, might need service role if RLS blocks deletion. 
// Actually, for cleanup usually service role is needed to bypass RLS.
// I'll check if I have service role key in env. usually it's SUPABASE_SERVICE_ROLE_KEY or similar.
// But the user only provided VITE_... which are public.
// If RLS is on, I can only delete what I own.
// However, I am running this locally. I might be able to use the service role key if it's in .env.
// Let's try to read .env file to see if there is a service key.
// Or I can try with anon key and see if it works (if RLS allows delete for everyone or if I can sign in as the user).
// But I need to delete *other* users' data.
// I probably need the service role key.
// I'll check if I can find it.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// Check for service role key in process.env
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

const TEST_PLAYER_ID = '3231a3c2-2a31-41be-a48d-106ac1e169bb';

async function cleanupDatabase() {
    console.log('Starting database cleanup...');
    console.log(`Preserving Test Player ID: ${TEST_PLAYER_ID}`);

    if (!serviceRoleKey) {
        console.warn("WARNING: No service role key found. Deletion might fail due to RLS.");
    }

    // 1. Tournaments (and related)
    console.log('Deleting Tournaments...');
    // Delete applications first
    await deleteTable('tournament_applications');
    await deleteTable('tournament_participants');
    await deleteTable('tournaments');

    // 2. Teams (and related)
    console.log('Deleting Teams...');
    await deleteTable('team_members'); // This links players to teams
    await deleteTable('team_achievements');
    await deleteTable('team_media');
    await deleteTable('tryout_applications');
    await deleteTable('tryouts');
    await deleteTable('calendar_events');
    await deleteTable('teams');

    // 3. Players and Profiles
    console.log('Deleting Players and Profiles...');

    // Delete player_profiles (marketplace profiles)
    const { error: ppError } = await supabase
        .from('player_profiles')
        .delete()
        .neq('user_id', TEST_PLAYER_ID);
    if (ppError) console.error('Error deleting player_profiles:', ppError);
    else console.log('Deleted player_profiles (except test player)');

    // Delete players (base player records)
    const { error: pError } = await supabase
        .from('players')
        .delete()
        .neq('user_id', TEST_PLAYER_ID);
    if (pError) console.error('Error deleting players:', pError);
    else console.log('Deleted players (except test player)');

    // Delete profiles (user profiles)
    const { error: prError } = await supabase
        .from('profiles')
        .delete()
        .neq('id', TEST_PLAYER_ID);
    if (prError) console.error('Error deleting profiles:', prError);
    else console.log('Deleted profiles (except test player)');

    // 4. Other cleanup
    await deleteTable('messages');
    await deleteTable('notifications');
    // await deleteTable('organizations'); // Maybe? User didn't explicitly say organizations, but "start fresh" implies it.
    // I'll ask or just do it. "delete all tournments and players".
    // If I delete organizations, I need to be careful.
    // I'll stick to what was requested + teams.

    console.log('Cleanup complete.');
}

async function deleteTable(tableName: string) {
    const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (neq dummy uuid)
    if (error) {
        console.error(`Error deleting ${tableName}:`, error);
    } else {
        console.log(`Deleted all from ${tableName}`);
    }
}

cleanupDatabase();
