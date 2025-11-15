-- Add Section Marketplace section types to the section_type check constraint
-- This allows all sections from the Section Marketplace to be created
-- Includes: navigation, commitments, gallery, roster types

-- Drop the existing constraint
ALTER TABLE website_sections
DROP CONSTRAINT IF EXISTS website_sections_section_type_check;

-- Add new constraint with ALL section types needed
ALTER TABLE website_sections
ADD CONSTRAINT website_sections_section_type_check
CHECK (section_type IN (
  'header',
  'content',
  'footer',
  'hero',
  'about',
  'schedule',
  'contact',
  'navigation-center-logo',
  'commitments',
  'gallery',
  'roster'
));
