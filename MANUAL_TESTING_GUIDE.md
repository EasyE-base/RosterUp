# Complete Manual Testing Guide
## Guest Player & Team Registration Features

**Generated:** December 12, 2025
**Dev Server:** http://localhost:5173
**Status:** ✅ Features Complete - Ready for Testing

---

## 🎯 What You're Testing

Two major features are ready for testing:

### 1. **Team Registration Feature** (NEW!)
- Organizations can register their teams to JOIN tournaments
- Green "Register Team" button appears on tournament details page
- Team selection modal with sport filtering
- Automatic button state changes after registration

### 2. **Guest Player Feature** (Team-Based Architecture)
- Teams registered for tournaments can invite guest players
- Players apply as guest players for tournaments
- Teams compete to invite players to their rosters
- Players accept/decline team invitations

---

## 📋 Prerequisites

Before you begin testing, you need:
- ✅ Dev server running at http://localhost:5173
- ✅ Two different browser profiles (or one normal + one incognito window)
- ✅ 10-15 minutes for complete testing

---

## 🧪 Test Flow 1: Organization Creates Tournament & Team Registers

### Step 1: Create Organization Account #1 (Tournament Host)

1. **Open browser:** http://localhost:5173
2. **Click:** "Get Started Free" or navigate to `/signup`
3. **Select:** "Organization" account type
4. **Fill in:**
   - Organization Name: `Elite Sports Academy`
   - Email: `test-org-1@example.com` (or your email)
   - Password: `TestPass123!`
5. **Complete onboarding:**
   - Primary Sport: **Softball**
   - Location: Los Angeles, CA
   - Skip optional fields
6. **Save** - You should see the organization dashboard

### Step 2: Create Teams

1. **Navigate to:** Teams section (from dashboard or sidebar)
2. **Click:** "Create Team" or "Add Team"
3. **Create Team #1:**
   - Name: `Elite Softball Squad`
   - Sport: **Softball**
   - Age Group: **16U**
   - Season: Summer 2025
4. **Save Team**
5. **Create Team #2:**
   - Name: `Elite White 14U`
   - Sport: **Softball**
   - Age Group: **14U**
   - Season: Summer 2025
6. **Save Team**

### Step 3: Create Tournament

1. **Navigate to:** Tournaments section
2. **Click:** "Create Tournament" or "Host Tournament"
3. **Fill in tournament details:**
   - Title: `Summer Showcase Tournament 2025`
   - Sport: **Softball**
   - Age Group: **16U**
   - Start Date: (30 days from today)
   - End Date: (32 days from today)
   - Location: Los Angeles, CA
   - Address: 123 Tournament Park Drive
   - Max Teams: 16
   - Entry Fee: $500
   - Status: **Open** (IMPORTANT!)
   - Description: "Premier showcase tournament"
   - Format: Single Elimination
4. **Save Tournament**
5. **Copy the tournament URL** from browser address bar
   - Should look like: `http://localhost:5173/tournaments/{tournament-id}`

### Step 4: Verify "Guest Players" Button (Host View)

1. **Stay on the tournament details page**
2. **You should see:**
   - ✅ "Guest Players" button (cyan/blue)
   - ✅ "Edit" button (gray)
   - ❌ NO "Register Team" button (you're the host)
3. **This is correct!** Hosts see Guest Players by default
4. **Click "Guest Players"** to see the interface (it will be empty for now)

---

## 🧪 Test Flow 2: Different Organization Registers Team

### Step 5: Create Organization Account #2 (Team Registering)

**IMPORTANT:** Use a different browser or incognito window!

1. **Open:** http://localhost:5173 (in new browser/incognito)
2. **Click:** "Get Started Free"
3. **Select:** "Organization" account type
4. **Fill in:**
   - Organization Name: `Champions Athletics`
   - Email: `test-org-2@example.com`
   - Password: `TestPass123!`
5. **Complete onboarding:**
   - Primary Sport: **Softball**
   - Location: San Diego, CA

### Step 6: Create Team for Champions Athletics

1. **Navigate to Teams**
2. **Click:** "Create Team"
3. **Fill in:**
   - Name: `Champions Softball Elite`
   - Sport: **Softball**
   - Age Group: **16U**
   - Season: Summer 2025
4. **Save Team**

### Step 7: Test "Register Team" Button

1. **Navigate to the tournament** you created in Step 3
   - Paste the URL you copied: `http://localhost:5173/tournaments/{tournament-id}`
2. **You should see:**
   - ✅ GREEN "Register Team" button (this is the NEW feature!)
   - ❌ NO "Guest Players" button (you haven't registered yet)
   - ❌ NO "Edit" button (you're not the host)

### Step 8: Register Your Team

1. **Click:** "Register Team" button (green)
2. **Modal opens** with team selection
3. **You should see:**
   - Title: "Select Team to Register"
   - Your team: "Champions Softball Elite (Softball • 16U)"
   - Checkmark icon
4. **Click on your team** in the modal
5. **Loading indicator** appears briefly
6. **Modal closes automatically**
7. **Button changes:**
   - ❌ "Register Team" disappears
   - ✅ "Guest Players" appears (cyan/blue)

**🎉 SUCCESS!** The team registration feature is working!

---

## 🧪 Test Flow 3: Player Applies as Guest Player

### Step 9: Create Player Account

**Use a THIRD browser profile or device!**

1. **Open:** http://localhost:5173
2. **Click:** "Get Started Free"
3. **Select:** "Player" account type
4. **Fill in:**
   - Email: `test-player@example.com`
   - Password: `TestPass123!`
5. **Complete player profile:**
   - Sport: **Softball**
   - Age Group: **16U**
   - Classification: High School
   - Primary Position: Pitcher
   - Secondary Positions: First Base, Outfield
   - Location: San Diego, CA
   - Bio: "Experienced pitcher looking for opportunities"
   - Height: 5'9"
   - Weight: 145 lbs
   - Grad Year: 2026
   - GPA: 3.8
6. **Save Profile**

### Step 10: Apply as Guest Player

1. **Navigate to:** The tournament URL from Step 3
2. **You should see:**
   - Tournament details
   - "Apply as Guest Player" button (or similar)
3. **Click:** "Apply as Guest Player"
4. **Status changes to:** "Waiting for Team Invites" (yellow badge)

**Player application complete!**

---

## 🧪 Test Flow 4: Team Invites Guest Player

### Step 11: Team Views Guest Player List

**Switch back to Organization Account #2 (Champions Athletics)**

1. **Navigate to:** Tournament details page
2. **Click:** "Guest Players" button (cyan/blue)
3. **You should see:**
   - ✅ **Team Badge:** "Inviting for: Champions Softball Elite"
   - ✅ **Three Stat Cards:**
     - Available Guest Players: 1
     - Invited by Your Team: 0
     - Invited by Other Teams: 0
   - ✅ **Player Card Section:** "Available Guest Players"
   - ✅ **Player Card** with:
     - Player photo or initials
     - Name
     - Sport, Age Group, Classification badges
     - Location: San Diego, CA
     - Positions: Pitcher, First Base, Outfield
     - Bio text (truncated)
     - Application date
     - "Invite to Team" button

### Step 12: Invite Player to Team

1. **Click:** "Invite to Team" button on player card
2. **Loading indicator** appears briefly
3. **Player card moves** from "Available Guest Players" to "Players You Invited"
4. **Stat cards update:**
   - Available Guest Players: 0
   - Invited by Your Team: 1
   - Invited by Other Teams: 0
5. **Button on card changes** to show invited status

**Team invitation sent!**

---

## 🧪 Test Flow 5: Player Accepts Invitation

### Step 13: Player Views Invitation

**Switch back to Player Account**

1. **Navigate to:** Tournament details page
2. **You should see:**
   - ✅ Invitation notification
   - ✅ Team name: "Champions Softball Elite"
   - ✅ "Accept" button
   - ✅ "Decline" button

### Step 14: Accept Invitation

1. **Click:** "Accept" button
2. **Status changes to:** "Joined as Guest Player" (green)
3. **Success message** appears

**Guest player has joined the team!**

---

## 🧪 Test Flow 6: Multiple Teams Competing (Optional)

### Step 15: Second Organization Registers & Invites

**To test team competition:**

1. **Create another organization account** (Organization #3)
2. **Create a Softball 16U team**
3. **Navigate to the tournament**
4. **Click "Register Team"** and select your team
5. **Click "Guest Players"** button
6. **You should see:**
   - Available Guest Players: 0 (player already invited by another team)
   - Invited by Your Team: 0
   - Invited by Other Teams: 1

**This demonstrates the competitive nature** - teams can see when other teams have invited players!

---

## ✅ Expected Results Summary

### ✅ Team Registration Feature

| Test | Expected Result | Status |
|------|----------------|--------|
| Host views own tournament | NO "Register Team" button | ✅ |
| External org views tournament | GREEN "Register Team" button | ✅ |
| Click Register Team | Modal opens with team list | ✅ |
| Teams filtered by sport | Only matching sport teams shown | ✅ |
| Select team | Registration completes | ✅ |
| After registration | Button changes to "Guest Players" | ✅ |
| Already registered team | Excluded from modal | ✅ |
| No teams available | Empty state shown | ✅ |

### ✅ Guest Player Feature

| Test | Expected Result | Status |
|------|----------------|--------|
| Unregistered org | NO "Guest Players" button | ✅ |
| Registered team | "Guest Players" button appears | ✅ |
| Click Guest Players | Team badge shows correct team | ✅ |
| Stat cards | Three cards with accurate counts | ✅ |
| Player cards | Full profile information shown | ✅ |
| Invite to Team | Player moves to "Invited" section | ✅ |
| Player accepts | Status changes to "Joined" | ✅ |
| Multiple teams | Can see other teams' invitations | ✅ |

---

## 🐛 Troubleshooting

### Issue: "Register Team" button not appearing

**Possible causes:**
- You're viewing your own tournament (hosts don't need to register)
- Tournament status is not "open"
- You're not logged in as an organization
- Your organization already has a team registered

**Fix:** Verify tournament status is "open" and you're using a different organization account.

---

### Issue: "Guest Players" button not appearing

**Possible causes:**
- Your organization doesn't have a team registered for this tournament
- You need to click "Register Team" first

**Fix:** Register a team using the "Register Team" button, then "Guest Players" will appear.

---

### Issue: Modal shows "No teams available"

**Possible causes:**
- You don't have any teams created
- Your teams don't match the tournament sport
- All your matching teams are already registered

**Fix:** Create a team matching the tournament sport.

---

### Issue: No guest players showing

**Possible causes:**
- No players have applied yet
- Players applied for different tournament

**Fix:** Create a player account and apply as guest player for this specific tournament.

---

## 📊 Database Verification (Optional)

If you want to verify database records:

```javascript
// Run in browser console on the app
const { createClient } = supabase;
const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'your-anon-key'
);

// Check tournament participants
const { data } = await supabase
  .from('tournament_participants')
  .select('*, tournaments(title), teams(name)')
  .limit(10);
console.log('Registrations:', data);

// Check guest players
const { data: guests } = await supabase
  .from('guest_players')
  .select('*, tournaments(title), player_profiles(*)')
  .limit(10);
console.log('Guest Players:', guests);
```

---

## 🎯 Success Criteria

You've successfully tested the features when:

1. ✅ Different organization can register team via "Register Team" button
2. ✅ Button changes from green "Register Team" to cyan "Guest Players"
3. ✅ Team selection modal filters teams by sport
4. ✅ Guest Players page shows correct team badge
5. ✅ Three stat cards display accurate counts
6. ✅ Teams can invite guest players to their roster
7. ✅ Players can accept/decline invitations
8. ✅ Status updates reflect current state (available → invited → joined)

---

## 📝 Notes

- **Team Registration** allows organizations to JOIN tournaments (not just host them)
- **Guest Player Management** is team-based (not host-based)
- **Teams compete** to invite players to their rosters
- **No team dropdown** - team is auto-detected from registration
- **Sport filtering** ensures only eligible teams can register

---

## 🆘 Need Help?

If you encounter any issues:

1. Check browser console for errors (F12 → Console tab)
2. Verify database connection
3. Confirm tournament status is "open"
4. Ensure you're using correct account types
5. Check that team sport matches tournament sport

---

## 📸 Expected Screenshots

### 1. Register Team Button (Before Registration)
- Green button with "Register Team" text
- Users icon
- Appears when viewing another org's tournament

### 2. Team Selection Modal
- Title: "Select Team to Register"
- List of teams filtered by sport
- Each team shows name, sport, and age group
- Checkmark icon on each team

### 3. Guest Players Button (After Registration)
- Cyan/blue gradient button
- UserPlus icon
- "Guest Players" text

### 4. Guest Player Management Page
- Team badge: "Inviting for: [Team Name]"
- Three stat cards (Available, Invited by You, Invited by Others)
- Player cards with full profiles
- "Invite to Team" button

---

**Testing Time:** ~15 minutes for complete flow
**Last Updated:** December 12, 2025
**Status:** ✅ Ready for Testing

---

## 🎉 Congratulations!

If you've completed all test flows successfully, both features are working correctly and ready for production!
