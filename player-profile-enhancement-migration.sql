-- Enhanced Player Profile System Migration
-- This migration adds tables for media, stats, achievements, recruiting, and analytics

-- 1. Player Media Table (photos, videos, documents)
CREATE TABLE IF NOT EXISTS player_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('photo', 'video', 'document')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  file_size BIGINT, -- in bytes
  mime_type VARCHAR(100),
  duration INTEGER, -- for videos, in seconds
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_player_media_player_id ON player_media(player_id);
CREATE INDEX idx_player_media_type ON player_media(media_type);
CREATE INDEX idx_player_media_featured ON player_media(is_featured) WHERE is_featured = true;

-- 2. Player Statistics Table (season and career stats)
CREATE TABLE IF NOT EXISTS player_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL, -- e.g., "2024", "Fall 2024"
  sport VARCHAR(50) NOT NULL,
  stats_data JSONB NOT NULL, -- Sport-specific stats stored as JSON
  games_played INTEGER DEFAULT 0,
  highlights TEXT,
  source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'gamechanger', 'imported'
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, season, sport)
);

CREATE INDEX idx_player_statistics_player_id ON player_statistics(player_id);
CREATE INDEX idx_player_statistics_season ON player_statistics(season);

-- 3. Player Achievements Table (awards, records, milestones)
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- 'award', 'record', 'milestone', 'championship'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_achieved DATE,
  image_url TEXT,
  organization VARCHAR(255), -- Who issued the award
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);
CREATE INDEX idx_player_achievements_type ON player_achievements(achievement_type);

-- 4. Player Physical Measurements Table (athletic metrics)
CREATE TABLE IF NOT EXISTS player_physical_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  measured_date DATE NOT NULL,
  height_inches INTEGER, -- Total height in inches
  weight_lbs DECIMAL(5,2), -- Weight in pounds
  wingspan_inches INTEGER,
  -- Speed/Agility
  forty_yard_dash DECIMAL(4,2), -- in seconds
  shuttle_run DECIMAL(4,2),
  three_cone_drill DECIMAL(4,2),
  sixty_yard_dash DECIMAL(4,2), -- Baseball specific
  -- Strength
  bench_press_max INTEGER, -- in pounds
  squat_max INTEGER,
  deadlift_max INTEGER,
  -- Jump
  vertical_jump DECIMAL(4,2), -- in inches
  broad_jump DECIMAL(5,2),
  -- Baseball/Softball specific
  exit_velocity DECIMAL(5,2), -- in mph
  throwing_velocity DECIMAL(5,2),
  -- Notes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_player_physical_player_id ON player_physical_measurements(player_id);
CREATE INDEX idx_player_physical_measured_date ON player_physical_measurements(measured_date DESC);

-- 5. Player Team History Table (teams, tournaments, classifications)
CREATE TABLE IF NOT EXISTS player_team_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  team_name VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255),
  season VARCHAR(20) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  division VARCHAR(100),
  classification VARCHAR(20), -- A, B, C, REC, ALL_STARS
  position_played VARCHAR(100),
  jersey_number INTEGER,
  -- Tournament/Season Results
  win_loss_record VARCHAR(20), -- e.g., "25-10"
  tournaments_attended INTEGER DEFAULT 0,
  tournament_results TEXT, -- Notable tournament finishes
  championships_won INTEGER DEFAULT 0,
  -- Dates
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_player_team_history_player_id ON player_team_history(player_id);
CREATE INDEX idx_player_team_history_season ON player_team_history(season DESC);
CREATE INDEX idx_player_team_history_current ON player_team_history(is_current) WHERE is_current = true;

-- 6. Coach Interests Table (recruiting tracking)
CREATE TABLE IF NOT EXISTS coach_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  coach_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  interest_type VARCHAR(50) NOT NULL, -- 'view', 'request_info', 'invite_camp', 'mark_prospect'
  message TEXT,
  contact_info TEXT, -- Coach's preferred contact method
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'contacted', 'in_process', 'closed'
  player_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coach_interests_player_id ON coach_interests(player_id);
CREATE INDEX idx_coach_interests_coach_id ON coach_interests(coach_user_id);
CREATE INDEX idx_coach_interests_org_id ON coach_interests(organization_id);
CREATE INDEX idx_coach_interests_status ON coach_interests(status);

-- 7. Profile Views Analytics Table
CREATE TABLE IF NOT EXISTS player_profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous
  viewer_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  viewer_type VARCHAR(20), -- 'coach', 'scout', 'anonymous'
  referrer TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  location_city VARCHAR(100),
  location_state VARCHAR(100),
  location_country VARCHAR(100),
  session_duration INTEGER, -- in seconds
  pages_viewed INTEGER DEFAULT 1,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profile_views_player_id ON player_profile_views(player_id);
CREATE INDEX idx_profile_views_viewer_id ON player_profile_views(viewer_user_id);
CREATE INDEX idx_profile_views_org_id ON player_profile_views(viewer_organization_id);
CREATE INDEX idx_profile_views_date ON player_profile_views(viewed_at DESC);

-- Update player_profiles table to add new fields
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50),
ADD COLUMN IF NOT EXISTS gpa DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS college_committed VARCHAR(255),
ADD COLUMN IF NOT EXISTS recruiting_status VARCHAR(50) DEFAULT 'open', -- 'open', 'committed', 'closed'
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS highlight_video_url TEXT;

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_player_media_updated_at BEFORE UPDATE ON player_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_statistics_updated_at BEFORE UPDATE ON player_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_achievements_updated_at BEFORE UPDATE ON player_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_physical_updated_at BEFORE UPDATE ON player_physical_measurements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_team_history_updated_at BEFORE UPDATE ON player_team_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_interests_updated_at BEFORE UPDATE ON coach_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE player_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_physical_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_team_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profile_views ENABLE ROW LEVEL SECURITY;

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

-- Coaches can view player data (read-only)
CREATE POLICY player_media_coaches_view ON player_media
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM organizations WHERE user_id = auth.uid()
  ));

CREATE POLICY player_statistics_coaches_view ON player_statistics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM organizations WHERE user_id = auth.uid()
  ));

CREATE POLICY player_achievements_coaches_view ON player_achievements
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM organizations WHERE user_id = auth.uid()
  ));

CREATE POLICY player_physical_coaches_view ON player_physical_measurements
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM organizations WHERE user_id = auth.uid()
  ));

CREATE POLICY player_team_history_coaches_view ON player_team_history
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM organizations WHERE user_id = auth.uid()
  ));

-- Coaches can create interests in players
CREATE POLICY coach_interests_coaches_create ON coach_interests
  FOR INSERT WITH CHECK (coach_user_id = auth.uid());

-- Coaches can view their own interests
CREATE POLICY coach_interests_coaches_view ON coach_interests
  FOR SELECT USING (coach_user_id = auth.uid());

-- Players can view interests in them
CREATE POLICY coach_interests_players_view ON coach_interests
  FOR SELECT USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

-- Players can update interests (respond to them)
CREATE POLICY coach_interests_players_update ON coach_interests
  FOR UPDATE USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

-- Profile views: Coaches can insert views
CREATE POLICY profile_views_coaches_insert ON player_profile_views
  FOR INSERT WITH CHECK (viewer_user_id = auth.uid() OR viewer_user_id IS NULL);

-- Players can view analytics about their profile
CREATE POLICY profile_views_players_view ON player_profile_views
  FOR SELECT USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));

-- Coaches can view their own viewing history
CREATE POLICY profile_views_coaches_view ON player_profile_views
  FOR SELECT USING (viewer_user_id = auth.uid());

-- Comments
COMMENT ON TABLE player_media IS 'Stores photos, videos, and documents uploaded by players';
COMMENT ON TABLE player_statistics IS 'Season and career statistics for players';
COMMENT ON TABLE player_achievements IS 'Awards, records, and milestones achieved by players';
COMMENT ON TABLE player_physical_measurements IS 'Athletic measurements and test results';
COMMENT ON TABLE player_team_history IS 'History of teams, tournaments, and seasons';
COMMENT ON TABLE coach_interests IS 'Tracks recruiting interest from coaches/organizations';
COMMENT ON TABLE player_profile_views IS 'Analytics tracking for profile views';
