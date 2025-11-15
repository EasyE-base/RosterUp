-- Create player_stats table to track profile analytics
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_views integer DEFAULT 0,
  profile_views_today integer DEFAULT 0,
  profile_views_this_week integer DEFAULT 0,
  profile_views_this_month integer DEFAULT 0,
  team_interests integer DEFAULT 0,
  tryout_applications integer DEFAULT 0,
  tryout_acceptances integer DEFAULT 0,
  last_viewed_at timestamptz,
  last_interested_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profile_views_log table for detailed tracking
CREATE TABLE IF NOT EXISTS profile_views_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  viewed_by_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views_log ENABLE ROW LEVEL SECURITY;

-- Players can view their own stats
CREATE POLICY "Players can view their own stats"
  ON player_stats FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Players can update their own stats (for increment operations)
CREATE POLICY "Players can update their own stats"
  ON player_stats FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Auto-create stats record when player is created
CREATE POLICY "Auto-create player stats"
  ON player_stats FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Players can view their profile views log
CREATE POLICY "Players can view their profile views log"
  ON profile_views_log FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Organizations can log profile views
CREATE POLICY "Organizations can log profile views"
  ON profile_views_log FOR INSERT
  TO authenticated
  WITH CHECK (viewed_by_organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_log_player_id ON profile_views_log(player_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_log_viewed_at ON profile_views_log(viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_log_organization_id ON profile_views_log(viewed_by_organization_id);

-- Function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(p_player_id uuid, p_org_id uuid DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Insert or update player_stats
  INSERT INTO player_stats (player_id, profile_views, profile_views_today, profile_views_this_week, profile_views_this_month, last_viewed_at)
  VALUES (p_player_id, 1, 1, 1, 1, now())
  ON CONFLICT (player_id)
  DO UPDATE SET
    profile_views = player_stats.profile_views + 1,
    profile_views_today = player_stats.profile_views_today + 1,
    profile_views_this_week = player_stats.profile_views_this_week + 1,
    profile_views_this_month = player_stats.profile_views_this_month + 1,
    last_viewed_at = now(),
    updated_at = now();

  -- Log the view
  INSERT INTO profile_views_log (player_id, viewed_by_organization_id)
  VALUES (p_player_id, p_org_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
