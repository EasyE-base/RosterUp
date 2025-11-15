-- Add classification system columns to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS classification_acceptance TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS accepted_classifications TEXT[];
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS classification_rules JSONB;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS age_group TEXT;

-- Add comments to describe the columns
COMMENT ON COLUMN tournaments.classification_acceptance IS 'Tournament classification acceptance policy (A_ONLY, A_B, B_ONLY, B_C, C_ONLY, REC_ONLY, OPEN, CUSTOM)';
COMMENT ON COLUMN tournaments.accepted_classifications IS 'Array of accepted team classifications when using CUSTOM acceptance policy';
COMMENT ON COLUMN tournaments.classification_rules IS 'Additional classification-specific rules and requirements for the tournament';
COMMENT ON COLUMN tournaments.age_group IS 'Age group for the tournament (e.g., 10U, 12U, 14U) - used for classification rule exceptions';

-- Add classification system columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS classification TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS prior_season_classification TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS classification_eligibility JSONB;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS last_classification_review TIMESTAMP WITH TIME ZONE;

-- Add comments to describe the columns
COMMENT ON COLUMN teams.classification IS 'Current team classification level (A, B, C, REC, ALL_STARS)';
COMMENT ON COLUMN teams.prior_season_classification IS 'Previous season classification level for continuity tracking';
COMMENT ON COLUMN teams.classification_eligibility IS 'JSON object storing ClassificationCriteria data including tournament metrics, performance metrics, and roster metrics';
COMMENT ON COLUMN teams.last_classification_review IS 'Timestamp of the last classification review or update';

-- Create index on classification fields for better query performance
CREATE INDEX IF NOT EXISTS idx_tournaments_classification_acceptance ON tournaments(classification_acceptance);
CREATE INDEX IF NOT EXISTS idx_tournaments_age_group ON tournaments(age_group);
CREATE INDEX IF NOT EXISTS idx_teams_classification ON teams(classification);

-- Create a table to track re-classification requests
CREATE TABLE IF NOT EXISTS team_reclassification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  current_classification TEXT NOT NULL,
  requested_classification TEXT NOT NULL,
  reason TEXT NOT NULL,
  supporting_data JSONB,
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewer_id UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE team_reclassification_requests IS 'Tracks team requests for classification changes with approval workflow';
CREATE INDEX IF NOT EXISTS idx_reclassification_team_id ON team_reclassification_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_reclassification_status ON team_reclassification_requests(status);
