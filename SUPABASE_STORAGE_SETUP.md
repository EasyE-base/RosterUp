# 🪣 Supabase Storage Setup Guide

This guide will help you set up the `website-assets` storage bucket required for image uploads in your website builder.

---

## 📋 Prerequisites

- [ ] Supabase project created
- [ ] Supabase credentials added to `.env` file:
  ```env
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project from the dashboard

### Step 2: Navigate to Storage

1. In the left sidebar, click on **"Storage"** icon (looks like a folder)
2. You should see the Storage page with existing buckets (if any)

### Step 3: Create New Bucket

1. Click the **"New bucket"** button (top right)
2. Fill in the bucket details:

   **Bucket Configuration:**
   ```
   Name: website-assets
   Public bucket: ✅ ENABLED (toggle ON)
   File size limit: 10 MB (or higher if needed)
   Allowed MIME types: Leave empty (allows all image types)
   ```

3. Click **"Create bucket"**

### Step 4: Configure Bucket Policies

The bucket should now be created! Verify the following settings:

1. Click on the `website-assets` bucket
2. Go to **"Policies"** tab
3. You should see policies for public access

**If no policies exist, create them:**

#### Policy 1: Public Read Access
```sql
-- Allow public to read all files
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-assets');
```

#### Policy 2: Authenticated Upload
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'website-assets');
```

#### Policy 3: Authenticated Delete (Optional)
```sql
-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'website-assets');
```

### Step 5: Verify Setup

1. Go back to **Storage** in the sidebar
2. Click on `website-assets` bucket
3. You should see an empty folder view
4. The bucket is ready to receive uploads!

---

## 🧪 Testing the Setup

### Option 1: Test in Your App

1. Make sure your dev server is running:
   ```bash
   pnpm run dev
   ```

2. Open your website builder at `http://localhost:5173`

3. Enter **Edit Mode** on any page

4. Try uploading an image using the drag & drop component

5. Open browser console (F12) to see detailed debug logs:
   ```
   🚀 [DEBUG] Upload started
   📁 [DEBUG] File details: {...}
   🔌 [DEBUG] Checking Supabase connection...
   🗂️ [DEBUG] Available buckets: ['website-assets']
   🪣 [DEBUG] Bucket 'website-assets' exists: true
   ✅ [DEBUG] Supabase connection verified
   📤 [DEBUG] Upload details: {...}
   ✅ [DEBUG] Upload successful
   🎉 [DEBUG] Upload completed successfully!
   ```

### Option 2: Manual Test via Supabase Dashboard

1. Go to **Storage** > `website-assets`
2. Click **"Upload files"** button
3. Select any image from your computer
4. Upload should succeed
5. You should see the image listed in the bucket

---

## 🔧 Troubleshooting

### ❌ Error: "Bucket 'website-assets' not found"

**Solution:**
- Verify bucket name is exactly `website-assets` (lowercase, with hyphen)
- Check that the bucket exists in Supabase Dashboard > Storage
- Refresh the page and try again

### ❌ Error: "403 Forbidden" or "Permission denied"

**Solution:**
- Check that the bucket is set to **Public**
- Verify RLS policies are created (see Step 4)
- Make sure you're authenticated in the app

### ❌ Error: "Failed to upload image" (generic error)

**Solution:**
1. Open browser console (F12)
2. Look for detailed debug logs with emoji icons (🚀, 📁, etc.)
3. Check the specific error message in red text
4. Common issues:
   - File too large (max 10MB)
   - Wrong file type (must be an image)
   - Network issues (check internet connection)

### ❌ Error: "Supabase connection error"

**Solution:**
- Verify `.env` file has correct Supabase credentials:
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```
- Restart your dev server after changing `.env`:
  ```bash
  # Stop the server (Ctrl+C)
  pnpm run dev
  ```

### ❌ Images upload but don't display

**Solution:**
- Check that bucket is set to **Public**
- Verify the image URL in browser console
- Try accessing the URL directly in a new tab
- Clear browser cache

---

## 📁 Bucket Structure

After setup, your files will be organized like this:

```
website-assets/
└── website-images/
    ├── 1699123456789-a1b2c3.jpg
    ├── 1699123457890-d4e5f6.png
    └── 1699123458901-g7h8i9.webp
```

- **Bucket**: `website-assets`
- **Folder**: `website-images/` (auto-created)
- **Files**: Timestamped with random IDs to prevent collisions

---

## 🔐 Security Best Practices

### ✅ Do's

- ✅ Set reasonable file size limits (10MB default)
- ✅ Use authenticated policies for uploads
- ✅ Enable RLS (Row Level Security) policies
- ✅ Validate file types on client and server
- ✅ Use public bucket only for public website assets

### ❌ Don'ts

- ❌ Don't store sensitive files in public buckets
- ❌ Don't allow anonymous uploads without rate limiting
- ❌ Don't use overly permissive RLS policies
- ❌ Don't forget to set file size limits

---

## 🎯 Advanced Configuration

### Custom File Size Limit

To change the 10MB file size limit:

1. Go to **Storage** > `website-assets`
2. Click **Settings** (gear icon)
3. Change **File size limit** to desired value
4. Update the validation in `DragDropImageUpload.tsx`:
   ```typescript
   const maxSize = 20 * 1024 * 1024; // 20MB
   ```

### Image Optimization

For better performance, consider:

1. **Enable image transformations** in Supabase:
   ```typescript
   const { data } = supabase.storage
     .from('website-assets')
     .getPublicUrl(filePath, {
       transform: {
         width: 1200,
         height: 800,
         resize: 'cover',
         quality: 80
       }
     });
   ```

2. **Use WebP format** for smaller file sizes:
   - Convert images to WebP before upload
   - Or use Supabase image transformations to auto-convert

### CDN Configuration

For production, enable CDN:

1. Go to **Project Settings** > **Storage**
2. Enable **CDN caching**
3. Set cache TTL (default: 3600 seconds)
4. Your images will be served faster globally

---

## 📊 Storage Quotas

### Free Plan Limits

- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File uploads**: Unlimited

### Monitor Usage

1. Go to **Project Settings** > **Usage**
2. Check **Storage** section
3. View breakdown:
   - Storage used
   - Bandwidth consumed
   - Files uploaded

---

## ✅ Verification Checklist

Before deploying to production:

- [ ] `website-assets` bucket created
- [ ] Bucket set to **Public**
- [ ] RLS policies configured
- [ ] Test upload successful in dev
- [ ] Browser console shows no errors
- [ ] Uploaded images display correctly
- [ ] `.env` variables are correct
- [ ] File size limits are reasonable
- [ ] CDN enabled (for production)

---

## 🆘 Still Having Issues?

If you've followed all steps and still can't upload images:

1. **Check browser console** for detailed debug logs
2. **Share the debug output** (copy the logs starting with emoji icons)
3. **Verify Supabase project status** at status.supabase.com
4. **Check your internet connection**
5. **Try a different browser** to rule out browser issues

### Debug Information to Collect

When reporting issues, include:

- Browser console logs (especially lines with 🚀, ❌, etc.)
- Screenshot of Supabase Storage dashboard
- Contents of `.env` file (hide sensitive keys)
- Network tab showing failed requests (if any)

---

## 🎉 Success!

Once setup is complete, you'll be able to:

- ✅ Upload images via drag & drop
- ✅ Upload images via file picker
- ✅ Search Unsplash for stock images (coming soon)
- ✅ Manage uploaded images
- ✅ Use images in all section templates

Your website builder now has **professional-grade image management**! 🚀

---

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Storage Best Practices](https://supabase.com/docs/guides/storage/best-practices)
