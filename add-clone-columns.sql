-- Add columns for Smart Import™ clone data
ALTER TABLE organization_websites
ADD COLUMN IF NOT EXISTS website_mode TEXT DEFAULT 'blocks' CHECK (website_mode IN ('blocks', 'clone')),
ADD COLUMN IF NOT EXISTS clone_html TEXT,
ADD COLUMN IF NOT EXISTS clone_css TEXT,
ADD COLUMN IF NOT EXISTS clone_js TEXT;

-- Add comment
COMMENT ON COLUMN organization_websites.website_mode IS 'Rendering mode: blocks (editable) or clone (pixel-perfect)';
COMMENT ON COLUMN organization_websites.clone_html IS 'Complete HTML from cloned website for pixel-perfect rendering';
COMMENT ON COLUMN organization_websites.clone_css IS 'Extracted CSS from cloned website';
COMMENT ON COLUMN organization_websites.clone_js IS 'JavaScript from cloned website (optional)';
