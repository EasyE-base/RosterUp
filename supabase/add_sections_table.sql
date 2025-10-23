-- Create website_sections table for section-based layout
CREATE TABLE IF NOT EXISTS website_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id uuid REFERENCES website_pages(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Section',
  section_type text DEFAULT 'content' CHECK (section_type IN ('header', 'content', 'footer')),
  background_color text,
  background_image text,
  background_size text DEFAULT 'cover',
  background_position text DEFAULT 'center',
  padding_top text DEFAULT '3rem',
  padding_bottom text DEFAULT '3rem',
  padding_left text DEFAULT '1rem',
  padding_right text DEFAULT '1rem',
  max_width text DEFAULT '1200px',
  full_width boolean DEFAULT false,
  order_index integer DEFAULT 0,
  styles jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE website_sections ENABLE ROW LEVEL SECURITY;

-- Add section_id to website_content_blocks
ALTER TABLE website_content_blocks
ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES website_sections(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_website_sections_page_id ON website_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_order_index ON website_sections(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_website_content_blocks_section_id ON website_content_blocks(section_id);

-- Create policies for website_sections (inherit from pages)
CREATE POLICY "Users can view sections for their organization pages"
  ON website_sections FOR SELECT
  TO authenticated
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      JOIN organization_websites ow ON wp.website_id = ow.id
      WHERE ow.organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage sections for their organization pages"
  ON website_sections FOR ALL
  TO authenticated
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      JOIN organization_websites ow ON wp.website_id = ow.id
      WHERE ow.organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );
