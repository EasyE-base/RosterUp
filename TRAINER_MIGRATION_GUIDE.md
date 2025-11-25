# Trainer Role Migration Guide

## Quick Start

### Step 1: Apply Database Migration

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql/new

2. **Copy Migration SQL:**
   - Open file: `supabase/migrations/20250116000000_add_trainer_role.sql`
   - Copy the entire contents (360 lines)

3. **Run Migration:**
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for confirmation message

### Step 2: Create Storage Buckets

Go to: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/storage/buckets

#### Bucket 1: trainer-videos
```
Name: trainer-videos
Public: ✅ Yes
File size limit: 500 MB
Allowed MIME types: video/mp4, video/quicktime, video/webm
```

#### Bucket 2: trainer-photos
```
Name: trainer-photos
Public: ✅ Yes
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

#### Bucket 3: session-media
```
Name: session-media
Public: ✅ Yes
File size limit: 500 MB
Allowed MIME types: image/*, video/*
```

### Step 3: Configure Storage Policies

For **each bucket**, add these RLS policies:

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'trainer-videos'); -- Change bucket name for each
```

#### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trainer-videos' -- Change bucket name for each
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Users Update Own Files
```sql
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'trainer-videos' -- Change bucket name for each
  AND auth.uid() = owner
);
```

#### Policy 4: Users Delete Own Files
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trainer-videos' -- Change bucket name for each
  AND auth.uid() = owner
);
```

---

## What This Migration Does

### Database Changes

✅ **Adds 'trainer' to user_type enum**
- Profiles table now supports: 'organization', 'player', 'trainer'

✅ **Creates `trainers` table**
- Profile info: intro_video_url, headshot_url, bio, tagline
- Background: athletic_background, coaching_background (JSONB timelines)
- Credentials: certifications (JSONB array)
- Sports & specializations: sports[], specializations[]
- Location: latitude, longitude, travel_radius_miles, fixed_locations, service_areas
- Pricing: pricing_info (JSONB)
- Featured: is_featured, featured_priority, featured_start_date, featured_end_date
- Stats: total_sessions, rating, total_reviews

✅ **Creates `training_sessions` table**
- Session details: title, description, sport, session_type
- Rich media: banner_image_url, promo_video_url
- Specs: duration_minutes, max_participants, skill_level
- Pricing: price_per_person, price_per_session
- Location: location_type, location_data (JSONB)
- Scheduling: is_recurring, recurring_schedule
- Availability: is_active, available_spots

✅ **Creates `session_bookings` table**
- Booking info: session_id, player_id, status
- Scheduling: requested_date, requested_time, confirmed_date, confirmed_time
- Communication: player_message, trainer_response
- Payment: total_amount, payment_status (future use)

✅ **Row Level Security (RLS) Policies**
- Trainers: Public view, owner insert/update/delete
- Sessions: Public view (active), owner create/update/delete
- Bookings: Players and trainers can view/manage their own

✅ **Performance Indexes**
- trainers: user_id, is_featured, sports (GIN), location
- training_sessions: trainer_id, sport, session_type, is_active
- session_bookings: session_id, player_id, status

✅ **Triggers**
- Auto-update `updated_at` timestamps on all tables

---

## Storage Bucket Structure

### trainer-videos
```
trainer-videos/
├── {user_id}/
│   ├── intro-video.mp4           # Profile intro video
│   └── certification-demo.mp4     # Optional cert demos
```

### trainer-photos
```
trainer-photos/
├── {user_id}/
│   ├── headshot.jpg               # Profile photo
│   ├── cert-{id}.jpg              # Certification images
│   └── action-{id}.jpg            # Action shots (optional)
```

### session-media
```
session-media/
├── {trainer_id}/
│   ├── sessions/
│   │   ├── {session_id}-banner.jpg    # Session banner image
│   │   └── {session_id}-promo.mp4     # Session promo video
```

---

## Verification Checklist

After running the migration, verify:

- [ ] `profiles.user_type` enum includes 'trainer'
- [ ] `trainers` table exists with all columns
- [ ] `training_sessions` table exists with all columns
- [ ] `session_bookings` table exists with all columns
- [ ] RLS policies are enabled on all 3 tables
- [ ] Indexes are created for performance
- [ ] Triggers are set up for `updated_at`
- [ ] Storage buckets created: trainer-videos, trainer-photos, session-media
- [ ] RLS policies configured for all 3 buckets

---

## Rollback (if needed)

If you need to undo this migration:

```sql
-- Drop tables (will cascade delete policies and indexes)
DROP TABLE IF EXISTS session_bookings;
DROP TABLE IF EXISTS training_sessions;
DROP TABLE IF EXISTS trainers;

-- Note: Cannot remove enum value once added
-- You would need to recreate the enum type to remove 'trainer'
```

---

## Next Steps

After completing this migration:

1. ✅ Update frontend to show Trainer option in SelectUserType
2. ✅ Create TrainerOnboarding component
3. ✅ Update AuthContext to load trainer data
4. ✅ Build trainer dashboard
5. ✅ Create session management UI
6. ✅ Build trainer marketplace
7. ✅ Add calendar integration

See main implementation plan in conversation history for full roadmap.

---

## Support

Questions? Issues?
- Check Supabase logs for error details
- Verify RLS policies are correct
- Ensure storage buckets are public
- Test with authenticated user account

---

**Migration Created:** 2025-01-16
**File:** `supabase/migrations/20250116000000_add_trainer_role.sql`
**Lines:** 360
**Size:** ~13.6 KB
