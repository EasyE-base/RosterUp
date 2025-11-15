-- ============================================
-- COMPLETE PLAYER MARKETPLACE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add primary_sport to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS primary_sport TEXT;

COMMENT ON COLUMN organizations.primary_sport IS 'The primary sport this organization focuses on (e.g., Softball, Baseball, Basketball, etc.)';

CREATE INDEX IF NOT EXISTS idx_organizations_primary_sport ON organizations(primary_sport);

-- Step 2: Create player_profiles table
CREATE TABLE IF NOT EXISTS player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  age_group TEXT,
  classification TEXT, -- A, B, C, REC, ALL_STARS
  position TEXT,
  bio TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'USA',
  photo_url TEXT,
  profile_completeness INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_visible_in_search BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  CHECK (profile_completeness >= 0 AND profile_completeness <= 100)
);

-- Enable RLS on player_profiles
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_profiles
CREATE POLICY "Public can view active player profiles"
  ON player_profiles FOR SELECT
  USING (is_active = true AND is_visible_in_search = true);

CREATE POLICY "Players can view own profile"
  ON player_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Players can create own profile"
  ON player_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update own profile"
  ON player_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Players can delete own profile"
  ON player_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for player_profiles
CREATE INDEX IF NOT EXISTS idx_player_profiles_sport ON player_profiles(sport);
CREATE INDEX IF NOT EXISTS idx_player_profiles_age_group ON player_profiles(age_group);
CREATE INDEX IF NOT EXISTS idx_player_profiles_classification ON player_profiles(classification);
CREATE INDEX IF NOT EXISTS idx_player_profiles_location_state ON player_profiles(location_state);
CREATE INDEX IF NOT EXISTS idx_player_profiles_user_id ON player_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_player_profiles_search ON player_profiles(is_active, is_visible_in_search) WHERE is_active = true AND is_visible_in_search = true;

-- Full-text search index on bio
CREATE INDEX IF NOT EXISTS idx_player_profiles_bio_search ON player_profiles USING GIN (to_tsvector('english', COALESCE(bio, '')));

-- Step 3: Create player_contact_requests table
CREATE TABLE IF NOT EXISTS player_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'responded', 'expired')),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on player_contact_requests
ALTER TABLE player_contact_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_contact_requests
CREATE POLICY "Organizations can view their own contact requests"
  ON player_contact_requests FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Players can view contact requests for their profile"
  ON player_contact_requests FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM player_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organizations can create contact requests"
  ON player_contact_requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Players can update contact requests status"
  ON player_contact_requests FOR UPDATE
  USING (
    player_id IN (
      SELECT id FROM player_profiles WHERE user_id = auth.uid()
    )
  );

-- Indexes for player_contact_requests
CREATE INDEX IF NOT EXISTS idx_contact_requests_player ON player_contact_requests(player_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_org ON player_contact_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON player_contact_requests(status);

-- Step 4: Create search_analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  search_filters JSONB,
  result_count INTEGER,
  clicked_player_id UUID REFERENCES player_profiles(id) ON DELETE SET NULL,
  contact_initiated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on search_analytics
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_analytics
CREATE POLICY "Organizations can view their own analytics"
  ON search_analytics FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organizations can insert analytics"
  ON search_analytics FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Indexes for search_analytics
CREATE INDEX IF NOT EXISTS idx_search_analytics_org ON search_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created ON search_analytics(created_at);

-- Step 5: Create function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_player_profile_completeness(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completeness INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile FROM player_profiles WHERE id = profile_id;

  -- Each field contributes to completeness
  IF profile.sport IS NOT NULL AND profile.sport != '' THEN
    completeness := completeness + 10;
  END IF;

  IF profile.age_group IS NOT NULL AND profile.age_group != '' THEN
    completeness := completeness + 10;
  END IF;

  IF profile.classification IS NOT NULL AND profile.classification != '' THEN
    completeness := completeness + 10;
  END IF;

  IF profile.position IS NOT NULL AND profile.position != '' THEN
    completeness := completeness + 10;
  END IF;

  IF profile.location_city IS NOT NULL AND profile.location_city != '' THEN
    completeness := completeness + 10;
  END IF;

  IF profile.location_state IS NOT NULL AND profile.location_state != '' THEN
    completeness := completeness + 10;
  END IF;

  -- Bio worth more points (minimum 50 characters)
  IF profile.bio IS NOT NULL AND LENGTH(profile.bio) > 50 THEN
    completeness := completeness + 20;
  END IF;

  -- Photo worth more points
  IF profile.photo_url IS NOT NULL AND profile.photo_url != '' THEN
    completeness := completeness + 20;
  END IF;

  RETURN completeness;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to auto-update profile completeness
CREATE OR REPLACE FUNCTION update_player_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completeness := calculate_player_profile_completeness(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_player_profile_completeness ON player_profiles;

CREATE TRIGGER trigger_update_player_profile_completeness
  BEFORE INSERT OR UPDATE ON player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_player_profile_completeness();

-- Step 7: Create function to increment profile views
CREATE OR REPLACE FUNCTION increment_player_profile_views(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE player_profiles
  SET profile_views = profile_views + 1
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_player_profiles_updated_at ON player_profiles;
DROP TRIGGER IF EXISTS trigger_contact_requests_updated_at ON player_contact_requests;

CREATE TRIGGER trigger_player_profiles_updated_at
  BEFORE UPDATE ON player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_contact_requests_updated_at
  BEFORE UPDATE ON player_contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify the migration by checking if tables exist
SELECT
  'player_profiles' as table_name,
  COUNT(*) as row_count
FROM player_profiles
UNION ALL
SELECT
  'player_contact_requests' as table_name,
  COUNT(*) as row_count
FROM player_contact_requests
UNION ALL
SELECT
  'search_analytics' as table_name,
  COUNT(*) as row_count
FROM search_analytics;
