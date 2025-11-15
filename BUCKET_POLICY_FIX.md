# 🔐 Storage Bucket Policy Fix

## ✅ Progress So Far

Good news! The bucket exists and is accessible. However, you're getting this error:

```
❌ new row violates row-level security policy
```

This means the bucket needs **upload permissions** configured.

---

## 🚀 Quick Fix - Add Upload Permissions

### Option 1: Make Bucket Public (Easiest - Recommended)

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/storage/buckets

2. Find the `website-assets` bucket

3. Click the **three dots (•••)** or **Settings** icon next to the bucket

4. Click **"Edit bucket"**

5. **Important**: Make sure these settings are configured:
   ```
   ✅ Public bucket: ON (toggle should be blue/green)
   ✅ File size limit: 10 MB (or higher)
   ✅ Allowed MIME types: (leave empty or add: image/*)
   ```

6. Click **"Save"**

7. **Additional Step - Policies Tab:**
   - Click on the `website-assets` bucket
   - Go to the **"Policies"** tab at the top
   - You should see something like "No policies" or existing policies

8. **If no policies exist**, click **"New Policy"** and select:
   - **Template**: "Allow public read-only access"
   - This creates a policy that allows anyone to read files

9. **For upload access**, you have two options:

### Option A: Allow All Uploads (Simple but less secure)

Click **"New Policy"** → **"Create a policy from scratch"**

```sql
-- Policy name: Allow public uploads
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'website-assets');
```

### Option B: Allow Authenticated Uploads (More secure - Recommended)

```sql
-- Policy name: Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'website-assets');
```

---

## Option 2: Use SQL Editor (Advanced)

If you prefer, run these SQL commands in the Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql

2. Click **"New query"**

3. Paste this SQL:

```sql
-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public to read files (view images)
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'website-assets');

-- Policy 2: Allow authenticated users to upload
CREATE POLICY "Authenticated upload access"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'website-assets');

-- Policy 3: Allow authenticated users to update their files
CREATE POLICY "Authenticated update access"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'website-assets')
WITH CHECK (bucket_id = 'website-assets');

-- Policy 4: Allow authenticated users to delete their files
CREATE POLICY "Authenticated delete access"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'website-assets');
```

4. Click **"Run"** (or press Cmd/Ctrl + Enter)

5. You should see: "Success. No rows returned"

---

## Option 3: Quick Public Access (Fastest)

If you just want to test quickly and worry about security later:

1. Go to the bucket settings
2. Make sure **"Public bucket"** is toggled **ON**
3. In the Policies tab, add this single permissive policy:

```sql
CREATE POLICY "Allow all operations"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'website-assets')
WITH CHECK (bucket_id = 'website-assets');
```

⚠️ **Warning**: This allows anyone to upload/delete files. Only use for testing!

---

## 🧪 Test After Setup

After setting up the policies:

1. **Refresh your browser** (Cmd/Ctrl + R)

2. **Try uploading** the image again

3. **Expected console output**:
   ```
   🚀 [DEBUG] Upload started
   ✅ [DEBUG] Validation passed
   🔌 [DEBUG] Checking Supabase connection...
   🪣 [DEBUG] Testing direct access to "website-assets" bucket...
   ✅ [DEBUG] Bucket "website-assets" exists and is accessible!
   ✅ [DEBUG] Supabase storage ready for upload
   📤 [DEBUG] Upload details: {...}
   ✅ [DEBUG] Upload successful: {...}
   🔗 [DEBUG] Getting public URL...
   ✅ [DEBUG] Public URL generated: https://...
   🎉 [DEBUG] Upload completed successfully!
   ```

4. **You should see**:
   - ✅ Green toast: "Image uploaded successfully!"
   - ✅ Green checkmark animation
   - ✅ Image displays immediately

---

## 🔍 Verify Policies Were Created

After running the SQL, verify the policies:

1. Go to **Storage** → `website-assets` → **Policies** tab

2. You should see 4 policies listed:
   - ✅ Public read access
   - ✅ Authenticated upload access
   - ✅ Authenticated update access
   - ✅ Authenticated delete access

3. Each policy should show:
   - Status: **Enabled** ✅
   - Table: `storage.objects`
   - Action: SELECT, INSERT, UPDATE, or DELETE

---

## 🎯 Why This Happens

When you create a storage bucket in Supabase, **Row-Level Security (RLS)** is enabled by default for security. This means:

- ✅ **Good**: Prevents unauthorized access to your data
- ❌ **Issue**: Blocks all operations until you create policies

**RLS Policies** define who can:
- **SELECT**: View/read files
- **INSERT**: Upload new files
- **UPDATE**: Modify existing files
- **DELETE**: Remove files

---

## 🛡️ Recommended Security Setup

For a production website builder:

```sql
-- Public can view all images (needed for your website)
CREATE POLICY "Public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-assets');

-- Only authenticated users can upload
CREATE POLICY "Auth upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'website-assets');

-- Users can only delete their own files
CREATE POLICY "Auth delete own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'website-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

This ensures:
- ✅ Anyone can view images on your website
- ✅ Only logged-in users can upload
- ✅ Users can only delete their own uploads

---

## ❓ Troubleshooting

### Still getting RLS error after adding policies?

1. **Wait 5-10 seconds** for policies to propagate
2. **Refresh your browser** completely
3. **Check policies are enabled** in Supabase Dashboard
4. **Verify bucket is public** (toggle in bucket settings)

### Policy creation failed?

- Make sure you're using the **SQL Editor** (not the Query tab)
- Policies might already exist (you'll see "already exists" error - that's OK)
- Try dropping existing policies first:
  ```sql
  DROP POLICY IF EXISTS "Public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated upload access" ON storage.objects;
  ```

### Still not working?

Share the error message from browser console and I'll help debug further.

---

## ✅ Success Checklist

Before testing:

- [ ] Bucket `website-assets` exists
- [ ] Bucket is set to **Public** (toggle ON)
- [ ] At least 2 policies created:
  - [ ] Public read (SELECT)
  - [ ] Authenticated upload (INSERT)
- [ ] Browser refreshed after policy changes
- [ ] You're logged into the app (authenticated)

Once all checked, the upload should work! 🚀
