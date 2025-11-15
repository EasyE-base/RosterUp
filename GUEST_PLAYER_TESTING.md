# Guest Player Feature - Complete Testing Guide

## 🎯 Quick Start

The guest player feature is now **team-based**:
- Teams registered for tournaments can invite guest players
- Players can apply to tournaments and receive invitations
- Complete flow: Apply → Invite → Accept/Decline

---

## Prerequisites

You need TWO different browser sessions (or browsers) for testing:

### Session 1: Organization Account (Team Manager)
- Must have an organization created
- Must have at least one team
- Team must be registered for a tournament

### Session 2: Player Account
- Must have a player profile created
- Complete with sport, age group, etc.

---

## Manual Testing Steps

### STEP 1: Create Test Accounts via UI

**Create Organization Account:**
1. Open http://localhost:5173
2. Sign up / Create account
3. Select "Organization" account type
4. Complete onboarding
5. Create an organization (e.g., "Test Softball Org")
6. Create a team (e.g., "Elite Squad", Sport: Softball, Age: 16U)

**Create Player Account (in different browser/incognito):**
1. Open http://localhost:5173
2. Sign up / Create account  
3. Select "Player" account type
4. Complete player profile (Sport: Softball, Age: 16U)

### STEP 2: Create Tournament

**As Organization Account:**
1. Navigate to Tournaments
2. Create New Tournament:
   - Title: "Guest Player Test Tournament"
   - Sport: Softball
   - Age Group: 16U
   - Status: **Open** (important!)
   - Fill in other required fields
3. Save tournament
4. **Copy the tournament ID from the URL**

### STEP 3: Register Team for Tournament

**Still as Organization:**
1. Go to your tournament page
2. Register your team for the tournament
3. Verify team appears in participants

### STEP 4: Player Applies as Guest Player

**Switch to Player Account:**
1. Navigate to: `http://localhost:5173/tournaments/[TOURNAMENT_ID]`
2. Scroll to guest player section
3. Click "Apply as Guest Player"
4. **Verify:**
   - Button changes to "Waiting for Team Invites"
   - Yellow status message appears
   - "Withdraw Application" option available

### STEP 5: Team Manager Views Guest Players

**Switch back to Organization Account:**
1. Navigate to: `http://localhost:5173/tournaments/[TOURNAMENT_ID]`
2. **Look for "Guest Players" button**
   - Should be cyan/blue gradient
   - Should appear ONLY if team is registered
3. Click "Guest Players" button
4. **Verify you see:**
   - URL: `/tournaments/[ID]/guest-players`
   - Header: "Guest Players"
   - Badge: "Inviting for: [Your Team Name]"
   - Stats dashboard:
     - Available Guest Players: 1
     - Invited by Your Team: 0
     - Invited by Other Teams: 0
   - Player card with full profile
   - "Invite to Team" button

### STEP 6: Invite the Guest Player

**Still as Organization:**
1. Click "Invite to Team" on the player card
2. **Verify:**
   - Player moves to "Players You Invited" section
   - Stats update (Invited by Your Team: 1)
   - Status shows "INVITED - Awaiting Response"

### STEP 7: Player Accepts Invitation

**Switch to Player Account:**
1. Navigate back to: `http://localhost:5173/tournaments/[TOURNAMENT_ID]`
2. **Verify you see:**
   - "Team Invitation Received!" status
   - Team name displayed
   - "Accept" button (green)
   - "Decline" button (gray)
3. Click "Accept"
4. **Verify:**
   - Status changes to "Joined as Guest Player"
   - Green checkmark appears
   - Shows which team you joined

---

## ✅ Expected Behaviors

### Guest Players Button Visibility
- ✅ Appears only when team is registered for tournament
- ✅ Shows cyan/blue gradient color
- ✅ Positioned next to Edit button

### Guest Player Management Page
- ✅ Shows team name in badge
- ✅ Three stat cards with accurate counts
- ✅ Player cards show full profiles
- ✅ "Invite to Team" invites to YOUR team (no dropdown)
- ✅ Invited players move to separate section

### Player Experience
- ✅ Can apply to tournaments
- ✅ Status updates in real-time
- ✅ Receives invitations from teams
- ✅ Can accept or decline
- ✅ Can withdraw application

---

## 🐛 Troubleshooting

### "Guest Players" button doesn't appear
**Causes:**
- Team not registered for tournament
- Not logged in as organization owner
- Browser cache issue

**Fix:**
1. Verify team registration via tournament page
2. Check browser console for errors
3. Clear cache and reload

### "Your organization does not have a team registered" error
**Fix:**
1. Go back to tournament page
2. Click "Register Team" or apply to tournament
3. Select your team and confirm
4. Return to guest players page

### Player card doesn't show profile info
**Causes:**
- Player profile incomplete
- Database query error

**Fix:**
1. Have player complete their profile
2. Check browser console
3. Verify `player_profiles` table has data

### Stats show incorrect counts
**Causes:**
- Status not updating correctly
- Multiple applications

**Fix:**
1. Refresh the page
2. Check database `guest_players` table
3. Verify status values are correct

---

## 🧪 Testing Checklist

- [ ] Player can apply as guest player
- [ ] "Guest Players" button appears for registered teams
- [ ] Button does NOT appear for non-registered teams  
- [ ] Team manager sees correct stats
- [ ] Player cards show complete profiles
- [ ] Invite button works
- [ ] Player receives invitation
- [ ] Accept button works
- [ ] Decline button works
- [ ] Status updates correctly
- [ ] Multiple guest players can apply
- [ ] URL navigation works correctly

---

## 📊 Database Quick Check

You can verify the data with these queries in Supabase SQL editor:

```sql
-- Check guest player applications
SELECT 
  gp.*,
  t.title as tournament,
  pp.sport,
  pp.age_group
FROM guest_players gp
JOIN tournaments t ON t.id = gp.tournament_id
JOIN player_profiles pp ON pp.id = gp.player_id;

-- Check tournament participants (teams registered)
SELECT 
  tp.*,
  t.title as tournament,
  tm.name as team_name
FROM tournament_participants tp
JOIN tournaments t ON t.id = tp.tournament_id
JOIN teams tm ON tm.id = tp.team_id;
```

---

## 🎉 Success!

If all steps work correctly, you've successfully tested the team-based guest player feature!

The key differences from the original design:
- ✅ TEAM-BASED (not host-based)
- ✅ No team selection dropdown
- ✅ Auto-detects registered team
- ✅ Only registered teams can invite
- ✅ Multiple teams can compete for players

---

## 📝 Notes

- Feature is fully implemented in `/src/pages/TournamentGuestPlayers.tsx`
- Player button is in `/src/components/tournaments/GuestPlayerButton.tsx`
- Route: `/tournaments/:id/guest-players`
- Database table: `guest_players`
- Requires RLS policies for access control

---

Happy Testing! 🚀
