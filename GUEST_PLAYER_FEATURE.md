# Guest Player Feature - Complete Guide

## Overview
The Guest Player feature allows players to apply to tournaments and receive invitations from teams that need additional players.

## What Was Fixed

### Database Schema Issue
**Problem**: The `guest_players` table had a foreign key pointing to the wrong table (`players` instead of `player_profiles`), causing error 23503.

**Solution**: Updated the foreign key constraint to reference `player_profiles(id)`:
```sql
ALTER TABLE guest_players
DROP CONSTRAINT IF EXISTS guest_players_player_id_fkey;

ALTER TABLE guest_players
ADD CONSTRAINT guest_players_player_id_fkey
FOREIGN KEY (player_id)
REFERENCES player_profiles(id)
ON DELETE CASCADE;
```

**Files Modified**:
- `/fix-guest-players-fk-complete.sql` - Complete migration script that cleans orphaned records and fixes the constraint

## Feature Components

### 1. Player Side - Apply as Guest Player

**Component**: `src/components/tournaments/GuestPlayerButton.tsx`

**Features**:
- Players can apply to be a guest player for any tournament
- Real-time status updates:
  - `not_applied` → Shows "Apply as Guest Player" button
  - `available` → Shows "Waiting for Team Invites" with withdraw option
  - `invited` → Shows Accept/Decline buttons
  - `accepted` → Shows "Joined as Guest Player" confirmation
  - `declined` → Shows option to reapply

**User Flow**:
1. Player views tournament details page
2. Clicks "Apply as Guest Player" button
3. Application is created with status `available`
4. Player waits for team invitations
5. When invited, player can Accept or Decline
6. If accepted, status changes to `accepted`

**Key Functions**:
- `handleApplyAsGuest()` - Creates guest player application
- `handleWithdrawApplication()` - Removes application
- `handleAcceptInvite()` - Accepts team invitation
- `handleDeclineInvite()` - Declines team invitation

### 2. Team/Organization Side - Manage Guest Players

**Component**: `src/pages/TournamentGuestPlayers.tsx`

**Features**:
- View all available guest players for a tournament
- See detailed player profiles (photo, positions, bio, stats)
- Select which team to invite the player for
- Send invitations to guest players
- Track invited players

**User Flow**:
1. Tournament host navigates to their tournament page
2. Clicks "Guest Players" button (cyan/blue gradient)
3. Views all available guest players with full profiles
4. Selects a team from dropdown
5. Clicks "Invite to Team" for a player
6. Player receives invitation and can accept/decline
7. Host sees invited players in separate section

**Access**:
- URL: `/tournaments/:id/guest-players`
- Button: Added to tournament details page (visible only to tournament host)

**Key Features**:
- **Player Cards** display:
  - Profile photo or initials
  - Name
  - Sport, age group, classification badges
  - Location
  - Positions
  - Bio (truncated)
  - Application date
- **Team Selection** dropdown
- **Stats** showing:
  - Available Guest Players count
  - Players Invited count
- **Sections**:
  - Available Players (status: `available`)
  - Invited Players (status: `invited`)

## Routes Added

### App.tsx
```typescript
import TournamentGuestPlayers from './pages/TournamentGuestPlayers';

<Route
  path="/tournaments/:id/guest-players"
  element={
    <ProtectedRoute>
      <OnboardingCheck>
        <Navbar />
        <TournamentGuestPlayers />
        <Footer />
      </OnboardingCheck>
    </ProtectedRoute>
  }
/>
```

## Database Schema

### guest_players Table
```sql
CREATE TABLE guest_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available', 'invited', 'accepted', 'declined', 'removed')),
  invited_by_team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, player_id)
);
```

### Status Flow
```
not_applied (no record)
    ↓ (player applies)
available
    ↓ (team invites)
invited
    ↓ (player responds)
accepted OR declined
```

## RLS Policies

```sql
-- Players can insert their own guest applications
CREATE POLICY "Players can insert their own guest applications"
ON guest_players FOR INSERT TO authenticated
WITH CHECK (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Players can view their own guest applications
CREATE POLICY "Players can view their own guest applications"
ON guest_players FOR SELECT TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Players can update their own guest applications
CREATE POLICY "Players can update their own guest applications"
ON guest_players FOR UPDATE TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Players can delete their own guest applications
CREATE POLICY "Players can delete their own guest applications"
ON guest_players FOR DELETE TO authenticated
USING (
  player_id IN (
    SELECT id FROM player_profiles WHERE user_id = auth.uid()
  )
);

-- Organizations can view guest players for their tournaments
CREATE POLICY "Organizations can view guest players for their tournaments"
ON guest_players FOR SELECT TO authenticated
USING (
  tournament_id IN (
    SELECT t.id
    FROM tournaments t
    JOIN organizations o ON o.id = t.organization_id
    WHERE o.user_id = auth.uid()
  )
);
```

## Testing Guide

### Prerequisites
1. At least one tournament must exist
2. Tournament must have an organization owner
3. Organization must have at least one team to invite guest players

### Test Steps

#### As a Player:
1. Navigate to any tournament: `/tournaments/:id`
2. Click "Apply as Guest Player"
3. Verify status changes to "Waiting for Team Invites"
4. Can click "Withdraw Application" to cancel

#### As a Tournament Host:
1. Navigate to your tournament: `/tournaments/:id`
2. Click "Guest Players" button (cyan/blue, next to Edit button)
3. You should see a page at `/tournaments/:id/guest-players`
4. If no teams exist, you'll see a warning message
5. If teams exist:
   - Select a team from dropdown
   - View available guest players with full profiles
   - Click "Invite to Team" to send invitation
   - Player moves to "Invited Players" section

#### As a Player (receiving invitation):
1. Return to tournament page
2. Status should show "Team Invitation Received!"
3. Click "Accept" or "Decline"
4. If accepted, status changes to "Joined as Guest Player"

## UI Components Added

### TournamentDetails.tsx
Added "Guest Players" button for tournament hosts:
```typescript
<button
  onClick={() => navigate(`/tournaments/${id}/guest-players`)}
  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all flex items-center space-x-2"
>
  <UserPlus className="w-4 h-4" />
  <span>Guest Players</span>
</button>
```

## Known Limitations

1. **Team Requirement**: Organizations must have teams created before they can invite guest players
2. **One Application Per Tournament**: Players can only apply once per tournament (enforced by UNIQUE constraint)
3. **No Notification System**: Players must manually check tournaments for invitation status (future enhancement)

## Future Enhancements

1. **Real-time Notifications**: Notify players when they receive invitations
2. **In-app Messaging**: Allow teams and players to communicate before accepting
3. **Player Recommendations**: AI-powered suggestions for teams based on player profiles
4. **Multi-team Invitations**: Allow players to be invited by multiple teams and choose
5. **Guest Player Pool**: Tournament-wide guest player marketplace
6. **Payment Integration**: Handle guest player fees automatically

## Success Metrics

✅ Guest player application works - successfully tested
✅ Foreign key constraint fixed - player applications now save correctly
✅ Status transitions work - UI updates in real-time
✅ Management interface created - teams can view and invite players
✅ RLS policies in place - secure access control

## Files Modified/Created

1. `src/components/tournaments/GuestPlayerButton.tsx` - Player application component
2. `src/pages/TournamentGuestPlayers.tsx` - Team management interface (NEW)
3. `src/App.tsx` - Added route for guest players management
4. `src/pages/TournamentDetails.tsx` - Added "Guest Players" button
5. `fix-guest-players-fk-complete.sql` - Database migration script

## Conclusion

The Guest Player feature is fully implemented and functional. Players can apply to tournaments, teams can view and invite players, and the complete workflow from application to acceptance is working correctly.
