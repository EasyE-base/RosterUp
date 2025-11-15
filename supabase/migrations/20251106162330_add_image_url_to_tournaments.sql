-- Add image_url column to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS image_url TEXT;
