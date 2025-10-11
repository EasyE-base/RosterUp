-- RosterUp Database Setup Script
-- Run this in your Supabase SQL Editor to set up all tables and policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  user_type text NOT NULL CHECK (user_type IN ('organization', 'player')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  website text,
  logo_url text,
  location text,
  city text,
  state text,
  country text DEFAULT 'USA',
  subscription_tier text DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'growth', 'elite', 'enterprise')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their own data"
  ON organizations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Organizations can update their own data"
  ON organizations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  date_of_birth date,
  age integer,
  gender text,
  bio text,
  location text,
  city text,
  state text,
  country text DEFAULT 'USA',
  primary_sport text,
  primary_position text,
  height text,
  weight text,
  rating integer DEFAULT 0,
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'featured')),
  parent_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their own data"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view public player profiles"
  ON players FOR SELECT
  TO authenticated
  USING (profile_visibility = 'public' OR profile_visibility = 'featured');

CREATE POLICY "Players can update their own data"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sport text NOT NULL,
  age_group text,
  gender text,
  description text,
  logo_url text,
  season text,
  roster_limit integer DEFAULT 25,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active teams"
  ON teams FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Organizations can manage their teams"
  ON teams FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Tryouts table
CREATE TABLE IF NOT EXISTS tryouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  sport text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  location text NOT NULL,
  address text,
  age_group text,
  gender text,
  total_spots integer DEFAULT 20,
  spots_available integer DEFAULT 20,
  requirements jsonb DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tryouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view open tryouts"
  ON tryouts FOR SELECT
  TO authenticated
  USING (status = 'open');

CREATE POLICY "Organizations can manage their tryouts"
  ON tryouts FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Tryout Applications table
CREATE TABLE IF NOT EXISTS tryout_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tryout_id uuid REFERENCES tryouts(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'waitlist', 'withdrawn')),
  notes text,
  evaluation_score integer,
  evaluation_notes text,
  applied_at timestamptz DEFAULT now(),
  evaluated_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tryout_id, player_id)
);

ALTER TABLE tryout_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their own applications"
  ON tryout_applications FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Organizations can view applications for their tryouts"
  ON tryout_applications FOR SELECT
  TO authenticated
  USING (tryout_id IN (
    SELECT id FROM tryouts WHERE organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  sport text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  registration_deadline date NOT NULL,
  location_name text NOT NULL,
  city text NOT NULL,
  state text,
  country text DEFAULT 'USA',
  latitude decimal,
  longitude decimal,
  format_type text NOT NULL,
  max_participants integer DEFAULT 16,
  current_participants integer DEFAULT 0,
  entry_fee decimal,
  prize_info text,
  rules jsonb DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view open tournaments"
  ON tournaments FOR SELECT
  TO authenticated
  USING (status IN ('open', 'in_progress'));

CREATE POLICY "Organizations can manage their tournaments"
  ON tournaments FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Events/Calendar table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  event_type text DEFAULT 'other' CHECK (event_type IN ('game', 'practice', 'tryout', 'meeting', 'other')),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their events"
  ON events FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- ============================================================================
-- MESSAGING SYSTEM (from migrations)
-- ============================================================================

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messaging RLS Policies
CREATE POLICY "Users can view conversations they participate in"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- ============================================================================
-- WEBSITE BUILDER TABLES
-- ============================================================================

-- Organization Websites
CREATE TABLE IF NOT EXISTS organization_websites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_published boolean DEFAULT false,
  custom_domain text,
  subdomain text UNIQUE,
  theme text DEFAULT 'default',
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#64748b',
  logo_url text,
  favicon_url text,
  seo_title text,
  seo_description text,
  custom_css text,
  analytics_enabled boolean DEFAULT false,
  theme_id uuid,
  header_code text,
  footer_code text,
  google_analytics_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organization_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their websites"
  ON organization_websites FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Website Pages
CREATE TABLE IF NOT EXISTS website_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id uuid REFERENCES organization_websites(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  meta_description text,
  seo_keywords text,
  og_image text,
  template_id uuid,
  is_home boolean DEFAULT false,
  is_published boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(website_id, slug)
);

ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;

-- Website Content Blocks
CREATE TABLE IF NOT EXISTS website_content_blocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id uuid REFERENCES website_pages(id) ON DELETE CASCADE NOT NULL,
  block_type text NOT NULL,
  content jsonb DEFAULT '{}',
  styles jsonb DEFAULT '{}',
  visibility jsonb DEFAULT '{"desktop": true, "tablet": true, "mobile": true}',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE website_content_blocks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_tryouts_organization_id ON tryouts(organization_id);
CREATE INDEX IF NOT EXISTS idx_tryouts_status ON tryouts(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_organization_id ON tournaments(organization_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_events_organization_id ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Database setup complete! All tables and policies have been created.';
END $$;