-- Add clone_html column to website_pages table for multi-page clone support
ALTER TABLE website_pages
ADD COLUMN IF NOT EXISTS clone_html TEXT;

COMMENT ON COLUMN website_pages.clone_html IS 'Page-specific HTML content for multi-page cloned websites';
