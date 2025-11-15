-- Fix RLS policy for profile photo uploads in player-media storage bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload to their own profile folder" ON storage.objects;

-- Create policy to allow authenticated users to upload to their own player profile folder
CREATE POLICY "Allow users to upload to their own profile folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'player-media'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Create policy to allow authenticated users to update their own profile photos
CREATE POLICY "Allow users to update their own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'player-media'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM player_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'player-media'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
