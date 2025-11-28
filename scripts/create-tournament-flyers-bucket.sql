-- Create Storage Bucket for Tournament Flyers
-- Run this in Supabase Dashboard > SQL Editor

-- Create the bucket (public access for viewing flyers)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament-flyers', 'tournament-flyers', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow organizations to upload tournament flyers
CREATE POLICY "Organizations can upload tournament flyers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tournament-flyers' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'organization'
  )
);

-- Allow organizations to update their own flyers
CREATE POLICY "Organizations can update their tournament flyers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tournament-flyers' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'organization'
  )
);

-- Allow organizations to delete their own flyers
CREATE POLICY "Organizations can delete their tournament flyers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tournament-flyers' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'organization'
  )
);

-- Allow everyone to view tournament flyers (bucket is public)
CREATE POLICY "Anyone can view tournament flyers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tournament-flyers');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'tournament-flyers';
