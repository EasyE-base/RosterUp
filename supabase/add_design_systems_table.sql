-- Create website_design_systems table for storing design system configurations
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_website_design_systems_website_id ON website_design_systems(website_id);

-- Create policies for website_design_systems (inherit from organization_websites)
CREATE POLICY "Users can view design systems for their organization websites"
  ON website_design_systems FOR SELECT
  TO authenticated
  USING (
    website_id IN (
      SELECT id FROM organization_websites
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage design systems for their organization websites"
  ON website_design_systems FOR ALL
  TO authenticated
  USING (
    website_id IN (
      SELECT id FROM organization_websites
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_website_design_systems_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_website_design_systems_updated_at
  BEFORE UPDATE ON website_design_systems
  FOR EACH ROW
  EXECUTE FUNCTION update_website_design_systems_updated_at();
