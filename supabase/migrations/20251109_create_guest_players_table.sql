-- Create guest_players table for tournament guest player registry
CREATE TABLE IF NOT EXISTS guest_players (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'invited', 'accepted', 'declined', 'removed')),
  invited_by_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  notes text,
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

-- Enable RLS
ALTER TABLE guest_players ENABLE ROW LEVEL SECURITY;

-- Players can view and manage their own guest player applications
CREATE POLICY "Players can view their own guest applications"
  ON guest_players FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Players can create guest applications"
  ON guest_players FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Players can update their own guest applications"
  ON guest_players FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Organizations and teams can view guest players for tournaments
CREATE POLICY "View guest players for accessible tournaments"
  ON guest_players FOR SELECT
  TO authenticated
  USING (
    tournament_id IN (
      -- Tournaments the organization hosts
      SELECT id FROM tournaments WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
    OR
    tournament_id IN (
      -- Tournaments that teams registered for can see guest players
      SELECT tournament_id FROM tournament_applications WHERE team_id IN (
        SELECT id FROM teams WHERE organization_id IN (
          SELECT id FROM organizations WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Teams can invite guest players (update status to 'invited')
CREATE POLICY "Teams can invite guest players"
  ON guest_players FOR UPDATE
  TO authenticated
  USING (
    tournament_id IN (
      SELECT tournament_id FROM tournament_applications WHERE team_id IN (
        SELECT id FROM teams WHERE organization_id IN (
          SELECT id FROM organizations WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_players_tournament_id ON guest_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_guest_players_player_id ON guest_players(player_id);
CREATE INDEX IF NOT EXISTS idx_guest_players_status ON guest_players(status);
CREATE INDEX IF NOT EXISTS idx_guest_players_invited_by_team_id ON guest_players(invited_by_team_id);
