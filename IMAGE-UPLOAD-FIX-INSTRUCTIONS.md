# Image Upload Fix - Step-by-Step Instructions

## Current Problem
- Image files upload to Supabase Storage successfully ✅
- Database INSERT operations fail with "RLS policy violation" ❌
- Result: Images display as "Image Error" because no database records exist

## Root Cause
The `player_media` table's RLS (Row Level Security) policy is missing the `WITH CHECK` clause, which is required for INSERT operations.

## The Fix

### Step 1: Open Supabase Dashboard
1. Open your web browser
2. Go to: https://supabase.com/dashboard
3. Click on your project (the one with ID: hnaqmskjbsrltdcvinai)

### Step 2: Open SQL Editor
1. Look at the left sidebar
2. Find and click on "SQL Editor" (it has a database icon)
3. Click the green "+ New query" button at the top

### Step 3: Run the Fix SQL
1. Copy this EXACT SQL (select all and copy):

```sql
DROP POLICY IF EXISTS player_media_owner ON player_media;

CREATE POLICY player_media_owner ON player_media
  FOR ALL
  USING (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM player_profiles WHERE user_id = auth.uid()));
```

2. Paste it into the SQL Editor query box
3. Click the "RUN" button (or press Cmd+Enter on Mac / Ctrl+Enter on Windows)
4. You should see: "Success. No rows returned" or similar

### Step 4: Verify It Worked
After running the SQL, test by uploading a new image in your player profile. The image should display correctly instead of showing "Image Error".

## What This SQL Does

- **DROP POLICY**: Removes the old broken policy
- **CREATE POLICY**: Creates a new policy with:
  - `USING` clause: Controls SELECT, UPDATE, DELETE ✅
  - `WITH CHECK` clause: Controls INSERT operations ✅ (THIS WAS MISSING!)

## Evidence of Current Issue

Database Query Result: `0 photos in player_media table`
Storage Files: 4 orphaned files exist but have no database records

Files in storage:
1. `1762749339265-b35onv.jpg`
2. `1762829616437-uavonk.jpg`
3. `1762832628764-7q0vy.jpg`
4. `1762833015687-us2eqr.jpg`

## After the Fix

Once the SQL is run:
- New image uploads will work immediately
- Images will display correctly in the gallery
- You can delete the 4 broken images and re-upload fresh ones

## Need Help?

If you're having trouble finding the SQL Editor or the SQL doesn't run successfully, take a screenshot of:
1. Your Supabase dashboard left sidebar
2. Any error messages you see

The fix MUST be done in the Supabase web dashboard - it cannot be done programmatically through scripts.
