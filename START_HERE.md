# 🎯 START HERE - Guest Player & Team Registration Features

**Status:** ✅ READY FOR TESTING
**Dev Server:** http://localhost:5173 (Already Running)

---

## ⚡ Quick Start

### What's New?

Two major features are complete and ready to test:

1. **Team Registration** - Organizations can register their teams to JOIN tournaments
2. **Guest Player Management** - Teams compete to invite guest players

### Ready to Test?

Choose your testing approach:

#### 🚀 Fast Track (5 minutes)
Open: **`QUICK_TEST_REFERENCE.md`**
- Quick reference card
- Essential test steps
- Key scenarios

#### 📖 Complete Guide (15 minutes)
Open: **`MANUAL_TESTING_GUIDE.md`**
- Step-by-step instructions
- Screenshots
- Troubleshooting
- Success criteria

---

## 🎮 What You'll Test

### Feature 1: Register Team

```
Visit tournament (as different org)
  ↓
See GREEN "Register Team" button
  ↓
Click button → Modal opens
  ↓
Select team → Register
  ↓
Button changes to CYAN "Guest Players"
```

### Feature 2: Guest Player

```
Player applies as guest player
  ↓
Team clicks "Guest Players"
  ↓
Sees player profile
  ↓
Clicks "Invite to Team"
  ↓
Player accepts
  ↓
Status updates to "Joined"
```

---

## 📋 You'll Need

- 3 accounts:
  1. Organization #1 (tournament host)
  2. Organization #2 (team registering)
  3. Player (guest player applicant)

- 3 browser windows:
  - Normal browser
  - Incognito/private window
  - Different browser (optional)

- 10-15 minutes

---

## 🔗 Quick Links

| Document | Purpose |
|----------|---------|
| **QUICK_TEST_REFERENCE.md** | Fast testing (5 min) |
| **MANUAL_TESTING_GUIDE.md** | Complete guide (15 min) |
| **TEAM_REGISTRATION_FEATURE.md** | Team registration details |
| **GUEST_PLAYER_TEST_SUMMARY.md** | Guest player details |
| **IMPLEMENTATION_COMPLETE.md** | Technical summary |

---

## ✅ Expected Results

After testing, you should see:

- ✅ Organizations can register teams to join tournaments
- ✅ Button changes from green → cyan after registration
- ✅ Teams can invite guest players to their roster
- ✅ Players can accept/decline invitations
- ✅ Real-time status updates throughout

---

## 🆘 Having Issues?

Check **MANUAL_TESTING_GUIDE.md** → Troubleshooting section

Common fixes:
- Tournament status must be "open"
- Team sport must match tournament sport
- Register team BEFORE accessing guest players

---

## 🚀 Start Testing Now

1. Open **QUICK_TEST_REFERENCE.md** or **MANUAL_TESTING_GUIDE.md**
2. Go to http://localhost:5173
3. Follow the instructions
4. Report any issues you find

---

**The features are complete and waiting for you to test!** 🎉
