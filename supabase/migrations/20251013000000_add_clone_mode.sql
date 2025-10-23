-- Add clone mode support to organization_websites table
ALTER TABLE organization_websites
ADD COLUMN IF NOT EXISTS website_mode TEXT DEFAULT 'blocks' CHECK (website_mode IN ('blocks', 'clone')),
ADD COLUMN IF NOT EXISTS clone_html TEXT,
ADD COLUMN IF NOT EXISTS clone_css TEXT,
ADD COLUMN IF NOT EXISTS clone_js TEXT,
ADD COLUMN IF NOT EXISTS clone_assets JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the fields
COMMENT ON COLUMN organization_websites.website_mode IS 'Website rendering mode: blocks (drag-and-drop editor) or clone (pure HTML)';
COMMENT ON COLUMN organization_websites.clone_html IS 'Full HTML content for clone mode websites';
COMMENT ON COLUMN organization_websites.clone_css IS 'Full CSS content for clone mode websites';
COMMENT ON COLUMN organization_websites.clone_js IS 'Full JavaScript content for clone mode websites';
COMMENT ON COLUMN organization_websites.clone_assets IS 'JSON array of cloned asset URLs and their Supabase storage paths';
