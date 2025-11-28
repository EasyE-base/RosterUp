import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup(userType, testEmail, testName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${userType.toUpperCase()} signup`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        // Step 1: Sign up the user
        console.log('Step 1: Creating auth user...');
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: 'test123456',
        });

        if (signUpError) {
            console.error('❌ Signup error:', signUpError);
            return { success: false, error: signUpError };
        }

        if (!authData.user) {
            console.error('❌ No user returned from signup');
            return { success: false, error: 'No user returned' };
        }

        console.log('✅ Auth user created:', authData.user.id);

        // Step 2: Check if profile was auto-created by trigger
        console.log('\nStep 2: Checking for auto-created profile...');
        const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (profileCheckError) {
            console.error('❌ Error checking profile:', profileCheckError);
        } else if (existingProfile) {
            console.log('✅ Profile auto-created by trigger:', existingProfile);
        } else {
            console.log('⚠️  No profile found - need to create manually');

            // Step 3: Create profile manually (like Signup.tsx does)
            console.log('\nStep 3: Creating profile manually...');
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: authData.user.id,
                email: testEmail,
                full_name: testName,
                user_type: userType,
            }, {
                onConflict: 'id'
            });

            if (profileError) {
                console.error('❌ Profile creation error:', profileError);
                return { success: false, error: profileError };
            }
            console.log('✅ Profile created manually');
        }

        // Step 4: Create role-specific record
        console.log(`\nStep 4: Creating ${userType}-specific record...`);

        if (userType === 'player') {
            const { error: playerError } = await supabase.from('player_profiles').upsert({
                user_id: authData.user.id,
                sport: 'Softball',
                recruiting_status: 'open',
                is_visible_in_search: true,
                is_active: true,
            }, {
                onConflict: 'user_id'
            });

            if (playerError) {
                console.error('❌ Player profile creation error:', playerError);
                return { success: false, error: playerError };
            }
            console.log('✅ Player profile created');

        } else if (userType === 'trainer') {
            const { error: trainerError } = await supabase.from('trainers').insert({
                user_id: authData.user.id,
            });

            if (trainerError) {
                console.error('❌ Trainer record creation error:', trainerError);
                return { success: false, error: trainerError };
            }
            console.log('✅ Trainer record created');

        } else if (userType === 'organization') {
            // Organization records are created in onboarding, not during signup
            console.log('ℹ️  Organization record created during onboarding (not now)');
        }

        console.log(`\n✅ ${userType.toUpperCase()} signup completed successfully!`);
        return { success: true, userId: authData.user.id };

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        return { success: false, error: err };
    }
}

async function runTests() {
    const timestamp = Date.now();

    console.log('🧪 SIGNUP FLOW TESTING\n');

    // Test 1: Organization
    const orgResult = await testSignup('organization', `org-test-${timestamp}@example.com`, 'Test Organization');

    // Test 2: Player  
    const playerResult = await testSignup('player', `player-test-${timestamp}@example.com`, 'Test Player');

    // Test 3: Trainer
    const trainerResult = await testSignup('trainer', `trainer-test-${timestamp}@example.com`, 'Test Trainer');

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`Organization: ${orgResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Player:       ${playerResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Trainer:      ${trainerResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`${'='.repeat(60)}\n`);

    // Exit with appropriate code
    const allPassed = orgResult.success && playerResult.success && trainerResult.success;
    process.exit(allPassed ? 0 : 1);
}

runTests();
