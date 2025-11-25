-- ============================================================================
-- TRAINER ROLE MIGRATION (FIXED VERSION)
-- ============================================================================
-- This migration adds the Trainer user type with:
-- 1. Trainer profiles with intro videos and interactive maps
-- 2. Training sessions with rich media (banner images + promo videos)
-- 3. Session booking system
-- 4. Featured/spotlight trainers support
-- 5. Storage buckets for media assets
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. UPDATE PROFILES TABLE - Handle user_type (TEXT or ENUM)
-- ----------------------------------------------------------------------------

-- Check if user_type is TEXT and update it to include 'trainer' as a valid value
-- If it's already an enum, we'll create it if it doesn't exist
DO $$
DECLARE
  col_type TEXT;
BEGIN
  -- Get the data type of user_type column
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'profiles' AND column_name = 'user_type';

  -- If user_type is TEXT, we don't need to do anything special
  -- Just ensure the column exists
  IF col_type = 'text' OR col_type = 'character varying' THEN
    RAISE NOTICE 'user_type is TEXT - no enum modification needed';
  ELSIF col_type = 'USER-DEFINED' THEN
    -- It's an enum, check if trainer exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_type' AND e.enumlabel = 'trainer'
    ) THEN
      ALTER TYPE user_type ADD VALUE 'trainer';
      RAISE NOTICE 'Added trainer to user_type enum';
    END IF;
  ELSE
    RAISE NOTICE 'user_type column type: %', col_type;
  END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 2. CREATE TRAINERS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trainers (
  -- Primary fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Profile media
  intro_video_url TEXT, -- URL to intro video in storage
  headshot_url TEXT, -- Profile photo

  -- Background & credentials (stored as JSON for timeline UI)
  athletic_background JSONB DEFAULT '[]'::jsonb, -- Array of {year, title, description}
  coaching_background JSONB DEFAULT '[]'::jsonb, -- Array of {year, title, description}
  certifications JSONB DEFAULT '[]'::jsonb, -- Array of {name, issuer, year, image_url}

  -- Specializations & sports
  specializations TEXT[] DEFAULT '{}', -- Array of specialization tags
  sports TEXT[] DEFAULT '{}', -- Array of sports (e.g., ['Baseball', 'Softball'])

  -- Bio & tagline
  bio TEXT,
  tagline TEXT, -- Short headline (e.g., "Former MLB Player | Hitting Specialist")

  -- Location & service area
  travel_radius_miles INTEGER, -- How far trainer will travel
  latitude DECIMAL(10, 8), -- Primary location latitude
  longitude DECIMAL(11, 8), -- Primary location longitude
  fixed_locations JSONB DEFAULT '[]'::jsonb, -- Array of {name, address, lat, lng}
  service_areas JSONB DEFAULT '[]'::jsonb, -- Array of {city, state, radius}

  -- Pricing (optional display)
  pricing_info JSONB, -- {hourly_rate, group_rate, show_pricing: boolean}

  -- Featured/spotlight
  is_featured BOOLEAN DEFAULT false,
  featured_priority INTEGER DEFAULT 0, -- Higher = shown first in carousel
  featured_start_date TIMESTAMP WITH TIME ZONE,
  featured_end_date TIMESTAMP WITH TIME ZONE,

  -- Stats & ratings (for future)
  total_sessions INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,

  -- Availability
  availability_schedule JSONB, -- Weekly schedule data

  UNIQUE(user_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trainers_user_id ON trainers(user_id);
CREATE INDEX IF NOT EXISTS idx_trainers_is_featured ON trainers(is_featured);
CREATE INDEX IF NOT EXISTS idx_trainers_sports ON trainers USING GIN(sports);
CREATE INDEX IF NOT EXISTS idx_trainers_location ON trainers(latitude, longitude);

-- ----------------------------------------------------------------------------
-- 3. CREATE TRAINING_SESSIONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS training_sessions (
  -- Primary fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Session details
  title TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('one_on_one', 'small_group', 'clinic', 'team_practice')),

  -- Rich media
  banner_image_url TEXT, -- Hero banner for session detail page
  promo_video_url TEXT, -- Promo video showcasing the session

  -- Session specifics
  duration_minutes INTEGER NOT NULL,
  max_participants INTEGER, -- NULL for one-on-one, number for group/clinic
  skill_level TEXT, -- beginner, intermediate, advanced, all

  -- Pricing
  price_per_person DECIMAL(10, 2),
  price_per_session DECIMAL(10, 2),
  pricing_notes TEXT,

  -- Location
  location_type TEXT CHECK (location_type IN ('fixed', 'travel', 'virtual')),
  location_data JSONB, -- {address, lat, lng} or {travel_radius} or {video_platform}

  -- Scheduling
  is_recurring BOOLEAN DEFAULT false,
  recurring_schedule JSONB, -- {days: [], time: '', frequency: ''}

  -- Availability
  is_active BOOLEAN DEFAULT true,
  available_spots INTEGER, -- Remaining spots for group sessions

  -- Stats
  total_bookings INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_sessions_trainer_id ON training_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_sport ON training_sessions(sport);
CREATE INDEX IF NOT EXISTS idx_training_sessions_session_type ON training_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_is_active ON training_sessions(is_active);

-- ----------------------------------------------------------------------------
-- 4. CREATE SESSION_BOOKINGS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS session_bookings (
  -- Primary fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Booking status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),

  -- Requested date/time
  requested_date DATE,
  requested_time TIME,
  confirmed_date DATE,
  confirmed_time TIME,

  -- Communication
  player_message TEXT, -- Initial message from player
  trainer_response TEXT, -- Response from trainer

  -- Additional participants (for group bookings)
  additional_participants INTEGER DEFAULT 0,

  -- Payment (for future)
  total_amount DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),

  -- Constraints
  UNIQUE(session_id, player_id, requested_date, requested_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_session_bookings_session_id ON session_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_player_id ON session_bookings(player_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_status ON session_bookings(status);

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

-- TRAINERS TABLE POLICIES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Trainers are viewable by everyone" ON trainers;
DROP POLICY IF EXISTS "Users can insert their own trainer profile" ON trainers;
DROP POLICY IF EXISTS "Trainers can update their own profile" ON trainers;
DROP POLICY IF EXISTS "Trainers can delete their own profile" ON trainers;

-- Anyone can view trainer profiles
CREATE POLICY "Trainers are viewable by everyone"
  ON trainers FOR SELECT
  USING (true);

-- Only the trainer can insert/update their own profile
CREATE POLICY "Users can insert their own trainer profile"
  ON trainers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trainers can update their own profile"
  ON trainers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the trainer can delete their profile
CREATE POLICY "Trainers can delete their own profile"
  ON trainers FOR DELETE
  USING (auth.uid() = user_id);

-- TRAINING_SESSIONS TABLE POLICIES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Active training sessions are viewable by everyone" ON training_sessions;
DROP POLICY IF EXISTS "Trainers can create their own sessions" ON training_sessions;
DROP POLICY IF EXISTS "Trainers can update their own sessions" ON training_sessions;
DROP POLICY IF EXISTS "Trainers can delete their own sessions" ON training_sessions;

-- Anyone can view active sessions
CREATE POLICY "Active training sessions are viewable by everyone"
  ON training_sessions FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM trainers WHERE trainers.id = training_sessions.trainer_id AND trainers.user_id = auth.uid()
  ));

-- Only the trainer can create sessions
CREATE POLICY "Trainers can create their own sessions"
  ON training_sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM trainers WHERE trainers.id = trainer_id AND trainers.user_id = auth.uid()
  ));

-- Only the trainer can update their sessions
CREATE POLICY "Trainers can update their own sessions"
  ON training_sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM trainers WHERE trainers.id = trainer_id AND trainers.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM trainers WHERE trainers.id = trainer_id AND trainers.user_id = auth.uid()
  ));

-- Only the trainer can delete their sessions
CREATE POLICY "Trainers can delete their own sessions"
  ON training_sessions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM trainers WHERE trainers.id = trainer_id AND trainers.user_id = auth.uid()
  ));

-- SESSION_BOOKINGS TABLE POLICIES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON session_bookings;
DROP POLICY IF EXISTS "Players can create bookings" ON session_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON session_bookings;
DROP POLICY IF EXISTS "Players can delete their pending bookings" ON session_bookings;

-- Players and trainers can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON session_bookings FOR SELECT
  USING (
    -- Player can see their bookings
    EXISTS (SELECT 1 FROM player_profiles WHERE player_profiles.id = session_bookings.player_id AND player_profiles.user_id = auth.uid())
    OR
    -- Trainer can see bookings for their sessions
    EXISTS (
      SELECT 1 FROM training_sessions ts
      JOIN trainers t ON t.id = ts.trainer_id
      WHERE ts.id = session_bookings.session_id AND t.user_id = auth.uid()
    )
  );

-- Players can create bookings
CREATE POLICY "Players can create bookings"
  ON session_bookings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM player_profiles WHERE player_profiles.id = player_id AND player_profiles.user_id = auth.uid()
  ));

-- Players can update their pending bookings; Trainers can update any booking for their sessions
CREATE POLICY "Users can update their own bookings"
  ON session_bookings FOR UPDATE
  USING (
    -- Player can update their own pending bookings
    (EXISTS (SELECT 1 FROM player_profiles WHERE player_profiles.id = session_bookings.player_id AND player_profiles.user_id = auth.uid()) AND status = 'pending')
    OR
    -- Trainer can update bookings for their sessions
    EXISTS (
      SELECT 1 FROM training_sessions ts
      JOIN trainers t ON t.id = ts.trainer_id
      WHERE ts.id = session_bookings.session_id AND t.user_id = auth.uid()
    )
  );

-- Players can delete their pending bookings
CREATE POLICY "Players can delete their pending bookings"
  ON session_bookings FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM player_profiles WHERE player_profiles.id = session_bookings.player_id AND player_profiles.user_id = auth.uid())
    AND status = 'pending'
  );

-- ----------------------------------------------------------------------------
-- 6. UPDATED_AT TRIGGERS
-- ----------------------------------------------------------------------------

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_trainers_updated_at ON trainers;
DROP TRIGGER IF EXISTS update_training_sessions_updated_at ON training_sessions;
DROP TRIGGER IF EXISTS update_session_bookings_updated_at ON session_bookings;

-- Create triggers for all tables
CREATE TRIGGER update_trainers_updated_at
  BEFORE UPDATE ON trainers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_bookings_updated_at
  BEFORE UPDATE ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- MIGRATION COMPLETE
-- ----------------------------------------------------------------------------

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Trainer role migration complete!';
  RAISE NOTICE 'Tables created: trainers, training_sessions, session_bookings';
  RAISE NOTICE 'RLS policies applied to all tables';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create storage buckets: trainer-videos, trainer-photos, session-media';
  RAISE NOTICE '2. Configure bucket policies for authenticated uploads';
  RAISE NOTICE '3. Update application to support trainer user type';
END
$$;
