-- Create trainer_availability table for managing trainer time slots
CREATE TABLE IF NOT EXISTS trainer_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT true, -- true for weekly recurring, false for one-time
  specific_date DATE, -- used only when is_recurring = false
  location_type VARCHAR(20) CHECK (location_type IN ('home', 'travel', 'virtual', 'any')),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraint to ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create index for efficient querying
CREATE INDEX idx_trainer_availability_trainer ON trainer_availability(trainer_id);
CREATE INDEX idx_trainer_availability_day ON trainer_availability(day_of_week);
CREATE INDEX idx_trainer_availability_active ON trainer_availability(is_active);

-- Enable RLS
ALTER TABLE trainer_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view active availability for any trainer
CREATE POLICY "Anyone can view active availability"
  ON trainer_availability FOR SELECT
  USING (is_active = true);

-- Trainers can manage their own availability
CREATE POLICY "Trainers can manage own availability"
  ON trainer_availability FOR ALL
  USING (
    trainer_id IN (
      SELECT id FROM trainers WHERE user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_trainer_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trainer_availability_updated_at
  BEFORE UPDATE ON trainer_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_trainer_availability_updated_at();

-- Add comments for documentation
COMMENT ON TABLE trainer_availability IS 'Stores trainer availability time slots for scheduling';
COMMENT ON COLUMN trainer_availability.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
COMMENT ON COLUMN trainer_availability.is_recurring IS 'True for weekly recurring slots, false for specific date only';
COMMENT ON COLUMN trainer_availability.specific_date IS 'Used only when is_recurring=false for one-time availability';
COMMENT ON COLUMN trainer_availability.location_type IS 'Where the trainer is available: home, travel, virtual, or any';
