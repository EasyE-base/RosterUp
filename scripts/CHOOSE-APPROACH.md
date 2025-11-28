# Choose Your Approach for Creating 10 Organizations

## Problem
The `organizations` table has a unique constraint on `user_id`, meaning each user can only own ONE organization.

## Two Solutions

### Option 1: Remove Unique Constraint (Simplest) ⭐ RECOMMENDED

**File:** `remove-user-id-constraint.sql`

This allows one user account to own multiple organizations.

**Pros:**
- ✅ Fastest - just one SQL query
- ✅ Uses existing user account
- ✅ No authentication setup needed

**Cons:**
- ⚠️ Changes database schema permanently

**When to use:** For testing/demo purposes where you want quick setup

---

### Option 2: Create 10 Separate Organization Accounts

**File:** `create-10-org-accounts-and-orgs.sql`

This creates 10 user profiles (one per organization) then creates the organizations.

**Pros:**
- ✅ Each organization has its own user account
- ✅ More realistic for production
- ✅ Maintains unique constraint

**Cons:**
- ⚠️ Creates profiles WITHOUT auth.users entries (can't login)
- ⚠️ Would need to add auth.users manually or use signUp

**When to use:** For production setup where each org should have separate ownership

---

## Recommendation

**For quick testing: Use Option 1**

1. Run `remove-user-id-constraint.sql` in Supabase Dashboard
2. Then run `create-10-orgs-and-teams-v4.sql`
3. Then run `update-org-logos.sql`

**For production: Use Option 2**

1. Run `create-10-org-accounts-and-orgs.sql` in Supabase Dashboard
2. Then run `update-org-logos.sql`
3. Manually create auth.users entries for each organization if login is needed

---

## What Each Creates

Both approaches create:
- ✅ 10 softball organizations in Mid-Atlantic region
- ✅ 10 teams (one per organization)
- ✅ Mixed age groups: 12U, 14U, 16U, 18U
- ✅ All with Girls teams for Spring 2025 season

Organization names:
1. Lady Bandits Softball (Baltimore, MD)
2. Flemington Flames (Flemington, NJ)
3. Maryland Sting Softball (Annapolis, MD)
4. Neshaminy Shock Travel Softball (Langhorne, PA)
5. Bama Slammers Fastpitch (Philadelphia, PA)
6. Boom Williston Fastpitch (Wilmington, DE)
7. Ohio Lasers Softball (Richmond, VA)
8. Worthington Spirit Softball (Arlington, VA)
9. Storm Travel Softball (Dover, DE)
10. Illinois Lightning Travel Softball (Trenton, NJ)
