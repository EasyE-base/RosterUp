# Testing Checklist - AI Director & Drag/Resize

## ✅ AI Director Testing

### Test 1: Basic Conversation
1. Open website builder
2. Click AI orb (bottom-right)
3. Type: "What is 2+2?"
4. Press Enter or click Send
5. **Expected**: Response appears in ~3-5 seconds saying "4"

### Test 2: Design Help  
1. Ask: "Suggest a better heading for my sports team"
2. **Expected**: Gets creative suggestions
3. Ask: "Make it more exciting"
4. **Expected**: Continues conversation context

### Test 3: Error Handling
1. Disconnect internet
2. Send a message
3. **Expected**: Clear error message about network issue
4. Reconnect
5. **Expected**: Next message works

---

## ✅ Drag/Resize Testing

### Test 1: Enable Drag Mode
1. Look for ⤢ button (top-right, below theme shuffle)
2. Click it
3. **Expected**: Button turns blue
4. **Expected**: Hero section gets min-height

### Test 2: Move Text Box
1. Click on heading text
2. **Expected**: Blue ring appears around text
3. **Expected**: Blue circle with 4-arrow icon appears in top-left corner
4. Click and drag the blue circle (not the text)
5. **Expected**: Text box moves smoothly with 5px grid snapping
6. Release
7. **Expected**: Text stays in new position

### Test 3: Resize Text Box
1. With heading selected (blue ring)
2. **Expected**: Small blue dots in 3 corners (top-right, bottom-left, bottom-right)
3. Drag bottom-right corner
4. **Expected**: Box resizes smoothly
5. Release
6. **Expected**: New size persists

### Test 4: Position Persistence
1. Move heading to new location
2. Refresh page (Cmd+R / Ctrl+R)
3. Enable drag mode again
4. Click heading
5. **Expected**: Heading is still in the position you moved it to

### Test 5: Disable Drag Mode
1. Click ⤢ button again
2. **Expected**: Button returns to gray
3. **Expected**: Text returns to normal flow layout
4. **Expected**: No move/resize handles visible

---

## 🐛 Common Issues & Solutions

### AI Director Not Responding
**Check Console**: Press F12 → Console tab
- Look for error messages
- Should see: `🤖 Invoking ai-director function...`
- Then: `📦 Response: {...}`

**If Error About "Function not found"**:
```bash
supabase functions deploy ai-director
```

**If Error About "API Key"**:
```bash
supabase secrets set OPENAI_API_KEY=your-key
```

### Drag/Resize Not Working

**Issue**: Can't drag text
- **Check**: Is drag mode enabled? (button should be blue)
- **Check**: Are you dragging the blue circle icon (not the text)?
- **Check**: Is element selected? (should have blue ring)

**Issue**: Text jumps/jitters while dragging
- **Check**: Browser console for react-rnd errors
- **Try**: Disable browser extensions
- **Try**: Use Chrome (better performance)

**Issue**: Positions don't save
- **Check**: Network tab for Supabase API calls
- **Check**: Are you logged in?
- **Check**: Page permissions

---

## ✅ Success Indicators

### AI Director Working:
- [x] Deployed successfully (already confirmed via curl)
- [ ] Responds to messages in browser
- [ ] Error messages are helpful
- [ ] Loading indicator shows while waiting

### Drag/Resize Working:
- [ ] Drag mode toggle changes button color
- [ ] Move icon appears in corner when selected
- [ ] Dragging is smooth (no jitter)
- [ ] Positions persist after refresh
- [ ] Resize handles work correctly

---

## Report Results

After testing, please report:

**Working** ✅:
- List what works perfectly

**Issues** ❌:
- Describe what's not working
- Include console errors if any
- Screenshot if helpful

**Feedback** 💬:
- Any UX improvements wanted
- Performance concerns
- Feature requests
