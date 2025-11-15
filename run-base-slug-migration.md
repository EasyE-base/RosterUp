# Run Base Slug Migration

The template import is failing because the `base_slug` column doesn't exist in the production database yet.

## Issue
The code in `WebsiteBuilder.tsx` is trying to insert a `base_slug` column when creating pages, but this column doesn't exist in the remote database yet.

## Solution
Run the migration file manually in the Supabase dashboard:

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai

2. Navigate to: **SQL Editor** (in the left sidebar)

3. Click **New Query**

4. Copy and paste the following SQL:

```sql
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
```

5. Click **Run** (or press Cmd+Enter / Ctrl+Enter)

6. Once the migration completes successfully, refresh the website builder page and try importing templates again.

## Verification
After running the migration, the template imports should work without the 400 error.
