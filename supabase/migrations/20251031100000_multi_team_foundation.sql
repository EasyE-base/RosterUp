-- Multi-Team Foundation Schema
-- Enables organizations to manage multiple teams with separate pages and theme customization

-- ============================================================================
-- 1. Add custom_colors and age_group to teams table
-- ============================================================================
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS custom_colors JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT NULL;

COMMENT ON COLUMN teams.custom_colors IS 'Per-team color overrides in format: {"primary": "#...", "accent": "#...", etc.}';
COMMENT ON COLUMN teams.age_group IS 'Age group/division (e.g., "U12", "U14", "U16", "U18", "Adult")';

-- ============================================================================
-- 2. Add team_id to website_pages for team-specific pages
-- ============================================================================
ALTER TABLE website_pages
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE DEFAULT NULL;

CREATE INDEX IF NOT EXISTS website_pages_team_id_idx ON website_pages (team_id);

COMMENT ON COLUMN website_pages.team_id IS 'Links page to specific team. NULL = organization-wide page';

-- ============================================================================
-- 3. Create team_websites junction table for theme customization
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES organization_websites(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL DEFAULT 'dark_athletic',
  theme_overrides JSONB DEFAULT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, website_id)
);

CREATE INDEX IF NOT EXISTS team_websites_team_id_idx ON team_websites (team_id);
CREATE INDEX IF NOT EXISTS team_websites_website_id_idx ON team_websites (website_id);

COMMENT ON TABLE team_websites IS 'Junction table linking teams to websites with theme customization';
COMMENT ON COLUMN team_websites.theme_id IS 'Theme preset ID (dark_athletic, vibrant_energy, etc.)';
COMMENT ON COLUMN team_websites.theme_overrides IS 'Custom color overrides for this team';
COMMENT ON COLUMN team_websites.is_enabled IS 'Whether team page is published on website';

-- ============================================================================
-- 4. Create player_commitments table for alumni/college destinations
-- ============================================================================
CREATE TABLE IF NOT EXISTS player_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  grad_year INTEGER NOT NULL,
  institution_name TEXT NOT NULL,
  institution_type TEXT CHECK (institution_type IN ('D1', 'D2', 'D3', 'NAIA', 'JUCO', 'Professional', 'International', 'Other')),
  institution_logo_url TEXT,
  commitment_date DATE,
  position TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS player_commitments_org_id_idx ON player_commitments (organization_id);
CREATE INDEX IF NOT EXISTS player_commitments_team_id_idx ON player_commitments (team_id);
CREATE INDEX IF NOT EXISTS player_commitments_grad_year_idx ON player_commitments (grad_year DESC);
CREATE INDEX IF NOT EXISTS player_commitments_institution_type_idx ON player_commitments (institution_type);

COMMENT ON TABLE player_commitments IS 'Tracks player college/pro commitments and alumni destinations';
COMMENT ON COLUMN player_commitments.is_featured IS 'Featured commitments appear at top of list';

-- ============================================================================
-- 5. Create website_sponsors table for sponsor management
-- ============================================================================
CREATE TABLE IF NOT EXISTS website_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES organization_websites(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  tier TEXT CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze', 'partner')) DEFAULT 'partner',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS website_sponsors_website_id_idx ON website_sponsors (website_id);
CREATE INDEX IF NOT EXISTS website_sponsors_team_id_idx ON website_sponsors (team_id);
CREATE INDEX IF NOT EXISTS website_sponsors_tier_idx ON website_sponsors (tier);

COMMENT ON TABLE website_sponsors IS 'Sponsor logos and links for websites (org-wide or team-specific)';
COMMENT ON COLUMN website_sponsors.team_id IS 'NULL = organization-wide sponsor, otherwise team-specific';

-- ============================================================================
-- 6. Create website_media table for centralized asset management
-- ============================================================================
CREATE TABLE IF NOT EXISTS website_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES organization_websites(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document', 'logo', 'background')),
  file_size INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  caption TEXT,
  is_public BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS website_media_website_id_idx ON website_media (website_id);
CREATE INDEX IF NOT EXISTS website_media_team_id_idx ON website_media (team_id);
CREATE INDEX IF NOT EXISTS website_media_file_type_idx ON website_media (file_type);

COMMENT ON TABLE website_media IS 'Centralized media library for website assets';

-- ============================================================================
-- 7. Add default_team_theme_id to organization_websites
-- ============================================================================
ALTER TABLE organization_websites
ADD COLUMN IF NOT EXISTS default_team_theme_id TEXT DEFAULT 'dark_athletic';

COMMENT ON COLUMN organization_websites.default_team_theme_id IS 'Default theme for team pages if not customized';

-- ============================================================================
-- 8. Enable RLS policies
-- ============================================================================
ALTER TABLE team_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_media ENABLE ROW LEVEL SECURITY;

-- Team Websites Policies
CREATE POLICY "Team websites viewable by organization members"
  ON team_websites FOR SELECT
  USING (
    website_id IN (
      SELECT ow.id FROM organization_websites ow
      WHERE ow.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Team websites manageable by org admins"
  ON team_websites FOR ALL
  USING (
    website_id IN (
      SELECT ow.id FROM organization_websites ow
      WHERE ow.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
      )
    )
  );

-- Player Commitments Policies
CREATE POLICY "Commitments publicly viewable"
  ON player_commitments FOR SELECT
  USING (true);

CREATE POLICY "Commitments manageable by org members"
  ON player_commitments FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Website Sponsors Policies
CREATE POLICY "Sponsors publicly viewable"
  ON website_sponsors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sponsors manageable by org admins"
  ON website_sponsors FOR ALL
  USING (
    website_id IN (
      SELECT ow.id FROM organization_websites ow
      WHERE ow.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
      )
    )
  );

-- Website Media Policies
CREATE POLICY "Public media viewable by all"
  ON website_media FOR SELECT
  USING (is_public = true);

CREATE POLICY "All media viewable by org members"
  ON website_media FOR SELECT
  USING (
    website_id IN (
      SELECT ow.id FROM organization_websites ow
      WHERE ow.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Media manageable by org members"
  ON website_media FOR INSERT
  WITH CHECK (
    website_id IN (
      SELECT ow.id FROM organization_websites ow
      WHERE ow.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Media deletable by uploader or admin"
  ON website_media FOR DELETE
  USING (
    uploaded_by = auth.uid() OR
    website_id IN (
      SELECT ow.id FROM organization_websites ow
      WHERE ow.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
      )
    )
  );

-- ============================================================================
-- 9. Create updated_at triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_websites_updated_at
  BEFORE UPDATE ON team_websites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_commitments_updated_at
  BEFORE UPDATE ON player_commitments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_sponsors_updated_at
  BEFORE UPDATE ON website_sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
