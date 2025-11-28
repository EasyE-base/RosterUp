-- Create 10 Softball Organizations with Teams
-- Run this in Supabase Dashboard > SQL Editor
-- This script creates auth users, profiles, organizations, and teams

-- Enable the pgcrypto extension if not already enabled (for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_org_data record;
  v_team_data record;
BEGIN

  -- Organization 1: Diamond Elite Softball
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'diamondelitesoftball@example.com',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Diamond Elite Softball"}'
  ) RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'diamondelitesoftball@example.com', 'organization', 'Diamond Elite Softball');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (
    v_user_id,
    'Diamond Elite Softball',
    'Premier competitive softball organization in the Southeast',
    'https://diamondelite.com',
    'Atlanta',
    'Georgia',
    'USA',
    'Atlanta, Georgia'
  ) RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Diamond Elite 10U', 'Softball', '10U', 'Female', 'Competitive 10U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Diamond Elite 12U', 'Softball', '12U', 'Female', 'Competitive 12U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Diamond Elite 14U', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 2: Thunder Fastpitch
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'thunderfastpitch@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Thunder Fastpitch"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'thunderfastpitch@example.com', 'organization', 'Thunder Fastpitch');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Thunder Fastpitch', 'Developing future collegiate softball players', 'https://thunderfastpitch.com',
    'Nashville', 'Tennessee', 'USA', 'Nashville, Tennessee')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Thunder 12U Gold', 'Softball', '12U', 'Female', 'Competitive 12U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Thunder 14U Gold', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Thunder 16U Gold', 'Softball', '16U', 'Female', 'Competitive 16U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 3: Lady Lightning Softball
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'ladylightningsoftball@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Lady Lightning Softball"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'ladylightningsoftball@example.com', 'organization', 'Lady Lightning Softball');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Lady Lightning Softball', 'Championship softball program with proven track record', 'https://ladylightning.com',
    'Charlotte', 'North Carolina', 'USA', 'Charlotte, North Carolina')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Lady Lightning 10U', 'Softball', '10U', 'Female', 'Competitive 10U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Lady Lightning 14U', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Lady Lightning 18U', 'Softball', '18U', 'Female', 'Competitive 18U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 4: Carolina Crush Fastpitch
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'carolinacrushfastpitch@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Carolina Crush Fastpitch"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'carolinacrushfastpitch@example.com', 'organization', 'Carolina Crush Fastpitch');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Carolina Crush Fastpitch', 'Elite travel softball organization', 'https://carolinacrush.com',
    'Raleigh', 'North Carolina', 'USA', 'Raleigh, North Carolina')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Crush 12U Elite', 'Softball', '12U', 'Female', 'Competitive 12U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Crush 14U Elite', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 5: Firecrackers Softball
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'firecrackerssoftball@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Firecrackers Softball"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'firecrackerssoftball@example.com', 'organization', 'Firecrackers Softball');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Firecrackers Softball', 'National softball program with multiple teams', 'https://firecrackersoftball.com',
    'Birmingham', 'Alabama', 'USA', 'Birmingham, Alabama')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Firecrackers 10U', 'Softball', '10U', 'Female', 'Competitive 10U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Firecrackers 12U', 'Softball', '12U', 'Female', 'Competitive 12U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Firecrackers 16U', 'Softball', '16U', 'Female', 'Competitive 16U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 6: Aces Fastpitch
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'acesfastpitch@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Aces Fastpitch"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'acesfastpitch@example.com', 'organization', 'Aces Fastpitch');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Aces Fastpitch', 'Building champions on and off the field', 'https://acesfastpitch.com',
    'Memphis', 'Tennessee', 'USA', 'Memphis, Tennessee')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Aces 12U', 'Softball', '12U', 'Female', 'Competitive 12U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Aces 14U', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 7: Southern Storm Softball
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'southernstormsoftball@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Southern Storm Softball"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'southernstormsoftball@example.com', 'organization', 'Southern Storm Softball');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Southern Storm Softball', 'Competitive fastpitch softball organization', 'https://southernstorm.com',
    'Greenville', 'South Carolina', 'USA', 'Greenville, South Carolina')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Storm 10U', 'Softball', '10U', 'Female', 'Competitive 10U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Storm 12U', 'Softball', '12U', 'Female', 'Competitive 12U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Storm 14U', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 8: Gator Fastpitch
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'gatorfastpitch@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Gator Fastpitch"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'gatorfastpitch@example.com', 'organization', 'Gator Fastpitch');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Gator Fastpitch', 'Florida\'s premier fastpitch organization', 'https://gatorfastpitch.com',
    'Jacksonville', 'Florida', 'USA', 'Jacksonville, Florida')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Gator 12U Gold', 'Softball', '12U', 'Female', 'Competitive 12U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Gator 14U Gold', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Gator 16U Gold', 'Softball', '16U', 'Female', 'Competitive 16U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 9: Batbusters Softball
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'batbusterssoftball@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Batbusters Softball"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'batbusterssoftball@example.com', 'organization', 'Batbusters Softball');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Batbusters Softball', 'National powerhouse softball program', 'https://batbusters.com',
    'Miami', 'Florida', 'USA', 'Miami, Florida')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Batbusters 10U', 'Softball', '10U', 'Female', 'Competitive 10U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Batbusters 14U', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Batbusters 18U', 'Softball', '18U', 'Female', 'Competitive 18U fastpitch softball team', 'Spring 2025', 15, true);

  -- Organization 10: Gold Coast Hurricanes
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'goldcoasthurricanes@example.com',
    crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '',
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Gold Coast Hurricanes"}')
  RETURNING id INTO v_user_id;

  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES (v_user_id, 'goldcoasthurricanes@example.com', 'organization', 'Gold Coast Hurricanes');

  INSERT INTO organizations (user_id, name, description, website, city, state, country, location)
  VALUES (v_user_id, 'Gold Coast Hurricanes', 'Elite competitive softball with college prep focus', 'https://goldcoasthurricanes.com',
    'Tampa', 'Florida', 'USA', 'Tampa, Florida')
  RETURNING id INTO v_org_id;

  INSERT INTO teams (organization_id, name, sport, age_group, gender, description, season, roster_limit, is_active)
  VALUES
    (v_org_id, 'Hurricanes 12U', 'Softball', '12U', 'Female', 'Competitive 12U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Hurricanes 14U', 'Softball', '14U', 'Female', 'Competitive 14U fastpitch softball team', 'Spring 2025', 15, true),
    (v_org_id, 'Hurricanes 16U', 'Softball', '16U', 'Female', 'Competitive 16U fastpitch softball team', 'Spring 2025', 15, true);

  RAISE NOTICE '✅ Successfully created 10 softball organizations with ~28 teams';
  RAISE NOTICE 'All accounts use password: TestPass123!';

END $$;

-- Verify creation
SELECT
  o.name as organization_name,
  o.city,
  o.state,
  COUNT(t.id) as team_count
FROM organizations o
LEFT JOIN teams t ON t.organization_id = o.id
WHERE o.name LIKE '%Elite%'
   OR o.name LIKE '%Thunder%'
   OR o.name LIKE '%Lightning%'
   OR o.name LIKE '%Crush%'
   OR o.name LIKE '%Firecrackers%'
   OR o.name LIKE '%Aces%'
   OR o.name LIKE '%Storm%'
   OR o.name LIKE '%Gator%'
   OR o.name LIKE '%Batbusters%'
   OR o.name LIKE '%Hurricanes%'
GROUP BY o.id, o.name, o.city, o.state
ORDER BY o.name;
