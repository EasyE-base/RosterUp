-- RLS Policies for team-assets storage bucket

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload team assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-assets');

-- Allow public read access to team assets
CREATE POLICY "Allow public read access to team assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'team-assets');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update team assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'team-assets')
WITH CHECK (bucket_id = 'team-assets');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete team assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'team-assets');
