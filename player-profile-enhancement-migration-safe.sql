-- Enhanced Player Profile System Migration (Safe/Idempotent Version)
-- This migration adds tables for media, stats, achievements, recruiting, and analytics

-- 1. Player Media Table
CREATE TABLE IF NOT EXISTS player_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('photo', 'video', 'document')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  duration INTEGER,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_player_media_player_id;
CREATE INDEX idx_player_media_player_id ON player_media(player_id);
DROP INDEX IF EXISTS idx_player_media_type;
CREATE INDEX idx_player_media_type ON player_media(media_type);
DROP INDEX IF EXISTS idx_player_media_featured;
CREATE INDEX idx_player_media_featured ON player_media(is_featured) WHERE is_featured = true;

-- 2. Player Statistics Table
CREATE TABLE IF NOT EXISTS player_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  stats_data JSONB NOT NULL,
  games_played INTEGER DEFAULT 0,
  highlights TEXT,
  source VARCHAR(50) DEFAULT 'manual',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'player_statistics_player_id_season_sport_key'
  ) THEN
    ALTER TABLE player_statistics ADD CONSTRAINT player_statistics_player_id_season_sport_key UNIQUE(player_id, season, sport);
  END IF;
END $$;

DROP INDEX IF EXISTS idx_player_statistics_player_id;
CREATE INDEX idx_player_statistics_player_id ON player_statistics(player_id);
DROP INDEX IF EXISTS idx_player_statistics_season;
CREATE INDEX idx_player_statistics_season ON player_statistics(season);

-- 3. Player Achievements Table
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_achieved DATE,
  image_url TEXT,
  organization VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_player_achievements_player_id;
CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);
DROP INDEX IF EXISTS idx_player_achievements_type;
CREATE INDEX idx_player_achievements_type ON player_achievements(achievement_type);

-- 4. Player Physical Measurements Table
CREATE TABLE IF NOT EXISTS player_physical_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  measured_date DATE NOT NULL,
  height_inches INTEGER,
  weight_lbs DECIMAL(5,2),
  wingspan_inches INTEGER,
  forty_yard_dash DECIMAL(4,2),
  shuttle_run DECIMAL(4,2),
  three_cone_drill DECIMAL(4,2),
  sixty_yard_dash DECIMAL(4,2),
  bench_press_max INTEGER,
  squat_max INTEGER,
  deadlift_max INTEGER,
  vertical_jump DECIMAL(4,2),
  broad_jump DECIMAL(5,2),
  exit_velocity DECIMAL(5,2),
  throwing_velocity DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_player_physical_player_id;
CREATE INDEX idx_player_physical_player_id ON player_physical_measurements(player_id);
DROP INDEX IF EXISTS idx_player_physical_measured_date;
CREATE INDEX idx_player_physical_measured_date ON player_physical_measurements(measured_date DESC);

-- 5. Player Team History Table
CREATE TABLE IF NOT EXISTS player_team_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  team_name VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255),
  season VARCHAR(20) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  division VARCHAR(100),
  classification VARCHAR(20),
  position_played VARCHAR(100),
  jersey_number INTEGER,
  win_loss_record VARCHAR(20),
  tournaments_attended INTEGER DEFAULT 0,
  tournament_results TEXT,
  championships_won INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_player_team_history_player_id;
CREATE INDEX idx_player_team_history_player_id ON player_team_history(player_id);
DROP INDEX IF EXISTS idx_player_team_history_season;
CREATE INDEX idx_player_team_history_season ON player_team_history(season DESC);
DROP INDEX IF EXISTS idx_player_team_history_current;
CREATE INDEX idx_player_team_history_current ON player_team_history(is_current) WHERE is_current = true;

-- 6. Coach Interests Table
CREATE TABLE IF NOT EXISTS coach_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  coach_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  interest_type VARCHAR(50) NOT NULL,
  message TEXT,
  contact_info TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  player_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_coach_interests_player_id;
CREATE INDEX idx_coach_interests_player_id ON coach_interests(player_id);
DROP INDEX IF EXISTS idx_coach_interests_coach_id;
CREATE INDEX idx_coach_interests_coach_id ON coach_interests(coach_user_id);
DROP INDEX IF EXISTS idx_coach_interests_org_id;
CREATE INDEX idx_coach_interests_org_id ON coach_interests(organization_id);
DROP INDEX IF EXISTS idx_coach_interests_status;
CREATE INDEX idx_coach_interests_status ON coach_interests(status);

-- 7. Profile Views Analytics Table
CREATE TABLE IF NOT EXISTS player_profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewer_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  viewer_type VARCHAR(20),
  referrer TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  location_city VARCHAR(100),
  location_state VARCHAR(100),
  location_country VARCHAR(100),
  session_duration INTEGER,
  pages_viewed INTEGER DEFAULT 1,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_profile_views_player_id;
CREATE INDEX idx_profile_views_player_id ON player_profile_views(player_id);
DROP INDEX IF EXISTS idx_profile_views_viewer_id;
CREATE INDEX idx_profile_views_viewer_id ON player_profile_views(viewer_user_id);
DROP INDEX IF EXISTS idx_profile_views_org_id;
CREATE INDEX idx_profile_views_org_id ON player_profile_views(viewer_organization_id);
DROP INDEX IF EXISTS idx_profile_views_date;
CREATE INDEX idx_profile_views_date ON player_profile_views(viewed_at DESC);

-- 8. Player Contact Requests Table
CREATE TABLE IF NOT EXISTS player_contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_contact_requests_player_id;
CREATE INDEX idx_contact_requests_player_id ON player_contact_requests(player_id);
DROP INDEX IF EXISTS idx_contact_requests_org_id;
CREATE INDEX idx_contact_requests_org_id ON player_contact_requests(organization_id);
DROP INDEX IF EXISTS idx_contact_requests_status;
CREATE INDEX idx_contact_requests_status ON player_contact_requests(status);

-- Update player_profiles table to add new fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'academic_year') THEN
    ALTER TABLE player_profiles ADD COLUMN academic_year VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'gpa') THEN
    ALTER TABLE player_profiles ADD COLUMN gpa DECIMAL(3,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'graduation_year') THEN
    ALTER TABLE player_profiles ADD COLUMN graduation_year INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'college_committed') THEN
    ALTER TABLE player_profiles ADD COLUMN college_committed VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'recruiting_status') THEN
    ALTER TABLE player_profiles ADD COLUMN recruiting_status VARCHAR(50) DEFAULT 'open';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'preferred_contact_method') THEN
    ALTER TABLE player_profiles ADD COLUMN preferred_contact_method VARCHAR(50) DEFAULT 'email';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'parent_phone') THEN
    ALTER TABLE player_profiles ADD COLUMN parent_phone VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'highlight_video_url') THEN
    ALTER TABLE player_profiles ADD COLUMN highlight_video_url TEXT;
  END IF;
END $$;

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_player_media_updated_at ON player_media;
CREATE TRIGGER update_player_media_updated_at BEFORE UPDATE ON player_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_statistics_updated_at ON player_statistics;
CREATE TRIGGER update_player_statistics_updated_at BEFORE UPDATE ON player_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_achievements_updated_at ON player_achievements;
CREATE TRIGGER update_player_achievements_updated_at BEFORE UPDATE ON player_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_physical_updated_at ON player_physical_measurements;
CREATE TRIGGER update_player_physical_updated_at BEFORE UPDATE ON player_physical_measurements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_team_history_updated_at ON player_team_history;
CREATE TRIGGER update_player_team_history_updated_at BEFORE UPDATE ON player_team_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_interests_updated_at ON coach_interests;
CREATE TRIGGER update_coach_interests_updated_at BEFORE UPDATE ON coach_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_requests_updated_at ON player_contact_requests;
CREATE TRIGGER update_contact_requests_updated_at BEFORE UPDATE ON player_contact_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE player_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_physical_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_team_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_contact_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS player_media_owner ON player_media;
DROP POLICY IF EXISTS player_statistics_owner ON player_statistics;
DROP POLICY IF EXISTS player_achievements_owner ON player_achievements;
DROP POLICY IF EXISTS player_physical_owner ON player_physical_measurements;
DROP POLICY IF EXISTS player_team_history_owner ON player_team_history;
DROP POLICY IF EXISTS player_media_coaches_view ON player_media;
DROP POLICY IF EXISTS player_statistics_coaches_view ON player_statistics;
DROP POLICY IF EXISTS player_achievements_coaches_view ON player_achievements;
DROP POLICY IF EXISTS player_physical_coaches_view ON player_physical_measurements;
DROP POLICY IF EXISTS player_team_history_coaches_view ON player_team_history;
DROP POLICY IF EXISTS coach_interests_coaches_create ON coach_interests;
DROP POLICY IF EXISTS coach_interests_coaches_view ON coach_interests;
DROP POLICY IF EXISTS coach_interests_players_view ON coach_interests;
DROP POLICY IF EXISTS coach_interests_players_update ON coach_interests;
DROP POLICY IF EXISTS profile_views_coaches_insert ON player_profile_views;
DROP POLICY IF EXISTS profile_views_players_view ON player_profile_views;
DROP POLICY IF EXISTS profile_views_coaches_view ON player_profile_views;
DROP POLICY IF EXISTS contact_requests_coaches_create ON player_contact_requests;
DROP POLICY IF EXISTS contact_requests_players_view ON player_contact_requests;

-- Create policies

-- Players can manage their own data
CREATE POLICY player_media_owner ON player_media
  FOR ALL USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

CREATE POLICY player_statistics_owner ON player_statistics
  FOR ALL USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

CREATE POLICY player_achievements_owner ON player_achievements
  FOR ALL USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

CREATE POLICY player_physical_owner ON player_physical_measurements
  FOR ALL USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

CREATE POLICY player_team_history_owner ON player_team_history
  FOR ALL USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

-- Coaches can view player data
CREATE POLICY player_media_coaches_view ON player_media
  FOR SELECT USING (EXISTS (SELECT 1 FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY player_statistics_coaches_view ON player_statistics
  FOR SELECT USING (EXISTS (SELECT 1 FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY player_achievements_coaches_view ON player_achievements
  FOR SELECT USING (EXISTS (SELECT 1 FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY player_physical_coaches_view ON player_physical_measurements
  FOR SELECT USING (EXISTS (SELECT 1 FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY player_team_history_coaches_view ON player_team_history
  FOR SELECT USING (EXISTS (SELECT 1 FROM organizations WHERE user_id = auth.uid()));

-- Coach interests policies
CREATE POLICY coach_interests_coaches_create ON coach_interests
  FOR INSERT WITH CHECK (coach_user_id = auth.uid());

CREATE POLICY coach_interests_coaches_view ON coach_interests
  FOR SELECT USING (coach_user_id = auth.uid());

CREATE POLICY coach_interests_players_view ON coach_interests
  FOR SELECT USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

CREATE POLICY coach_interests_players_update ON coach_interests
  FOR UPDATE USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

-- Profile views policies
CREATE POLICY profile_views_coaches_insert ON player_profile_views
  FOR INSERT WITH CHECK (viewer_user_id = auth.uid() OR viewer_user_id IS NULL);

CREATE POLICY profile_views_players_view ON player_profile_views
  FOR SELECT USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

CREATE POLICY profile_views_coaches_view ON player_profile_views
  FOR SELECT USING (viewer_user_id = auth.uid());

-- Contact requests policies
CREATE POLICY contact_requests_coaches_create ON player_contact_requests
  FOR INSERT WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY contact_requests_players_view ON player_contact_requests
  FOR SELECT USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));
