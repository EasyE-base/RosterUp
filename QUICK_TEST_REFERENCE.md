# Quick Test Reference Card
## Guest Player & Team Registration Features

**Dev Server:** http://localhost:5173

---

## 🚀 Quick Start (5-Minute Test)

### 1. Create Organization Account
```
URL: http://localhost:5173/signup
Type: Organization
Name: Elite Sports Academy
Sport: Softball
```

### 2. Create Team
```
Name: Elite Softball Squad
Sport: Softball
Age Group: 16U
```

### 3. Create Tournament
```
Title: Summer Showcase 2025
Sport: Softball
Age Group: 16U
Status: OPEN ⚠️ (IMPORTANT!)
```

### 4. Test Registration (New Browser/Incognito)
```
1. Create 2nd organization
2. Create Softball team
3. Go to tournament
4. Click GREEN "Register Team" button
5. Select team from modal
6. ✅ Button changes to CYAN "Guest Players"
```

### 5. Test Guest Player (3rd Browser)
```
1. Create player account
2. Complete profile (Softball, 16U)
3. Apply as guest player
4. Switch to Org #2
5. Click "Guest Players"
6. See player card
7. Click "Invite to Team"
8. Switch to player
9. Accept invitation
```

---

## ✅ What to Look For

### Team Registration Feature (NEW!)
- 🟢 **Green "Register Team" button** - Shows for non-host orgs
- 📋 **Team Selection Modal** - Filters teams by sport
- 🔵 **Button Changes** - Becomes cyan "Guest Players" after registration
- ❌ **Empty State** - Shows when no teams available

### Guest Player Feature
- 🏀 **Team Badge** - "Inviting for: [Team Name]"
- 📊 **Three Stat Cards** - Available / Invited by You / Invited by Others
- 👤 **Player Cards** - Full profile with positions, bio, location
- ✉️ **Invite Button** - "Invite to Team"
- ✅ **Status Changes** - Available → Invited → Joined

---

## 🎯 Key Test Scenarios

| Scenario | Expected Behavior |
|----------|------------------|
| **Host views own tournament** | NO "Register Team" button |
| **Different org views tournament** | GREEN "Register Team" button |
| **After registering team** | Button → CYAN "Guest Players" |
| **Click Guest Players** | Team badge + 3 stats + player list |
| **Invite guest player** | Moves to "Invited" section |
| **Player accepts** | Status → "Joined as Guest Player" |

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| No "Register Team" button | Check: tournament is "open", different org |
| No "Guest Players" button | Register team first |
| Modal empty | Create team matching tournament sport |
| No guest players shown | Create player account and apply |

---

## 📋 3-Account Setup

```
Account #1: Organization (Host)
├── Creates tournament
└── Views "Guest Players" by default

Account #2: Organization (Registering)
├── Clicks "Register Team" (green)
├── Button → "Guest Players" (cyan)
└── Invites guest players

Account #3: Player
├── Applies as guest player
└── Accepts team invitation
```

---

## ⚡ Speed Test Checklist

- [ ] Org #1: Create tournament (status = OPEN)
- [ ] Org #2: See green "Register Team" button
- [ ] Org #2: Click button → modal opens
- [ ] Org #2: Select team → button changes to cyan
- [ ] Player: Apply as guest player
- [ ] Org #2: Click "Guest Players" → see player
- [ ] Org #2: Click "Invite to Team"
- [ ] Player: Accept invitation

**If all checked:** ✅ Features working correctly!

---

## 🎨 Button Color Reference

| Button | Color | When It Appears |
|--------|-------|----------------|
| **Register Team** | 🟢 Green gradient | External org viewing tournament |
| **Guest Players** | 🔵 Cyan/Blue gradient | After team registered OR tournament host |
| **Edit** | ⚫ Gray | Tournament host only |

---

## 💡 Pro Tips

1. **Use 3 different browsers** (Chrome, Safari, Firefox) or incognito windows
2. **Copy tournament URL** after creating it for easy access
3. **Match sports** - Team sport must match tournament sport
4. **Status matters** - Tournament must be "open" for registration
5. **Check team badge** - Confirms which team you're inviting for

---

## 📱 Mobile Testing (Optional)

Features are fully responsive and work on mobile:
- Modal adapts to screen size
- Buttons remain accessible
- Player cards stack vertically

---

**Print this card for quick reference while testing!**
