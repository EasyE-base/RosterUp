-- Migration: Add 30 Softball Entities (10 Orgs, 10 Players, 10 Trainers)
-- Description: Inserts users, profiles, and entity-specific data with softball themes and images.
-- Fixes: Handles duplicate key errors in profiles table caused by auth triggers.

DO $$
DECLARE
    -- IDs for Organizations
    org_id_1 uuid := gen_random_uuid();
    org_id_2 uuid := gen_random_uuid();
    org_id_3 uuid := gen_random_uuid();
    org_id_4 uuid := gen_random_uuid();
    org_id_5 uuid := gen_random_uuid();
    org_id_6 uuid := gen_random_uuid();
    org_id_7 uuid := gen_random_uuid();
    org_id_8 uuid := gen_random_uuid();
    org_id_9 uuid := gen_random_uuid();
    org_id_10 uuid := gen_random_uuid();

    -- IDs for Players
    player_id_1 uuid := gen_random_uuid();
    player_id_2 uuid := gen_random_uuid();
    player_id_3 uuid := gen_random_uuid();
    player_id_4 uuid := gen_random_uuid();
    player_id_5 uuid := gen_random_uuid();
    player_id_6 uuid := gen_random_uuid();
    player_id_7 uuid := gen_random_uuid();
    player_id_8 uuid := gen_random_uuid();
    player_id_9 uuid := gen_random_uuid();
    player_id_10 uuid := gen_random_uuid();

    -- IDs for Trainers
    trainer_id_1 uuid := gen_random_uuid();
    trainer_id_2 uuid := gen_random_uuid();
    trainer_id_3 uuid := gen_random_uuid();
    trainer_id_4 uuid := gen_random_uuid();
    trainer_id_5 uuid := gen_random_uuid();
    trainer_id_6 uuid := gen_random_uuid();
    trainer_id_7 uuid := gen_random_uuid();
    trainer_id_8 uuid := gen_random_uuid();
    trainer_id_9 uuid := gen_random_uuid();
    trainer_id_10 uuid := gen_random_uuid();

BEGIN
    -- ORGANIZATIONS
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data) VALUES
    (org_id_1, 'org1@example.com', 'dummy_hash', now(), '{"full_name": "Vipers Softball"}'),
    (org_id_2, 'org2@example.com', 'dummy_hash', now(), '{"full_name": "Storm Elite"}'),
    (org_id_3, 'org3@example.com', 'dummy_hash', now(), '{"full_name": "Heat Fastpitch"}'),
    (org_id_4, 'org4@example.com', 'dummy_hash', now(), '{"full_name": "Nightmare Softball"}'),
    (org_id_5, 'org5@example.com', 'dummy_hash', now(), '{"full_name": "Thunder Cats"}'),
    (org_id_6, 'org6@example.com', 'dummy_hash', now(), '{"full_name": "Lady Hawks"}'),
    (org_id_7, 'org7@example.com', 'dummy_hash', now(), '{"full_name": "Diamond Divas"}'),
    (org_id_8, 'org8@example.com', 'dummy_hash', now(), '{"full_name": "Velocity"}'),
    (org_id_9, 'org9@example.com', 'dummy_hash', now(), '{"full_name": "Impact Gold"}'),
    (org_id_10, 'org10@example.com', 'dummy_hash', now(), '{"full_name": "Glory"}');

    -- Use ON CONFLICT to handle profiles created by triggers
    INSERT INTO public.profiles (id, email, full_name, user_type) VALUES
    (org_id_1, 'org1@example.com', 'Vipers Softball', 'organization'),
    (org_id_2, 'org2@example.com', 'Storm Elite', 'organization'),
    (org_id_3, 'org3@example.com', 'Heat Fastpitch', 'organization'),
    (org_id_4, 'org4@example.com', 'Nightmare Softball', 'organization'),
    (org_id_5, 'org5@example.com', 'Thunder Cats', 'organization'),
    (org_id_6, 'org6@example.com', 'Lady Hawks', 'organization'),
    (org_id_7, 'org7@example.com', 'Diamond Divas', 'organization'),
    (org_id_8, 'org8@example.com', 'Velocity', 'organization'),
    (org_id_9, 'org9@example.com', 'Impact Gold', 'organization'),
    (org_id_10, 'org10@example.com', 'Glory', 'organization')
    ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type;

    INSERT INTO public.organizations (user_id, name, description, logo_url, city, state, primary_sport) VALUES
    (org_id_1, 'Vipers Softball', 'Elite travel softball organization developing college-ready athletes.', '/images/softball/vipers_logo.png', 'Austin', 'TX', 'Softball'),
    (org_id_2, 'Storm Elite', 'Championship winning tradition. Hard work beats talent.', '/images/softball/storm_logo.png', 'San Diego', 'CA', 'Softball'),
    (org_id_3, 'Heat Fastpitch', 'Bringing the heat every inning. Premier coaching staff.', '/images/softball/heat_logo.png', 'Miami', 'FL', 'Softball'),
    (org_id_4, 'Nightmare Softball', 'Your worst nightmare on the field. Aggressive baserunning and solid defense.', '/images/softball/nightmare_logo.png', 'Cherry Hill', 'NJ', 'Softball'),
    (org_id_5, 'Thunder Cats', 'Loud bats and big plays. Join the Thunder.', '/images/softball/vipers_logo.png', 'Atlanta', 'GA', 'Softball'),
    (org_id_6, 'Lady Hawks', 'Soaring above the competition. Focus on fundamentals.', '/images/softball/storm_logo.png', 'Chicago', 'IL', 'Softball'),
    (org_id_7, 'Diamond Divas', 'Sparkling on the diamond. Empowerment through sports.', '/images/softball/heat_logo.png', 'Las Vegas', 'NV', 'Softball'),
    (org_id_8, 'Velocity', 'Speed kills. High performance training.', '/images/softball/nightmare_logo.png', 'Phoenix', 'AZ', 'Softball'),
    (org_id_9, 'Impact Gold', 'Making an impact on and off the field.', '/images/softball/vipers_logo.png', 'Houston', 'TX', 'Softball'),
    (org_id_10, 'Glory', 'For the love of the game. National recognition.', '/images/softball/storm_logo.png', 'Fairfax', 'VA', 'Softball');


    -- PLAYERS
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data) VALUES
    (player_id_1, 'player1@example.com', 'dummy_hash', now(), '{"full_name": "Sarah Jenkins"}'),
    (player_id_2, 'player2@example.com', 'dummy_hash', now(), '{"full_name": "Maya Rodriguez"}'),
    (player_id_3, 'player3@example.com', 'dummy_hash', now(), '{"full_name": "Emily Chen"}'),
    (player_id_4, 'player4@example.com', 'dummy_hash', now(), '{"full_name": "Jessica Williams"}'),
    (player_id_5, 'player5@example.com', 'dummy_hash', now(), '{"full_name": "Ashley Johnson"}'),
    (player_id_6, 'player6@example.com', 'dummy_hash', now(), '{"full_name": "Taylor Smith"}'),
    (player_id_7, 'player7@example.com', 'dummy_hash', now(), '{"full_name": "Jordan Davis"}'),
    (player_id_8, 'player8@example.com', 'dummy_hash', now(), '{"full_name": "Morgan Wilson"}'),
    (player_id_9, 'player9@example.com', 'dummy_hash', now(), '{"full_name": "Samantha Brown"}'),
    (player_id_10, 'player10@example.com', 'dummy_hash', now(), '{"full_name": "Kylie Jones"}');

    INSERT INTO public.profiles (id, email, full_name, user_type) VALUES
    (player_id_1, 'player1@example.com', 'Sarah Jenkins', 'player'),
    (player_id_2, 'player2@example.com', 'Maya Rodriguez', 'player'),
    (player_id_3, 'player3@example.com', 'Emily Chen', 'player'),
    (player_id_4, 'player4@example.com', 'Jessica Williams', 'player'),
    (player_id_5, 'player5@example.com', 'Ashley Johnson', 'player'),
    (player_id_6, 'player6@example.com', 'Taylor Smith', 'player'),
    (player_id_7, 'player7@example.com', 'Jordan Davis', 'player'),
    (player_id_8, 'player8@example.com', 'Morgan Wilson', 'player'),
    (player_id_9, 'player9@example.com', 'Samantha Brown', 'player'),
    (player_id_10, 'player10@example.com', 'Kylie Jones', 'player')
    ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type;

    INSERT INTO public.player_profiles (user_id, primary_sport, primary_position, bio, location_city, location_state, photo_url, age, height, weight) VALUES
    (player_id_1, 'Softball', 'Pitcher', 'Class of 2026. Dominant circle presence with 65mph fastball.', 'Austin', 'TX', '/images/softball/player_pitcher.png', 16, '5''8"', '145'),
    (player_id_2, 'Softball', 'Catcher', 'Elite framing and pop time. Leader behind the plate.', 'San Diego', 'CA', '/images/softball/player_catcher.png', 17, '5''6"', '150'),
    (player_id_3, 'Softball', 'Shortstop', 'Range for days. High OBP slapper.', 'Miami', 'FL', '/images/softball/player_batter.png', 15, '5''4"', '125'),
    (player_id_4, 'Softball', 'Outfield', 'Tracking fly balls is my specialty. Big bat.', 'Cherry Hill', 'NJ', '/images/softball/player_waves.png', 16, '5''7"', '140'),
    (player_id_5, 'Softball', 'First Base', 'Nothing gets by me. Power hitter cleanup spot.', 'Atlanta', 'GA', '/images/softball/player_bw.jpg', 17, '5''9"', '160'),
    (player_id_6, 'Softball', 'Pitcher', 'Spin rate specialist. Rise ball is my strikeout pitch.', 'Chicago', 'IL', '/images/softball/player_pitcher.png', 15, '5''7"', '135'),
    (player_id_7, 'Softball', 'Third Base', 'Hot corner lockdown. Reaction time is key.', 'Las Vegas', 'NV', '/images/softball/player_batter.png', 16, '5''6"', '145'),
    (player_id_8, 'Softball', 'Second Base', 'Quick hands and double play partner.', 'Phoenix', 'AZ', '/images/softball/player_catcher.png', 14, '5''3"', '120'),
    (player_id_9, 'Softball', 'Outfield', 'Speed demon on the bases and in the grass.', 'Houston', 'TX', '/images/softball/player_waves.png', 17, '5''5"', '130'),
    (player_id_10, 'Softball', 'Utility', 'Put me anywhere coach. I just want to play.', 'Fairfax', 'VA', '/images/softball/player_bw.jpg', 15, '5''6"', '135');


    -- TRAINERS
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data) VALUES
    (trainer_id_1, 'trainer1@example.com', 'dummy_hash', now(), '{"full_name": "Coach Mike"}'),
    (trainer_id_2, 'trainer2@example.com', 'dummy_hash', now(), '{"full_name": "Coach Lisa"}'),
    (trainer_id_3, 'trainer3@example.com', 'dummy_hash', now(), '{"full_name": "Coach Dave"}'),
    (trainer_id_4, 'trainer4@example.com', 'dummy_hash', now(), '{"full_name": "Coach Sarah"}'),
    (trainer_id_5, 'trainer5@example.com', 'dummy_hash', now(), '{"full_name": "Coach Tom"}'),
    (trainer_id_6, 'trainer6@example.com', 'dummy_hash', now(), '{"full_name": "Coach Jen"}'),
    (trainer_id_7, 'trainer7@example.com', 'dummy_hash', now(), '{"full_name": "Coach Rob"}'),
    (trainer_id_8, 'trainer8@example.com', 'dummy_hash', now(), '{"full_name": "Coach Amanda"}'),
    (trainer_id_9, 'trainer9@example.com', 'dummy_hash', now(), '{"full_name": "Coach Steve"}'),
    (trainer_id_10, 'trainer10@example.com', 'dummy_hash', now(), '{"full_name": "Coach Kelly"}');

    INSERT INTO public.profiles (id, email, full_name, user_type) VALUES
    (trainer_id_1, 'trainer1@example.com', 'Coach Mike', 'trainer'),
    (trainer_id_2, 'trainer2@example.com', 'Coach Lisa', 'trainer'),
    (trainer_id_3, 'trainer3@example.com', 'Coach Dave', 'trainer'),
    (trainer_id_4, 'trainer4@example.com', 'Coach Sarah', 'trainer'),
    (trainer_id_5, 'trainer5@example.com', 'Coach Tom', 'trainer'),
    (trainer_id_6, 'trainer6@example.com', 'Coach Jen', 'trainer'),
    (trainer_id_7, 'trainer7@example.com', 'Coach Rob', 'trainer'),
    (trainer_id_8, 'trainer8@example.com', 'Coach Amanda', 'trainer'),
    (trainer_id_9, 'trainer9@example.com', 'Coach Steve', 'trainer'),
    (trainer_id_10, 'trainer10@example.com', 'Coach Kelly', 'trainer')
    ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type;

    INSERT INTO public.trainers (user_id, bio, tagline, headshot_url, sports, specializations, travel_radius_miles, rating, total_reviews) VALUES
    (trainer_id_1, 'Former D1 Baseball player turned Softball hitting instructor. 15 years experience.', 'Unlock your power.', '/images/softball/trainer_coach_2.png', '{"Softball", "Baseball"}', '{"Hitting", "Power"}', 25, 4.9, 120),
    (trainer_id_2, 'Olympic Gold Medalist. Pitching specialist focusing on mechanics and mental game.', 'Pitch perfect.', '/images/softball/trainer_coach_1.png', '{"Softball"}', '{"Pitching", "Mental Game"}', 50, 5.0, 200),
    (trainer_id_3, 'Strength and conditioning coach for elite athletes. Get faster, stronger, better.', 'Build the engine.', '/images/softball/trainer_coach_2.png', '{"Softball", "All Sports"}', '{"Strength", "Conditioning"}', 15, 4.8, 85),
    (trainer_id_4, 'Defensive guru. Infield and outfield mechanics. Glove work is art.', 'Defense wins championships.', '/images/softball/trainer_coach_1.png', '{"Softball"}', '{"Defense", "Fielding"}', 30, 4.7, 95),
    (trainer_id_5, 'Catching specialist. Blocking, framing, and throwing mechanics.', 'The wall behind the plate.', '/images/softball/trainer_coach_2.png', '{"Softball", "Baseball"}', '{"Catching"}', 20, 4.9, 110),
    (trainer_id_6, 'Slapping and speed coach. Learn the short game.', 'Speed never slumps.', '/images/softball/trainer_coach_1.png', '{"Softball"}', '{"Slapping", "Baserunning"}', 40, 4.8, 75),
    (trainer_id_7, 'Recruiting consultant. I help you get signed.', 'Your path to college.', '/images/softball/trainer_coach_2.png', '{"Softball"}', '{"Recruiting"}', 100, 5.0, 50),
    (trainer_id_8, 'Mental performance coach. Overcome the yips and pressure.', 'Mind over matter.', '/images/softball/trainer_coach_1.png', '{"Softball", "All Sports"}', '{"Mental Performance"}', 0, 4.9, 60),
    (trainer_id_9, 'Team strategy and situational hitting.', 'Know the game.', '/images/softball/trainer_coach_2.png', '{"Softball"}', '{"Strategy", "IQ"}', 35, 4.6, 40),
    (trainer_id_10, 'Youth development specialist. Fundamentals first.', 'Start strong.', '/images/softball/trainer_coach_1.png', '{"Softball"}', '{"Youth", "Fundamentals"}', 10, 4.9, 150);

END $$;
