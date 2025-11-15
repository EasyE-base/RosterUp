# Player Profile Enhancement - Setup Instructions

## Phase 1: Database Migration

### Step 1: Run the SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `player-profile-enhancement-migration.sql`
6. Paste into the SQL Editor
7. Click **Run** to execute the migration

This will create all the new tables:
- `player_media` - Photos, videos, documents
- `player_statistics` - Season and career stats
- `player_achievements` - Awards and records
- `player_physical_measurements` - Athletic metrics
- `player_team_history` - Team and tournament history
- `coach_interests` - Recruiting tracking
- `player_profile_views` - Analytics

### Step 2: Verify Migration

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'player_%'
ORDER BY table_name;
```

You should see all the new tables listed.

## Phase 2: Supabase Storage Setup

### Step 1: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage** in the left sidebar
2. Click **New bucket**
3. Bucket name: `player-media`
4. Public bucket: **No** (keep private, controlled by RLS)
5. Click **Create bucket**

### Step 2: Create Folder Structure

1. Click on the `player-media` bucket
2. Create three folders:
   - `photos`
   - `videos`
   - `documents`

### Step 3: Set Storage Policies

1. Click on the `player-media` bucket
2. Click **Policies** tab
3. Add the following policies:

#### Policy 1: Players can upload their own media

```sql
CREATE POLICY "Players can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'player-media'
  AND (storage.foldername(name))[1] IN ('photos', 'videos', 'documents')
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

#### Policy 2: Players can update/delete their own media

```sql
CREATE POLICY "Players can update their own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'player-media'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Players can delete their own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'player-media'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

#### Policy 3: Coaches can view player media

```sql
CREATE POLICY "Coaches can view player media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'player-media'
  AND EXISTS (
    SELECT 1 FROM organizations
    WHERE user_id = auth.uid()
  )
);
```

#### Policy 4: Players can view their own media

```sql
CREATE POLICY "Players can view their own media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'player-media'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

### Step 4: Configure File Size Limits

1. Go to **Settings** > **Storage** in Supabase Dashboard
2. Set the following limits:
   - Max file size: **52428800** (50MB)
   - Allowed MIME types:
     - Images: `image/jpeg`, `image/png`, `image/webp`, `image/heic`
     - Videos: `video/mp4`, `video/quicktime`, `video/x-msvideo`
     - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Phase 3: Test the Setup

### Test Database

Run these test queries to ensure the tables work:

```sql
-- Test inserting a media item
INSERT INTO player_media (player_id, media_type, file_url, title)
VALUES ('your-player-id-here', 'photo', 'test-url', 'Test Photo');

-- Test querying
SELECT * FROM player_media LIMIT 1;

-- Clean up test
DELETE FROM player_media WHERE title = 'Test Photo';
```

### Test Storage

1. Try uploading a small test image through the Supabase dashboard
2. Verify the RLS policies are working (you should only see your own files)

## Next Steps

Once the database and storage are set up, the application components will be able to:
- Upload photos, videos, and documents
- Store and retrieve player statistics
- Track achievements and awards
- Record physical measurements
- Manage team history
- Handle coach recruiting interests
- Track profile analytics

## Troubleshooting

### Migration Fails
- Check if any tables already exist
- Look for foreign key constraint errors
- Verify you have proper permissions

### Storage Upload Fails
- Check storage policies are created correctly
- Verify bucket name is exactly `player-media`
- Check file size is under 50MB
- Verify MIME type is allowed

### RLS Policies Not Working
- Ensure RLS is enabled on all tables
- Check that `auth.uid()` is returning a value
- Verify user is authenticated before uploading

## File Storage Path Structure

Files will be stored in this path format:

```
player-media/
  ├── photos/
  │   └── {user_id}/
  │       └── {filename}
  ├── videos/
  │   └── {user_id}/
  │       └── {filename}
  └── documents/
      └── {user_id}/
          └── {filename}
```

Example: `player-media/photos/abc123-def456/profile-photo.jpg`

This ensures:
- Files are organized by type and user
- Users can only access their own files
- Easy to implement cleanup/deletion
- Scalable storage structure
