# Guest Roster Feature - Database Migration Instructions

## Overview
This feature allows teams to add players to their roster without requiring them to have RosterUp accounts. Guest players can be added manually with all relevant information, and can be seamlessly linked to their account later when/if they sign up.

## Migration Required

**IMPORTANT**: You must run the database migration before this feature will work.

### Option 1: Using Supabase Dashboard (Recommended)
1. Log into your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of: `supabase/migrations/20251123000000_add_guest_roster_players.sql`
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI
```bash
# If using local Supabase
npx supabase db reset

# If using remote Supabase
npx supabase db push
```

## What the Migration Does

1. **Makes `player_id` nullable** in `team_members` table
2. **Adds guest player fields**:
   - `is_guest` (boolean)
   - `guest_first_name` (text)
   - `guest_last_name` (text)
   - `guest_email` (text, optional)
   - `guest_photo_url` (text)
   - `guest_date_of_birth` (date, optional)
   - `guest_notes` (text, optional)

3. **Adds constraint**: Ensures either `player_id` OR guest info is present
4. **Creates indexes** for efficient guest player queries

## How to Use

### Adding a Guest Player
1. Navigate to Team Management > Roster tab
2. Click **Add Player**
3. Switch to **Add Guest Player** tab
4. Fill in player information:
   - First Name & Last Name (required)
   - Email (optional - used for future account linking)
   - Date of Birth (optional)
   - Position & Jersey Number
   - Photo upload
   - Notes
5. Click **Add Player**

### Guest Player Display
- Guest players appear in the roster with a blue "Guest" badge
- They display normally on the public team profile
- Photos upload to `team-assets/roster-photos/{team-id}/`

## Future Account Linking

When a player with a matching email signs up for RosterUp, the system can automatically link their account to existing guest roster entries. This functionality can be:

1. **Manual**: Organization admins can link accounts from the roster management view
2. **Automatic** (future): System checks for matching emails on signup

The linking utility is available at: `src/lib/playerLinking.ts`

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Can add a guest player with photo
- [ ] Guest player appears in TeamDetails roster with "Guest" badge
- [ ] Guest player appears on public TeamProfile
- [ ] Can remove guest players
- [ ] Photos display correctly for guest players
- [ ] Search for existing players still works
- [ ] Can add both guest and registered players to same team

## Troubleshooting

**Error: "player_id" violates not-null constraint**
- Migration hasn't been run yet. Run the SQL migration first.

**Guest player photos not showing**
- Check that the `team-assets` storage bucket exists and is accessible
- Verify RLS policies allow public access to `roster-photos/` path

**Can't see "Add Guest Player" tab**
- Ensure you're logged in as an organization admin
- Check browser console for any JavaScript errors
