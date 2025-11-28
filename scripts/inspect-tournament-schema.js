
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectSchema() {
    console.log('🔍 Inspecting tournaments table schema...\n');

    try {
        // 1. Find ANY existing organization
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .limit(1);

        if (orgError || !orgs || orgs.length === 0) {
            console.error('❌ No organizations found. Cannot proceed with tests.');
            if (orgError) console.error('   Error:', orgError.message);
            return;
        }

        const orgId = orgs[0].id;
        console.log(`✅ Found Organization: ${orgs[0].name} (${orgId})`);

        // 2. Try inserting with "setup-test-data" schema (suspected correct)
        console.log('\nAttempting insert with "setup-test-data" schema (location, max_teams, tournament_type)...');
        const payload1 = {
            organization_id: orgId,
            title: 'Schema Test Tournament 1',
            description: 'Test description',
            start_date: '2025-08-01',
            end_date: '2025-08-03',
            location: 'Test Location', // Old schema?
            max_teams: 8, // Old schema?
            entry_fee: 100,
            status: 'draft',
            tournament_type: 'elimination', // Old schema?
            age_group: '12U',
            sanctioning_body: 'Test Body'
        };

        const { data: data1, error: error1 } = await supabase
            .from('tournaments')
            .insert(payload1)
            .select();

        if (error1) {
            console.log('❌ Insert 1 failed:', error1.message);
        } else {
            console.log('✅ Insert 1 SUCCESS!');
            console.log('   Keys returned:', Object.keys(data1[0]).join(', '));
            return; // Found the correct schema
        }

        // 3. Try inserting with "TournamentCreate.tsx" schema (suspected incorrect)
        console.log('\nAttempting insert with "TournamentCreate.tsx" schema (location_name, max_participants, format_type)...');
        const payload2 = {
            organization_id: orgId,
            title: 'Schema Test Tournament 2',
            description: 'Test description',
            start_date: '2025-08-01',
            end_date: '2025-08-03',
            registration_deadline: '2025-07-01',
            location_name: 'Test Venue',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            country: 'USA',
            latitude: 0,
            longitude: 0,
            max_participants: 16,
            format_type: 'single_elimination',
            entry_fee: 100,
            status: 'draft',
            // event_website: 'http://test.com' // Leaving this out for now to test core fields
        };

        const { data: data2, error: error2 } = await supabase
            .from('tournaments')
            .insert(payload2)
            .select();

        if (error2) {
            console.log('❌ Insert 2 failed:', error2.message);
        } else {
            console.log('✅ Insert 2 SUCCESS!');
            console.log('   Keys returned:', Object.keys(data2[0]).join(', '));
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

inspectSchema();
