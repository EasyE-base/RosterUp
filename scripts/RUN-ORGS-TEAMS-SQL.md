# Create 10 Organizations and Teams

## Issue
RLS (Row Level Security) policies are blocking programmatic creation of organizations. The service role key is invalid/rotated, so we need to run the SQL directly in the Supabase Dashboard.

## Instructions

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select project: `hnaqmskjbsrltdcvinai`
   - Navigate to: **SQL Editor** (left sidebar)

2. **Run the SQL:**
   - Click **New Query**
   - Copy the contents of `create-10-orgs-and-teams-v2.sql`
   - Paste into the SQL editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

3. **Verify Results:**
   You should see:
   - 10 organizations created (Lady Bandits, Flemington Flames, etc.)
   - 10 teams created (one per organization)
   - Verification query showing all organizations with their teams

## What This Creates

**10 Softball Organizations:**
1. Lady Bandits Softball (Baltimore, Maryland)
2. Flemington Flames (Flemington, New Jersey)
3. Maryland Sting Softball (Annapolis, Maryland)
4. Neshaminy Shock Travel Softball (Langhorne, Pennsylvania)
5. Bama Slammers Fastpitch (Philadelphia, Pennsylvania)
6. Boom Williston Fastpitch (Wilmington, Delaware)
7. Ohio Lasers Softball (Richmond, Virginia)
8. Worthington Spirit Softball (Arlington, Virginia)
9. Storm Travel Softball (Dover, Delaware)
10. Illinois Lightning Travel Softball (Trenton, New Jersey)

**10 Teams (one per org):**
- Mixed age groups: 12U, 14U, 16U, 18U
- Mixed classifications: A, B, C
- All active for Spring 2025 season

## Next Steps

After running the SQL:
1. Run `update-org-logos.sql` to add logo URLs
2. Navigate to http://localhost:5173/organizations to verify
3. Check that logos display correctly

## Error Reference

If you see this error, you're in the right place:
```
Error: new row violates row-level security policy for table "organizations"
```

This means programmatic creation is blocked and you need to use the Dashboard.
