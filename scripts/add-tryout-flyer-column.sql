-- Add flyer_url column to tryouts table
-- Run this in Supabase Dashboard > SQL Editor

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tryouts'
    AND column_name = 'flyer_url'
  ) THEN
    ALTER TABLE tryouts ADD COLUMN flyer_url TEXT;
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tryouts'
AND column_name = 'flyer_url';
