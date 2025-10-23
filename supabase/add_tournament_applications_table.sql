-- Create tournament_applications table
CREATE TABLE IF NOT EXISTS tournament_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  team_name text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  participants_count integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'waitlist', 'withdrawn')),
  notes text,
  evaluation_notes text,
  applied_at timestamptz DEFAULT now(),
  evaluated_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, player_id),
  UNIQUE(tournament_id, organization_id)
);

ALTER TABLE tournament_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for tournament_applications
CREATE POLICY "Players can view their own applications"
  ON tournament_applications FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Organizations can view applications for their tournaments"
  ON tournament_applications FOR SELECT
  TO authenticated
  USING (tournament_id IN (
    SELECT id FROM tournaments WHERE organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Anyone can insert tournament applications"
  ON tournament_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update their own applications"
  ON tournament_applications FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Organizations can update applications for their tournaments"
  ON tournament_applications FOR UPDATE
  TO authenticated
  USING (tournament_id IN (
    SELECT id FROM tournaments WHERE organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournament_applications_tournament_id ON tournament_applications(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_applications_player_id ON tournament_applications(player_id);
CREATE INDEX IF NOT EXISTS idx_tournament_applications_organization_id ON tournament_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_tournament_applications_status ON tournament_applications(status);
CREATE INDEX IF NOT EXISTS idx_tournament_applications_applied_at ON tournament_applications(applied_at DESC);
