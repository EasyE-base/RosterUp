-- Create team_achievements table for tracking team accomplishments
CREATE TABLE IF NOT EXISTS team_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  date_achieved date,
  achievement_type text CHECK (achievement_type IN ('tournament_win', 'league_title', 'award', 'other')) DEFAULT 'other',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE team_achievements ENABLE ROW LEVEL SECURITY;

-- Public can view achievements for active teams
CREATE POLICY "Public can view team achievements"
  ON team_achievements FOR SELECT
  TO public
  USING (
    team_id IN (SELECT id FROM teams WHERE is_active = true)
  );

-- Organizations can manage achievements for their teams
CREATE POLICY "Organizations can manage their team achievements"
  ON team_achievements FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT id FROM teams WHERE organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_achievements_team_id ON team_achievements(team_id);
CREATE INDEX IF NOT EXISTS idx_team_achievements_date ON team_achievements(date_achieved DESC);
