-- Allow authenticated users to upload images for smart edit mode
-- This relaxes the restriction to allow uploads to any website folder
DROP POLICY IF EXISTS "Authenticated users can upload website imports" ON storage.objects;

CREATE POLICY "Authenticated users can upload website imports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-imports'
);
