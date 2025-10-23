-- Add RLS policies for website_pages table
CREATE POLICY "Organizations can manage their website pages"
  ON website_pages FOR ALL
  TO authenticated
  USING (
    website_id IN (
      SELECT id FROM organization_websites
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

-- Add RLS policies for website_content_blocks table
CREATE POLICY "Organizations can manage their website content blocks"
  ON website_content_blocks FOR ALL
  TO authenticated
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      JOIN organization_websites ow ON wp.website_id = ow.id
      JOIN organizations o ON ow.organization_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- Allow public viewing of published websites
CREATE POLICY "Public can view published website pages"
  ON website_pages FOR SELECT
  TO anon, authenticated
  USING (
    is_published = true
    AND website_id IN (
      SELECT id FROM organization_websites WHERE is_published = true
    )
  );

CREATE POLICY "Public can view content blocks on published pages"
  ON website_content_blocks FOR SELECT
  TO anon, authenticated
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      JOIN organization_websites ow ON wp.website_id = ow.id
      WHERE wp.is_published = true AND ow.is_published = true
    )
  );
