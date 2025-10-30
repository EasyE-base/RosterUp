-- Delete all data for the current organization's website
-- This will cascade to pages, sections, and element mappings

-- First, find the organization_id (should be the only one in the table)
-- Then delete the website record (CASCADE will handle related tables)

DELETE FROM organization_websites
WHERE organization_id IN (
  SELECT id FROM organizations LIMIT 1
);
