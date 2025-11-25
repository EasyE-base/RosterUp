-- Add banner_url column to teams table for team banner images
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS banner_url text;

-- Create index for teams with banners (for featured display)
CREATE INDEX IF NOT EXISTS idx_teams_with_banner ON teams(banner_url) WHERE banner_url IS NOT NULL;
