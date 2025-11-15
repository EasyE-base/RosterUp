# Supabase Storage Setup Guide

## Image Upload Configuration

The website builder uses Supabase Storage for image uploads. Follow these steps to ensure images upload correctly:

### 1. Create the Storage Bucket

1. Go to your Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Name it: `website-assets`
4. Set **Public bucket** to `ON` (so images are publicly accessible)
5. Click **Create bucket**

### 2. Configure Bucket Policies (if using RLS)

If you need more control over who can upload, you can use Row Level Security:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'website-assets');

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-assets');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'website-assets');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'website-assets');
```

### 3. Folder Structure

Images will be automatically organized in the bucket:
```
website-assets/
└── website-images/
    ├── 1699564234567-abc123.jpg
    ├── 1699564789012-def456.png
    └── ...
```

### 4. Testing the Upload

1. Go to your website builder in edit mode
2. Try uploading an image (max 10MB)
3. Check the browser console for detailed logs:
   - "Starting upload for file..."
   - "Uploading to path..."
   - "Upload successful, getting public URL..."
   - "Public URL: ..."

### 5. Troubleshooting

**Issue: "Failed to upload image"**
- **Solution**: Check that the `website-assets` bucket exists in Supabase Storage
- Verify the bucket is set to Public

**Issue: "Row Level Security policy violation"**
- **Solution**: Make sure you're authenticated, or disable RLS on the bucket for testing

**Issue: "File size exceeds 10MB limit"**
- **Solution**: Compress your image or use a smaller file
- You can change the limit in `DragDropImageUpload.tsx` (line 73)

**Issue: Images upload but don't display**
- **Solution**: Check that the bucket is set to Public
- Verify the public URL is correct in the browser console

### 6. File Limits

Current configuration:
- **Max file size**: 10MB
- **Allowed types**: All image types (jpg, png, gif, webp, svg, etc.)
- **Naming**: Timestamp + random string to prevent conflicts

### 7. CDN & Performance

Supabase Storage automatically provides:
- ✅ CDN delivery for fast image loading
- ✅ Automatic image optimization (if enabled in settings)
- ✅ Cache headers (set to 1 hour by default)

### 8. Production Checklist

Before going live, ensure:
- [ ] Storage bucket `website-assets` exists
- [ ] Bucket is set to Public
- [ ] RLS policies are configured (if needed)
- [ ] Test image upload and display
- [ ] Images load quickly from CDN
- [ ] Console shows no errors

## Alternative: Use Existing Bucket

If you already have a bucket for images, update the bucket name in:
`src/components/website-builder/inline-editing/DragDropImageUpload.tsx`

Line 97 and 113:
```typescript
.from('website-assets')  // Change to your bucket name
```
