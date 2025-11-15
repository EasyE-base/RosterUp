-- Player Marketplace MVP Schema
-- Phase 1: Basic player profiles, search, and contact flow

-- Create player_profiles table
CREATE TABLE IF NOT EXISTS player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Basic Info
  sport TEXT NOT NULL,
  age_group TEXT, -- e.g., "10U", "12U", "14U", "16U", "18U"
  classification TEXT, -- A, B, C, REC, ALL_STARS
  position TEXT, -- Position/role in sport
  bio TEXT,

  -- Location
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'USA',

  -- Media
  photo_url TEXT,

  -- Metadata
  profile_completeness INTEGER DEFAULT 0, -- 0-100 percentage
  profile_views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_visible_in_search BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id),
  CHECK (profile_completeness >= 0 AND profile_completeness <= 100)
);

-- Add comments
COMMENT ON TABLE player_profiles IS 'Player marketplace profiles for talent discovery';
COMMENT ON COLUMN player_profiles.classification IS 'Team classification level from tournament system (A/B/C/REC/ALL_STARS)';
COMMENT ON COLUMN player_profiles.profile_completeness IS 'Calculated percentage of profile completion (0-100)';
COMMENT ON COLUMN player_profiles.is_visible_in_search IS 'Whether profile appears in marketplace search results';

-- Create player_contact_requests table
CREATE TABLE IF NOT EXISTS player_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Request details
  message TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'responded', 'expired')),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE player_contact_requests IS 'Contact requests from organizations to players';
COMMENT ON COLUMN player_contact_requests.status IS 'pending: not viewed, viewed: player saw it, responded: player replied, expired: past expiration date';

-- Create search_analytics table for tracking searches and engagement
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Search details
  search_filters JSONB, -- Store filters used: sport, age_group, classification, location
  result_count INTEGER,

  -- Engagement
  clicked_player_id UUID REFERENCES player_profiles(id) ON DELETE SET NULL,
  contact_initiated BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE search_analytics IS 'Analytics for marketplace search behavior and engagement';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_profiles_user_id ON player_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_player_profiles_sport ON player_profiles(sport);
CREATE INDEX IF NOT EXISTS idx_player_profiles_age_group ON player_profiles(age_group);
CREATE INDEX IF NOT EXISTS idx_player_profiles_classification ON player_profiles(classification);
CREATE INDEX IF NOT EXISTS idx_player_profiles_location ON player_profiles(location_state, location_city);
CREATE INDEX IF NOT EXISTS idx_player_profiles_active_search ON player_profiles(is_active, is_visible_in_search) WHERE is_active = true AND is_visible_in_search = true;
CREATE INDEX IF NOT EXISTS idx_player_profiles_created_at ON player_profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_requests_player_id ON player_contact_requests(player_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_org_id ON player_contact_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON player_contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON player_contact_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_analytics_org_id ON search_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_player_id ON search_analytics(clicked_player_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at DESC);

-- Create full-text search index on bio
CREATE INDEX IF NOT EXISTS idx_player_profiles_bio_search ON player_profiles USING GIN(to_tsvector('english', COALESCE(bio, '')));

-- Add RLS (Row Level Security) policies
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Players can create and update their own profile
CREATE POLICY "Players can create own profile"
ON player_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update own profile"
ON player_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Players can view own profile"
ON player_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Organizations can search/view active player profiles
CREATE POLICY "Organizations can search players"
ON player_profiles FOR SELECT
USING (
  is_active = true
  AND is_visible_in_search = true
  AND EXISTS (
    SELECT 1 FROM organizations
    WHERE user_id = auth.uid()
  )
);

-- Players can view contact requests sent to them
CREATE POLICY "Players can view their contact requests"
ON player_contact_requests FOR SELECT
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Players can update their contact requests"
ON player_contact_requests FOR UPDATE
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Organizations can create contact requests
CREATE POLICY "Organizations can create contact requests"
ON player_contact_requests FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE user_id = auth.uid()
  )
);

-- Organizations can view their own contact requests
CREATE POLICY "Organizations can view their contact requests"
ON player_contact_requests FOR SELECT
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE user_id = auth.uid()
  )
);

-- Search analytics policies
CREATE POLICY "Organizations can create search analytics"
ON search_analytics FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organizations can view their search analytics"
ON search_analytics FOR SELECT
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE user_id = auth.uid()
  )
);

-- Function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_player_profile_completeness(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completeness INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile FROM player_profiles WHERE id = profile_id;

  -- Basic info (10 points each, 60 total)
  IF profile.sport IS NOT NULL AND profile.sport != '' THEN completeness := completeness + 10; END IF;
  IF profile.age_group IS NOT NULL AND profile.age_group != '' THEN completeness := completeness + 10; END IF;
  IF profile.classification IS NOT NULL AND profile.classification != '' THEN completeness := completeness + 10; END IF;
  IF profile.position IS NOT NULL AND profile.position != '' THEN completeness := completeness + 10; END IF;
  IF profile.location_city IS NOT NULL AND profile.location_city != '' THEN completeness := completeness + 10; END IF;
  IF profile.location_state IS NOT NULL AND profile.location_state != '' THEN completeness := completeness + 10; END IF;

  -- Bio (20 points)
  IF profile.bio IS NOT NULL AND LENGTH(profile.bio) > 50 THEN completeness := completeness + 20; END IF;

  -- Photo (20 points)
  IF profile.photo_url IS NOT NULL AND profile.photo_url != '' THEN completeness := completeness + 20; END IF;

  RETURN completeness;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profile_completeness
CREATE OR REPLACE FUNCTION update_player_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completeness := calculate_player_profile_completeness(NEW.id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_profile_completeness
BEFORE INSERT OR UPDATE ON player_profiles
FOR EACH ROW
EXECUTE FUNCTION update_player_profile_completeness();

-- Function to increment profile views
CREATE OR REPLACE FUNCTION increment_player_profile_views(profile_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE player_profiles
  SET profile_views = profile_views + 1
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;
