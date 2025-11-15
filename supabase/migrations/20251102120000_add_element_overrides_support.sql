-- Add support for element-level style overrides in the Design panel
-- This migration documents the element_overrides structure within the styles JSONB column
-- No schema changes required - the existing styles JSONB column supports this structure

-- Expected structure for styles.content.element_overrides:
-- {
--   "content": {
--     "element_overrides": {
--       "section-id-element-name": {
--         "fontSize": "32px",
--         "color": "#ffffff",
--         "fontWeight": "700",
--         "backgroundColor": "#000000",
--         "padding": "10px 20px",
--         "margin": "5px",
--         "borderRadius": "8px",
--         "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",
--         ... (any CSS property in camelCase)
--       },
--       "another-element-id": { ... }
--     },
--     ... (other section content fields like logo_text, nav_items, etc)
--   }
-- }

-- Add a comment to the styles column to document this structure
COMMENT ON COLUMN website_sections.styles IS
'JSONB column storing section styles and content. Structure:
{
  "content": {
    "element_overrides": {
      "element-id": { "cssProperty": "value", ... }
    },
    ... other section content fields
  },
  ... other style properties
}

element_overrides stores per-element style customizations applied via the Design panel.
Element IDs follow the pattern: {sectionId}-{elementType}-{index} or {sectionId}-{elementName}
CSS properties are stored in camelCase (e.g., fontSize, backgroundColor)';

-- Create a helper function to validate element_overrides structure (optional)
CREATE OR REPLACE FUNCTION validate_element_overrides(overrides jsonb)
RETURNS boolean AS $$
BEGIN
  -- Check that overrides is an object
  IF jsonb_typeof(overrides) != 'object' THEN
    RETURN false;
  END IF;

  -- All keys should be element IDs (strings)
  -- All values should be objects containing CSS properties
  RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_element_overrides IS
'Validates the structure of element_overrides JSONB.
Element overrides should be an object where:
- Keys are element IDs (strings)
- Values are objects containing CSS property-value pairs';
