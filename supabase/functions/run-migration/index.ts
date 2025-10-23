import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const sql = `
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

ALTER TABLE website_content_blocks ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES website_sections(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_website_sections_page_id ON website_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_order_index ON website_sections(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_website_content_blocks_section_id ON website_content_blocks(section_id);

DROP POLICY IF EXISTS "Users can view sections for their organization pages" ON website_sections;
CREATE POLICY "Users can view sections for their organization pages" ON website_sections FOR SELECT TO authenticated USING (page_id IN (SELECT wp.id FROM website_pages wp JOIN organization_websites ow ON wp.website_id = ow.id WHERE ow.organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can manage sections for their organization pages" ON website_sections;
CREATE POLICY "Users can manage sections for their organization pages" ON website_sections FOR ALL TO authenticated USING (page_id IN (SELECT wp.id FROM website_pages wp JOIN organization_websites ow ON wp.website_id = ow.id WHERE ow.organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid())));

CREATE TABLE IF NOT EXISTS website_design_systems (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id uuid REFERENCES organization_websites(id) ON DELETE CASCADE NOT NULL UNIQUE,
  colors jsonb DEFAULT '{}',
  typography jsonb DEFAULT '{}',
  spacing jsonb DEFAULT '{}',
  buttons jsonb DEFAULT '{}',
  effects jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE website_design_systems ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_website_design_systems_website_id ON website_design_systems(website_id);

DROP POLICY IF EXISTS "Users can view design systems for their organization websites" ON website_design_systems;
CREATE POLICY "Users can view design systems for their organization websites" ON website_design_systems FOR SELECT TO authenticated USING (website_id IN (SELECT id FROM organization_websites WHERE organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can manage design systems for their organization websites" ON website_design_systems;
CREATE POLICY "Users can manage design systems for their organization websites" ON website_design_systems FOR ALL TO authenticated USING (website_id IN (SELECT id FROM organization_websites WHERE organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid())));

CREATE OR REPLACE FUNCTION update_website_design_systems_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_website_design_systems_updated_at ON website_design_systems;
CREATE TRIGGER update_website_design_systems_updated_at BEFORE UPDATE ON website_design_systems FOR EACH ROW EXECUTE FUNCTION update_website_design_systems_updated_at();

DELETE FROM organization_websites WHERE subdomain = 'gators';
    `;

    // Execute the SQL
    const { error } = await supabase.rpc('exec', { sql });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Migration completed successfully!' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Migration failed' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
