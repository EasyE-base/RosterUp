-- Fix for Smart Edit Mode Image Upload
-- This script creates the website-imports storage bucket and sets up RLS policies

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('website-imports', 'website-imports', true, 10485760)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- Step 2: Create RLS policy for authenticated uploads
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'website-imports');

-- Step 3: Create RLS policy for public reads
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-imports');

-- Step 4: Create RLS policy for authenticated updates
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'website-imports');

-- Step 5: Create RLS policy for authenticated deletes
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'website-imports');
