-- Create storage bucket for imported website assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-imports',
  'website-imports',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for website-imports bucket

-- Allow public read access (since bucket is public)
CREATE POLICY "Public read access for website imports"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-imports');

-- Allow authenticated users to upload to their organization's folder
CREATE POLICY "Authenticated users can upload website imports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-imports' AND
  (storage.foldername(name))[1] IN (
    SELECT ow.id::text
    FROM organization_websites ow
    JOIN organizations o ON ow.organization_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- Allow authenticated users to update their organization's images
CREATE POLICY "Authenticated users can update their website imports"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'website-imports' AND
  (storage.foldername(name))[1] IN (
    SELECT ow.id::text
    FROM organization_websites ow
    JOIN organizations o ON ow.organization_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- Allow authenticated users to delete their organization's images
CREATE POLICY "Authenticated users can delete their website imports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'website-imports' AND
  (storage.foldername(name))[1] IN (
    SELECT ow.id::text
    FROM organization_websites ow
    JOIN organizations o ON ow.organization_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- Allow service role full access (for Edge Functions)
CREATE POLICY "Service role has full access to website imports"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'website-imports')
WITH CHECK (bucket_id = 'website-imports');
