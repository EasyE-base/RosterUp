-- Create team_media table for team photos and videos
CREATE TABLE IF NOT EXISTS team_media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  media_type text CHECK (media_type IN ('photo', 'video')) NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  title text,
  description text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE team_media ENABLE ROW LEVEL SECURITY;

-- Public can view media for active teams
CREATE POLICY "Public can view team media"
  ON team_media FOR SELECT
  TO public
  USING (
    team_id IN (SELECT id FROM teams WHERE is_active = true)
  );

-- Organizations can manage media for their teams
CREATE POLICY "Organizations can manage their team media"
  ON team_media FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT id FROM teams WHERE organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_media_team_id ON team_media(team_id);
CREATE INDEX IF NOT EXISTS idx_team_media_featured ON team_media(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_team_media_created ON team_media(created_at DESC);
