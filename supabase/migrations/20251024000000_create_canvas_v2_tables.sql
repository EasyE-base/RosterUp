-- Canvas Mode V2.0: Create element_mappings and canvas_commands tables
-- Migration: 20251024000000_create_canvas_v2_tables.sql

-- =====================================================================
-- Table: element_mappings
-- Purpose: Store thryveId → element mappings for hybrid canvas mode
-- Enables persistent element addressing across reloads
-- =====================================================================

CREATE TABLE IF NOT EXISTS element_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES website_pages(id) ON DELETE CASCADE,
  thryve_id TEXT NOT NULL,
  element_type TEXT NOT NULL, -- 'text', 'image', 'button', 'video', 'section', 'custom'
  selector TEXT NOT NULL, -- CSS selector: [data-thryve-id="..."]
  content JSONB DEFAULT '{}', -- Element content snapshot
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one mapping per thryveId per page
  CONSTRAINT element_mappings_page_thryve_unique UNIQUE (page_id, thryve_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS element_mappings_page_id_idx ON element_mappings(page_id);
CREATE INDEX IF NOT EXISTS element_mappings_thryve_id_idx ON element_mappings(thryve_id);

-- RLS Policies
ALTER TABLE element_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY element_mappings_select_policy ON element_mappings
  FOR SELECT
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      INNER JOIN websites w ON w.id = wp.website_id
      WHERE w.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY element_mappings_insert_policy ON element_mappings
  FOR INSERT
  WITH CHECK (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      INNER JOIN websites w ON w.id = wp.website_id
      WHERE w.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY element_mappings_update_policy ON element_mappings
  FOR UPDATE
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      INNER JOIN websites w ON w.id = wp.website_id
      WHERE w.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY element_mappings_delete_policy ON element_mappings
  FOR DELETE
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      INNER JOIN websites w ON w.id = wp.website_id
      WHERE w.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- =====================================================================
-- Table: canvas_commands
-- Purpose: Store command history for undo/redo and collaboration
-- Enables persistent canvas state across sessions
-- =====================================================================

CREATE TABLE IF NOT EXISTS canvas_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES website_pages(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- Client-generated session ID
  batch_index INTEGER NOT NULL, -- Index in command history
  command_data JSONB NOT NULL, -- Serialized Command[]
  version INTEGER DEFAULT 2, -- Command format version
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one batch per index per session
  CONSTRAINT canvas_commands_session_batch_unique UNIQUE (session_id, batch_index)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS canvas_commands_page_id_idx ON canvas_commands(page_id);
CREATE INDEX IF NOT EXISTS canvas_commands_session_id_idx ON canvas_commands(session_id);
CREATE INDEX IF NOT EXISTS canvas_commands_created_at_idx ON canvas_commands(created_at DESC);

-- RLS Policies
ALTER TABLE canvas_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY canvas_commands_select_policy ON canvas_commands
  FOR SELECT
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      INNER JOIN websites w ON w.id = wp.website_id
      WHERE w.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY canvas_commands_insert_policy ON canvas_commands
  FOR INSERT
  WITH CHECK (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      INNER JOIN websites w ON w.id = wp.website_id
      WHERE w.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY canvas_commands_delete_policy ON canvas_commands
  FOR DELETE
  USING (
    page_id IN (
      SELECT wp.id FROM website_pages wp
      INNER JOIN websites w ON w.id = wp.website_id
      WHERE w.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Comments
COMMENT ON TABLE element_mappings IS 'V2.0: Maps thryveIds to cloned HTML elements for persistent addressing';
COMMENT ON TABLE canvas_commands IS 'V2.0: Stores command history for undo/redo and collaboration';
COMMENT ON COLUMN element_mappings.thryve_id IS 'Deterministic stable ID: hash(pageId:nodePath)';
COMMENT ON COLUMN element_mappings.content IS 'Element content snapshot (text, src, href, etc.)';
COMMENT ON COLUMN canvas_commands.command_data IS 'Array of Command objects in batch';
COMMENT ON COLUMN canvas_commands.version IS 'Command format version (V2.0 = 2)';
