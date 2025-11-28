-- Create Storage Bucket for Tryout Flyers
-- Run this in Supabase Dashboard > SQL Editor

-- Create the bucket (public access for viewing flyers)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tryout-flyers', 'tryout-flyers', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow organizations to upload flyers
CREATE POLICY "Organizations can upload tryout flyers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tryout-flyers' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'organization'
  )
);

-- Allow organizations to update their own flyers
CREATE POLICY "Organizations can update their tryout flyers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tryout-flyers' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'organization'
  )
);

-- Allow organizations to delete their own flyers
CREATE POLICY "Organizations can delete their tryout flyers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tryout-flyers' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'organization'
  )
);

-- Allow everyone to view tryout flyers (bucket is public)
CREATE POLICY "Anyone can view tryout flyers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tryout-flyers');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'tryout-flyers';
