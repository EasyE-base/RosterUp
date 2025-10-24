# Canvas Mode V2.0 - Testing Guide
**Version:** 2.0.0-rc1
**Date:** October 24, 2025
**Status:** Ready for Testing

---

## Overview

This guide covers manual testing of Canvas Mode V2.0 hybrid loading system. Focus areas:
1. **Iframe rendering fidelity** - Verify cloned HTML renders identically to source
2. **Memory stability** - Ensure < +5 MB heap growth during typical session
3. **ThryveId injection** - Validate stable ID assignment across reloads
4. **Performance budgets** - Confirm < 100ms load/hydrate/compile cycles

---

## Prerequisites

### 1. Environment Setup
Ensure `.env` contains:
```bash
VITE_EDITOR_MODE=canvas
```

### 2. Database Migration
Run the V2.0 migration to create required tables:

```bash
# Option A: Remote Supabase (recommended)
supabase db push

# Option B: Local Supabase (requires Docker)
supabase migration up
```

**Expected Output:**
```
✓ Applying migration 20251024000000_create_canvas_v2_tables.sql
✓ Created table: element_mappings
✓ Created table: canvas_commands
```

Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('element_mappings', 'canvas_commands');
```

### 3. Test Data Setup
You need a page with `clone_html` populated. Use the website import feature:

1. Navigate to Website Builder
2. Import a website (e.g., newjerseygators.com)
3. Note the `pageId` from the URL: `/website-builder/edit/{pageId}`

---

## Test 1: Iframe Rendering Fidelity

### Objective
Verify cloned HTML renders with visual fidelity in Canvas Mode iframe.

### Steps

1. **Start dev server:**
   ```bash
   pnpm run dev
   ```

2. **Navigate to test page:**
   ```
   http://localhost:5173/website-builder/edit/{pageId}
   ```

3. **Open DevTools Console** (Cmd+Option+J / F12)

4. **Expected Console Output:**
   ```
   📊 HybridCanvasLoader: 45.23ms
   ✅ Injected 247 thryveIds
   ✅ Saved 247 element mappings to Supabase
   🔄 Hydrating commandBus with 247 flow elements
   ✅ Canvas hydrated in 12.34ms
   📡 IframeSyncManager initialized
   ```

5. **Performance Budget Validation:**
   - ✅ HybridCanvasLoader: < 100ms
   - ✅ Canvas hydration: < 50ms
   - ✅ Registry sync: < 50ms (check warning logs)

6. **Visual Fidelity Checks:**
   - [ ] All text renders with correct fonts/sizes
   - [ ] Images load at correct positions
   - [ ] Layout matches original (no shifts/overlaps)
   - [ ] Colors and backgrounds render correctly
   - [ ] Navigation and UI elements visible

7. **ThryveId Injection Verification:**
   Open DevTools Elements tab, inspect any element:
   ```html
   <div data-thryve-id="abc123xyz...">
   ```
   All elements except `<script>` should have `data-thryve-id`.

### Pass Criteria
- ✅ Page loads without errors
- ✅ All performance budgets met
- ✅ Visual rendering matches source HTML
- ✅ ThryveIds injected on all elements

---

## Test 2: Memory Stability

### Objective
Confirm heap memory growth stays under +5 MB during 5-minute session.

### Steps

1. **Open Chrome DevTools → Performance tab**

2. **Take initial heap snapshot:**
   - Click Memory tab
   - Take Heap Snapshot
   - Note baseline size (e.g., 45.2 MB)

3. **Perform typical canvas operations:**
   - Hover over 10+ elements (observe hover highlights)
   - Click to select 5 different elements
   - Drag an element (if drag implemented)
   - Change viewport breakpoint (Desktop → Tablet → Mobile)
   - Repeat cycle 3 times

4. **Take final heap snapshot:**
   - Click "Take Snapshot" again
   - Compare sizes

5. **Memory Leak Detection:**
   ```javascript
   // Run in console before operations
   performance.memory.usedJSHeapSize / 1024 / 1024 // MB

   // Run after 5 minutes
   performance.memory.usedJSHeapSize / 1024 / 1024 // MB
   ```

6. **Expected Growth:**
   - Baseline: ~45 MB
   - After operations: < 50 MB (+5 MB threshold)

### Pass Criteria
- ✅ Heap growth < +5 MB
- ✅ No memory warnings in console
- ✅ Detached DOM nodes < 100 (check Snapshots)

---

## Test 3: IframeSyncManager Validation

### Objective
Verify automatic selector registry sync after DOM mutations.

### Steps

1. **Initial Sync Check:**
   Open console, run:
   ```javascript
   registry.debug()
   // Expected output:
   // 📋 Selector Registry V2.0:
   // { totalIds: 247, thryveElements: 247, ... }
   ```

2. **Simulate DOM Mutation (via Smart Edit mode if available):**
   - Change text content of an element
   - Add a new element
   - Delete an element

3. **Verify Auto-Sync:**
   ```javascript
   registry.debug()
   // Should reflect updated counts
   ```

4. **Performance Check:**
   Look for console warnings:
   ```
   ⚠️ Registry sync: 87.45ms > 50ms budget (500 elements)
   ```
   If present, note element count for optimization.

### Pass Criteria
- ✅ Registry syncs automatically on DOM changes
- ✅ Sync latency < 50ms for typical page (< 300 elements)
- ✅ No stale element references

---

## Test 4: Supabase Persistence

### Objective
Confirm element_mappings persist to Supabase.

### Steps

1. **Query element_mappings table:**
   ```sql
   SELECT COUNT(*) FROM element_mappings WHERE page_id = '{pageId}';
   ```
   Should return count matching console log (e.g., 247).

2. **Verify mapping structure:**
   ```sql
   SELECT thryve_id, element_type, selector, content
   FROM element_mappings
   WHERE page_id = '{pageId}'
   LIMIT 5;
   ```

3. **Expected Row:**
   ```
   thryve_id: "hash123abc..."
   element_type: "text"
   selector: '[data-thryve-id="hash123abc..."]'
   content: {"text": "Welcome to our site"}
   ```

### Pass Criteria
- ✅ All elements saved to element_mappings
- ✅ No duplicate (page_id, thryve_id) violations
- ✅ Content snapshots match element attributes

---

## Test 5: Error Handling

### Objective
Validate graceful degradation on errors.

### Test Cases

#### A. Missing clone_html
1. Create page without clone_html:
   ```sql
   UPDATE website_pages SET clone_html = NULL WHERE id = '{pageId}';
   ```
2. Navigate to Canvas Mode
3. **Expected:** Red error banner:
   ```
   Error: Failed to fetch clone_html: No HTML found
   ```

#### B. Malformed HTML
1. Set invalid HTML:
   ```sql
   UPDATE website_pages SET clone_html = '<div>Unclosed tag' WHERE id = '{pageId}';
   ```
2. **Expected:** Sanitizer handles gracefully, page renders empty or logs warning.

#### C. Network Failure
1. Disconnect network (DevTools → Network → Offline)
2. Reload page
3. **Expected:** Error banner with Supabase connection error.

### Pass Criteria
- ✅ Errors display user-friendly messages
- ✅ No unhandled exceptions in console
- ✅ App remains responsive (can navigate away)

---

## Test 6: Feature Flag Toggle

### Objective
Verify runtime switching between Canvas and Smart Edit modes.

### Steps

1. **Test Canvas Mode:**
   ```bash
   VITE_EDITOR_MODE=canvas
   ```
   - Build and load page
   - Should render CanvasMode component

2. **Test Smart Edit Mode:**
   ```bash
   VITE_EDITOR_MODE=smart
   ```
   - Rebuild and load same page
   - Should render SmartEditMode component (legacy)

3. **Test Default (undefined):**
   ```bash
   # Remove VITE_EDITOR_MODE
   ```
   - Should fallback to Smart Edit

### Pass Criteria
- ✅ Toggle works without code changes
- ✅ No TypeScript errors in either mode
- ✅ HybridCanvasLoader only activates in canvas mode

---

## Performance Benchmarks

### Target Budgets (from telemetry)

| Operation | Budget | Typical | Location |
|-----------|--------|---------|----------|
| HybridCanvasLoader (total) | 100ms | 45ms | HybridCanvasLoader.tsx:49 |
| Canvas hydration | 50ms | 12ms | CanvasMode.tsx:75 |
| Registry sync | 50ms | 8ms | selectorRegistry.ts:203 |
| Mutation compile | 100ms | 15ms | mutationEngine.ts:139 |
| Quadtree rebuild | 50ms | 5ms | hitTestQuadtree.ts (if used) |

### How to Profile

1. **Enable Performance Marks:**
   All operations already instrumented with `performance.mark()`.

2. **View in DevTools:**
   - Performance tab → Record
   - Perform operation (e.g., load page)
   - Stop recording
   - Look for User Timing marks: `hybrid-load`, `canvas-hydrate`, etc.

3. **Console Warnings:**
   Operations exceeding budgets log warnings:
   ```
   ⚠️ HybridCanvasLoader: 123.45ms > 100ms budget
   ```

---

## Troubleshooting

### Issue: "Cannot connect to Supabase"
**Solution:** Check `.env` for correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Issue: "No thryveIds injected"
**Solution:** Verify `clone_html` column is not null:
```sql
SELECT clone_html IS NOT NULL FROM website_pages WHERE id = '{pageId}';
```

### Issue: "Performance budget exceeded"
**Diagnosis:**
1. Check element count: `registry.debug()` → `thryveElements`
2. Large pages (> 500 elements) may exceed budgets
3. Consider pagination or lazy loading for optimization

### Issue: "Memory leak detected"
**Diagnosis:**
1. Take heap snapshots before/after
2. Look for detached DOM nodes
3. Check `iframeSyncManager.stop()` is called on unmount
4. Verify `URL.revokeObjectURL()` in HybridCanvasLoader cleanup

---

## Automated Testing (Future)

### Integration Test Template

```typescript
// src/components/canvas/__tests__/HybridCanvasLoader.test.ts
import { render, waitFor } from '@testing-library/react';
import { HybridCanvasLoader } from '../HybridCanvasLoader';
import { supabase } from '@/lib/supabase';

describe('HybridCanvasLoader', () => {
  it('loads clone_html and injects thryveIds', async () => {
    const mockPageId = 'test-page-id';
    const mockHTML = '<div><p>Test</p></div>';

    jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { clone_html: mockHTML },
            error: null,
          }),
        }),
      }),
    } as any);

    const onLoad = jest.fn();
    const onError = jest.fn();

    render(
      <HybridCanvasLoader
        pageId={mockPageId}
        onLoad={onLoad}
        onError={onError}
      />
    );

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
      const [html, elements] = onLoad.mock.calls[0];
      expect(html).toContain('data-thryve-id');
      expect(elements.size).toBeGreaterThan(0);
    });
  });
});
```

---

## Sign-Off Checklist

Before proceeding to Phase 4 (UI components):

- [ ] All Test 1-6 pass criteria met
- [ ] Performance budgets under thresholds
- [ ] Memory growth < +5 MB over 5 minutes
- [ ] Supabase tables created and RLS policies active
- [ ] No unhandled exceptions in 10-minute session
- [ ] Visual fidelity matches source HTML
- [ ] ThryveIds deterministic across reloads

**Tester Signature:** _____________
**Date:** _____________
**Build Version:** v2.0.0-rc1 (commit f4c4fef)

---

## Next Steps

After passing all tests:
1. Proceed to Phase 4: UI Components (ElementContextBar, CanvasSurface sandbox)
2. Implement UnlockCommand click handler
3. Add E2E tests for unlock flow
4. Tag v2.0.0-rc1 for staging deployment
