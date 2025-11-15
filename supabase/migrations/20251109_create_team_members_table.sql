-- Create team_members table to link players to teams
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  position text,
  jersey_number integer,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, player_id)
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Players can view their own team memberships
CREATE POLICY "Players can view their own team memberships"
  ON team_members FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Organizations can view team members for their teams
CREATE POLICY "Organizations can view their team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT id FROM teams WHERE organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

-- Organizations can manage team members for their teams
CREATE POLICY "Organizations can manage their team members"
  ON team_members FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT id FROM teams WHERE organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_player_id ON team_members(player_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
