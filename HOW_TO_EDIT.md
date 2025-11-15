# How to Edit Your Website - Complete Guide

## 📍 Where to Start

1. **Go to**: http://localhost:5173/
2. **Login** to your organization account
3. **Navigate to**: Website Builder
4. **Open or create a page** (must be a template-based page)
5. **The Toolbar will appear** at the top of the page

---

## 🎨 The Toolbar (Top Bar)

When editing a template page, you'll see a dark toolbar at the top with:

### **Left Side:**
- **Edit Mode / Preview Mode** button
  - 🔵 Blue = Edit Mode (you can change things)
  - ⚫ Gray = Preview Mode (see final result + filters work)

- **Undo/Redo** buttons
  - Undo: Ctrl+Z (Mac: Cmd+Z)
  - Redo: Ctrl+Y (Mac: Cmd+Y)

### **Center:**
- **Save Status**
  - "Saving..." = Changes being saved
  - "Saved" ✓ = All changes saved

### **Right Side:**
- **"+ Add Section"** button
  - Click this to add new sections to your page

---

## ✏️ How to Edit Different Content Types

### **1. Text & Headings**

**In Edit Mode:**
- **Click directly on any text** → It becomes editable
- **Type normally** to change it
- **Press Enter** for new line (in textareas)
- **Click outside** or press Tab to finish editing

**Examples:**
- Page titles, headings, paragraphs
- Team names, player names
- Event opponents, locations
- Any text content

**Visual Cue:** Text gets a blue ring when you click it in edit mode

---

### **2. Images**

**To Add/Change Images:**

**If no image exists:**
1. Look for a dashed box that says "Click to upload image"
2. **Click the box**
3. **Select image from your computer**
4. Image uploads to Supabase Storage automatically
5. Image appears immediately

**If image already exists:**
1. **Hover over the image** in edit mode
2. Dark overlay appears with **"Change Image"** button
3. **Click "Change Image"**
4. **Select new image**
5. Old image replaced with new one

**Supported formats:** JPG, PNG, GIF, WebP
**Storage:** All images saved to Supabase Storage bucket

**Where images are used:**
- Hero section backgrounds
- Team logos
- Player photos
- Institution logos (commitments)
- About section images

---

### **3. Links & Buttons**

**Button Text:**
- **Click the button text** in edit mode
- **Type new text**
- Button updates automatically

**Button URLs** (currently not editable via InlineEditor):
- URLs are stored in the `cta_link` field
- To change: Edit the section content JSON directly

**Email & Phone Links:**
- **Click the email/phone** in edit mode
- **Type the new email/phone**
- Automatically formatted as clickable link

---

### **4. Adding Sections**

**Step 1: Click "+ Add Section"** button in toolbar (top right)

**Step 2: Select Section Type:**
- **Hero** - Full-screen header with CTA
- **About** - About section with stats
- **Schedule** - Events calendar (with filters!)
- **Contact** - Contact form and info
- **Commitments** - Player college commitments (NEW!)

**Step 3:** Section appears at bottom of page

**Step 4:** Edit the new section content

---

### **5. Deleting & Reordering Sections**

**To Delete a Section:**
1. **Hover over section** in edit mode
2. Look for **delete button** (usually in top-right corner)
3. **Click delete**
4. Confirm if prompted

**To Reorder Sections:**
1. Look for **drag handle** icon (⋮⋮ six dots)
2. **Click and drag** the section up or down
3. **Drop** in new position
4. Order saves automatically

---

## 📅 Schedule Section - Complete Guide

### **In Edit Mode:**

Each event card has editable fields:

**Basic Fields:**
- **Date** - Click to edit (e.g., "2025-05-10")
- **Time** - Click to edit (e.g., "2:00 PM")
- **Opponent** - Team you're playing against
- **Location** - Where the game is
- **Type** - Click the badge (Game/Tournament/Practice)

**Filter Fields** (at bottom of card):
- **Team** - Which team (e.g., "U18 Boys Premier")
- **Age Group** - Age division (e.g., "U18", "U16")

**To Add Event:**
1. Scroll to bottom in edit mode
2. Click **"+ Add Another Event"** button
3. New blank event card appears
4. Fill in all fields

**To Delete Event:**
1. Scroll to event card
2. Click **"Remove Event"** button at bottom of card

### **In Preview Mode:**

**FilterBar appears automatically** if you have:
- Multiple teams
- Multiple age groups
- Multiple event types

**Using Filters:**
1. Click filter dropdown (Team, Age Group, or Type)
2. Check/uncheck options
3. Events filter instantly
4. URL updates: `?team=U18&type=Game`
5. Share URL to share filtered view!

**Filter Features:**
- **Result count**: "Showing 3 of 10"
- **Active badges**: Click X to remove filter
- **Clear All**: Reset all filters at once
- **No results**: Shows message if no matches

---

## 🎓 Commitments Section - Complete Guide

### **In Edit Mode:**

Each commitment card has:

**Top Row:**
- **Division Badge** (D1/D2/D3/etc) - Click to edit
- **Grad Year** - Click to edit (e.g., "2025")

**Player Info:**
- **Player Name** - Click to edit
- **Position** - Click to edit (optional)

**Institution:**
- **Institution Name** - Click to edit
- **Institution Logo** - Upload image (hover to change)

**Bottom Section (collapsed):**
- **Team** - For filtering
- **Featured Commitment** - Checkbox
  - Featured = Star icon + appears first

**To Add Commitment:**
1. Scroll to bottom
2. Click **"+ Add Another Commitment"**
3. Fill in player details

**To Delete Commitment:**
1. Click **"Remove Commitment"** at bottom of card

### **In Preview Mode:**

**Filters:**
- **Grad Year** - Filter by class year
- **Division** - D1, D2, D3, NAIA, JUCO, etc.
- **Team** - Filter by team name

**Sorting:**
- Featured commitments appear FIRST (star icon)
- Then sorted by grad year (newest first)

**Division Colors:**
- D1 = Accent color (vibrant)
- D2 = Primary color
- D3 = Accent light
- NAIA = Primary dark
- JUCO = Gray
- Professional = Dark with accent

---

## 👥 Adding Teams (Database Level)

Teams are stored in the database, not in page content.

### **Option 1: Via Supabase Dashboard**

1. Open **Supabase Dashboard**
2. Go to **Table Editor** → `teams`
3. Click **"Insert Row"**
4. Fill in:
   - `organization_id` - Your organization ID
   - `name` - Team name (e.g., "U18 Boys Premier")
   - `age_group` - Age division (e.g., "U18")
   - `logo_url` - Optional team logo URL
5. Click **Save**

### **Option 2: Via SQL**

```sql
INSERT INTO teams (organization_id, name, age_group)
VALUES ('your-org-id', 'U18 Boys Premier', 'U18');
```

### **Enable Team for Website** (Optional)

If you want to restrict which teams show on which website:

```sql
INSERT INTO team_websites (team_id, website_id, is_enabled)
VALUES ('team-id', 'website-id', true);
```

---

## 🔗 Adding Links

### **Email Links:**
- Use InlineEditor with `type="email"`
- Just type the email address
- Automatically becomes `mailto:` link

### **Phone Links:**
- Use InlineEditor with `type="phone"`
- Just type the phone number
- Automatically becomes `tel:` link

### **Button Links:**
Currently button URLs (`cta_link`) are in the section JSON:
```json
{
  "cta_text": "Learn More",
  "cta_link": "/about"
}
```

---

## 🎨 Styling & Themes

All sections automatically use your active theme:
- Colors from ThemeContext
- Typography from theme settings
- Spacing from theme
- Animations from theme

**To change theme:**
- Theme selector in website settings
- 5 premium themes available:
  - Dark Athletic
  - Vibrant Energy
  - Classic Sports
  - Modern Minimal
  - Championship Gold

---

## 💾 Saving

**Auto-save:**
- Changes save automatically as you type
- Watch "Saving..." indicator in toolbar
- When it says "Saved ✓" you're good!

**Manual save:**
- Ctrl+S (Mac: Cmd+S) to force save

---

## 🐛 Troubleshooting

### **"I can't click on text to edit"**
- ✅ Make sure you're in **Edit Mode** (blue button)
- ✅ Check toolbar is visible at top

### **"Images won't upload"**
- ✅ Check file size (max usually 5MB)
- ✅ Check file format (JPG, PNG, GIF, WebP)
- ✅ Check Supabase Storage bucket permissions
- ✅ Look for error message below image

### **"Filters don't appear"**
- ✅ Switch to **Preview Mode**
- ✅ Make sure you have filter fields filled (team, age_group)
- ✅ Need at least 2 different values to show filter

### **"Changes aren't saving"**
- ✅ Wait for "Saved ✓" indicator
- ✅ Check browser console for errors
- ✅ Check internet connection
- ✅ Try manual save: Ctrl+S

### **"Deleted section by accident"**
- ✅ Click **Undo** button immediately
- ✅ Or press Ctrl+Z (Mac: Cmd+Z)

---

## ⌨️ Keyboard Shortcuts

- **Ctrl+Z** (Cmd+Z) - Undo
- **Ctrl+Y** (Cmd+Y) - Redo
- **Ctrl+S** (Cmd+S) - Save
- **Tab** - Finish editing current field
- **Esc** - Cancel edit (if implemented)

---

## 📋 Quick Reference

### **Content Types:**
| Type | How to Edit | Example |
|------|-------------|---------|
| Text | Click & type | "Welcome to our site" |
| Heading | Click & type | "About Our Team" |
| Image | Click to upload | Team logo, player photo |
| Email | Click & type | "info@team.com" |
| Phone | Click & type | "(555) 123-4567" |
| Textarea | Click & type multiline | Long descriptions |
| Button | Click text to edit | "Learn More" |

### **Section Features:**
| Section | Edit Mode | Preview Mode |
|---------|-----------|--------------|
| Hero | Text, image, CTA | Animations |
| About | Text, stats, mission | Animated stats |
| Schedule | Events, teams, dates | **Filters!** |
| Contact | Info, form fields | Form styling |
| Commitments | Players, colleges | **Filters!** |

---

## 🎯 Best Practices

1. **Always work in Edit Mode** when making changes
2. **Switch to Preview Mode** to see final result
3. **Use meaningful team names** for filters to work well
4. **Fill in all filter fields** (team, age_group) for best filtering
5. **Upload high-quality images** (at least 800px wide)
6. **Use consistent naming** for teams across all sections
7. **Test filters** after adding data
8. **Save often** (though auto-save should handle it)

---

## 🚀 Next Steps

After mastering basic editing:

1. **Add multiple teams** to database
2. **Populate schedule** with filter fields
3. **Add commitments** with different divisions
4. **Test filtering** in preview mode
5. **Share filtered URLs** with parents/players
6. **Customize team colors** (Phase 6 - coming soon)

---

**Need more help?** Check:
- `TESTING_GUIDE.md` - Testing instructions
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- Browser console - For error messages
