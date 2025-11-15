# Multi-Team Website Features - Testing Guide

## Overview
This guide will help you test the new filtering and multi-team features we've built.

---

## ✅ What's Been Implemented

### **Phase 1-4: Core Filtering System**
- ✅ Database migration (needs to be run)
- ✅ FilterBar reusable component
- ✅ useFilterState custom hook
- ✅ Enhanced ScheduleSection with filters
- ✅ New CommitmentsSection with filters
- ✅ Template JSON for commitments

### **Phase 5: Team Navigation**
- ✅ Team routing helpers
- ✅ TeamSelector dropdown component
- ✅ TeamOverview grid component

---

## 🗄️ Step 1: Run Database Migration

Before testing, you need to apply the database migration:

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy and paste** the migration from: `supabase/migrations/20251031100000_multi_team_foundation.sql`
3. **Run the SQL** to create:
   - `team_websites` table
   - `player_commitments` table
   - `website_sponsors` table
   - `website_media` table
   - New columns: `teams.age_group`, `teams.custom_colors`

---

## 🧪 Step 2: Test Filtering Features

### **A. Test ScheduleSection Filtering**

1. **Navigate to a website with a schedule section** in the editor
2. **Add test data** - In edit mode, add some events with these fields filled:
   ```
   Event 1: U18 Boys Premier, Type: Game, Age Group: U18
   Event 2: U16 Girls Elite, Type: Tournament, Age Group: U16
   Event 3: U18 Boys Premier, Type: Game, Age Group: U18
   Event 4: U14 Boys Select, Type: Practice, Age Group: U14
   ```

3. **Switch to preview mode** (not edit mode)

4. **Verify filter bar appears** above the events

5. **Test filters:**
   - Filter by Team → Should show only selected team's events
   - Filter by Age Group → Should show only that age group
   - Filter by Event Type → Should show only that type
   - Combine filters → Should show events matching ALL filters
   - Clear filters → Should reset to all events

6. **Check URL sync:**
   - Apply a filter → URL should update with `?team=U18&ageGroup=U18`
   - Copy the URL → Paste in new tab → Filters should persist

7. **Verify result count:**
   - Should show "Showing X of Y" above filters

### **B. Test CommitmentsSection**

1. **Add CommitmentsSection** to a page:
   - Option 1: Import from template: `public/templates/commitments.json`
   - Option 2: Add manually and populate with test data

2. **In edit mode**, add commitments:
   ```
   Commitment 1: Player A, 2025, Stanford, D1, U18 Boys Premier
   Commitment 2: Player B, 2024, UCLA, D1, U18 Girls Elite
   Commitment 3: Player C, 2024, Duke, D2, U16 Boys Select
   ```

3. **Test featured commitments:**
   - Check the "Featured Commitment" checkbox on one
   - Verify it shows a star icon
   - Verify it appears first in the list

4. **Switch to preview mode**

5. **Test filters:**
   - Filter by Grad Year
   - Filter by Division (D1, D2, D3, etc.)
   - Filter by Team
   - Combine filters

6. **Verify sorting:**
   - Featured commitments should appear first
   - Then sorted by grad year (newest first)

---

## 👥 Step 3: Test Team Navigation (Optional - Requires Integration)

**Note**: TeamSelector and TeamOverview are ready but require router integration.

### **What's Needed:**
1. Add routes in your React Router:
   ```tsx
   <Route path="/teams" element={<TeamOverview organizationId={orgId} websiteId={websiteId} />} />
   <Route path="/teams/:teamSlug" element={<TeamPage />} />
   ```

2. Add TeamSelector to your website layout:
   ```tsx
   <TeamSelector organizationId={orgId} websiteId={websiteId} sticky={true} />
   ```

### **How to Test (once integrated):**

1. **Create test teams** in your database:
   ```sql
   INSERT INTO teams (organization_id, name, age_group) VALUES
   ('your-org-id', 'U18 Boys Premier', 'U18'),
   ('your-org-id', 'U16 Girls Elite', 'U16'),
   ('your-org-id', 'U14 Boys Select', 'U14');
   ```

2. **Enable teams for website** (optional):
   ```sql
   INSERT INTO team_websites (team_id, website_id, is_enabled) VALUES
   ('team-id-1', 'website-id', true),
   ('team-id-2', 'website-id', true);
   ```

3. **Navigate to `/teams`** → Should see TeamOverview grid

4. **Click TeamSelector** → Dropdown should show:
   - "All Teams" option
   - Each team with logo/initial
   - Age group labels
   - Current selection highlighted

5. **Select a team** → Should navigate to `/teams/u18-boys-premier`

6. **Select "All Teams"** → Should navigate back to `/teams`

---

## 🐛 Common Issues & Solutions

### **Issue: Filters don't appear**
**Solution**: Make sure you're in preview mode (not edit mode). Filters are hidden in edit mode to avoid confusion.

### **Issue: No filter options available**
**Solution**: You need data with the filter fields populated:
- For ScheduleSection: `team_name`, `age_group`, `type`
- For CommitmentsSection: `team_name`, `grad_year`, `institution_type`

### **Issue: URL params not working**
**Solution**: The hook uses `window.location` and `window.history` - make sure you're testing in a browser, not in SSR.

### **Issue: TeamSelector not showing teams**
**Solution**:
1. Check teams exist in database with matching `organization_id`
2. If using `websiteId` prop, verify `team_websites` table has enabled entries

### **Issue: TypeScript errors**
**Solution**: Run `pnpm run build` to check for type errors. All components are fully typed.

---

## 📊 Test Data Examples

### **Schedule Events with Filter Fields**
```json
{
  "events": [
    {
      "date": "2025-05-10",
      "time": "2:00 PM",
      "opponent": "Eagles",
      "location": "Main Field",
      "type": "Game",
      "team_name": "U18 Boys Premier",
      "age_group": "U18"
    },
    {
      "date": "2025-05-17",
      "time": "4:30 PM",
      "opponent": "Tigers",
      "location": "Central Park",
      "type": "Tournament",
      "team_name": "U16 Girls Elite",
      "age_group": "U16"
    }
  ]
}
```

### **Commitments with Filter Fields**
```json
{
  "commitments": [
    {
      "player_name": "Alex Johnson",
      "grad_year": 2025,
      "institution_name": "Stanford University",
      "institution_type": "D1",
      "position": "Midfielder",
      "team_name": "U18 Boys Premier",
      "is_featured": true
    }
  ]
}
```

---

## ✨ Expected Behavior

### **FilterBar Component**
- ✅ Only shows if filters have options available
- ✅ Displays active filter count badge
- ✅ Shows "Showing X of Y" result count
- ✅ Active filters appear as removable badges
- ✅ "Clear All" button appears when filters active
- ✅ Mobile: Filters collapse/expand
- ✅ Theme-aware styling with animations

### **ScheduleSection**
- ✅ Edit mode: Shows filter fields (team, age group)
- ✅ Preview mode: Shows FilterBar if data has filterable fields
- ✅ Empty state when no results match filters
- ✅ URL sync enabled for shareable filtered views

### **CommitmentsSection**
- ✅ Filters by year, division, team
- ✅ Featured commitments show star and sort first
- ✅ Color-coded division badges (D1=accent, D2=primary, etc.)
- ✅ Empty state for no commitments
- ✅ No results state when filters don't match

### **TeamSelector**
- ✅ Sticky header with backdrop blur
- ✅ Dropdown shows "All Teams" + individual teams
- ✅ Team logos or letter initials
- ✅ Age group labels
- ✅ Current team highlighted with checkmark
- ✅ Navigates to `/teams/:slug` on selection

### **TeamOverview**
- ✅ Responsive grid (1-2-3 columns)
- ✅ Hover effects with card lift
- ✅ Roster count from database
- ✅ Click navigates to team page
- ✅ Scroll reveal animations

---

## 🎨 Visual Testing Checklist

- [ ] FilterBar matches theme colors
- [ ] Filter badges animate in/out smoothly
- [ ] Dropdown menus have proper z-index (appear above content)
- [ ] Mobile: Filters collapse/expand smoothly
- [ ] Hover states work on all interactive elements
- [ ] Team cards lift on hover
- [ ] Active filters are visually distinct
- [ ] Empty states are clear and helpful
- [ ] Typography scales properly on mobile

---

## 🚀 Next Steps After Testing

If everything works:
1. ✅ **Phase 6**: Implement per-team color overrides (TeamThemeContext)
2. ✅ **Phase 7**: Add additional sections (Staff, Sponsors, Gallery, Tryouts)
3. ✅ **Phase 8**: Build media upload system

If you find issues:
- Check browser console for errors
- Verify database migration ran successfully
- Ensure data has required filter fields populated
- Test in both Chrome and Safari

---

## 📝 Quick Test Script

Run this in browser console after adding test data:

```javascript
// Test filter state
console.log('Current URL:', window.location.href);

// Apply a filter via URL
window.history.pushState({}, '', '?team=U18&type=Game');
window.location.reload();

// Check if filters persist
```

---

## Need Help?

- Check `src/hooks/useFilterState.ts` for filter logic
- Check `src/components/website-builder/inline-editing/FilterBar.tsx` for UI
- Check `src/lib/team-routing.ts` for URL helpers
- All components are fully TypeScript typed - check interfaces for data structure

Happy testing! 🎉
