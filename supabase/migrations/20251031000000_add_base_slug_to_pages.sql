-- Add base_slug column to website_pages for canonical slug tracking
-- This enables cleanup, slug regeneration, and better URL management

-- Add the base_slug column (nullable for backwards compatibility)
ALTER TABLE website_pages
ADD COLUMN IF NOT EXISTS base_slug text;

-- Create composite index for fast lookups and cleanup operations
-- Scoped by organization_id for multi-tenant isolation
CREATE INDEX IF NOT EXISTS website_pages_base_slug_idx
  ON website_pages (website_id, base_slug);

-- Add comment for documentation
COMMENT ON COLUMN website_pages.base_slug IS 'Canonical slug without timestamp/ID suffix, used for template tracking and cleanup';
