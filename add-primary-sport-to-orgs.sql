-- Add primary_sport field to organizations table
-- This allows organizations to specify their main sport
-- Player marketplace will filter to only show players of this sport

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS primary_sport TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN organizations.primary_sport IS 'The primary sport this organization focuses on (e.g., Softball, Baseball, Basketball, etc.)';

-- Optional: Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_organizations_primary_sport ON organizations(primary_sport);
