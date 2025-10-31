-- Add template section types to the section_type check constraint
-- This allows templates to use semantic section types like 'hero', 'about', 'schedule', 'contact'

-- Drop the existing constraint
ALTER TABLE website_sections
DROP CONSTRAINT IF EXISTS website_sections_section_type_check;

-- Add new constraint with template section types
ALTER TABLE website_sections
ADD CONSTRAINT website_sections_section_type_check
CHECK (section_type IN ('header', 'content', 'footer', 'hero', 'about', 'schedule', 'contact'));
