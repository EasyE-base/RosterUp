# Canvas Mode V1.0 - Minimal Launch Protocol

**Status**: Ready for execution
**Branch**: `v1.0.0-canvas`
**Target**: Controlled 10% rollout → 48h observation → Full release

---

## Step 1: Run E2E Suite ✅

### Execute Tests
```bash
# 1. Start development server
pnpm run dev

# 2. Open browser to http://localhost:5173
# 3. Navigate to Canvas Mode
# 4. Press Cmd+Shift+T to open E2E Test Panel
# 5. Click "▶️ Run All Tests"
# 6. Wait for completion (~10-15 seconds)
```

### Validate Results
**Required**: `summary.passRate === "100.0%"`

**Expected output** (console):
```
============================================================
📊 E2E Test Summary: 4/4 passed
============================================================

🎉 All tests passed! Canvas Mode is production-ready for V1.0

📋 Test Report JSON (saved to localStorage):
{
  "summary": {
    "total": 4,
    "passed": 4,
    "failed": 0,
    "passRate": "100.0%"  ← VERIFY THIS
  },
  "tests": [
    { "name": "Command History Performance", "status": "passed", ... },
    { "name": "IndexedDB Persistence", "status": "passed", ... },
    { "name": "Breakpoint CSS Injection", "status": "passed", ... },
    { "name": "Memory Leak Detection", "status": "passed", ... }
  ]
}
```

### Export Report
1. Click "📥 Export JSON" in E2E Test Panel
2. Save as `canvas-e2e-v1.0.0-YYYY-MM-DD.json`
3. Store in `docs/test-reports/` for compliance
4. Verify file contains `"passRate": "100.0%"`

**Checkpoint**: If passRate ≠ 100%, STOP and investigate failures.

---

## Step 2: Promote Build → Staging 🚀

### Merge to Staging
```bash
# Check current branch
git branch --show-current
# Should output: v1.0.0-canvas

# Fetch latest
git fetch origin

# Create/checkout staging branch
git checkout -b staging || git checkout staging

# Merge v1.0.0-canvas
git merge v1.0.0-canvas --no-ff -m "Merge Canvas Mode V1.0 to staging"

# Push to remote
git push origin staging
```

### Deploy to Staging Environment
```bash
# Build for production
pnpm run build

# Verify build output
ls -lh dist/
# Expected:
# - index.html (0.48 kB)
# - assets/index.css (71.74 kB)
# - assets/index.js (1,268.70 kB)

# Deploy to staging (example: Vercel)
# vercel --prod --env VITE_FEATURE_CANVAS_MODE=true
# OR your deployment command
```

### Configure Staging Environment Variables
```bash
# .env.staging (or via hosting platform dashboard)
VITE_SUPABASE_URL=your_staging_supabase_url
VITE_SUPABASE_ANON_KEY=your_staging_anon_key

# AI Configuration
VITE_AI_PROVIDER=openai
VITE_AI_ENDPOINT=/api/ai
VITE_AI_API_KEY=your_staging_api_key

# Analytics (REQUIRED for monitoring)
VITE_ANALYTICS_ENDPOINT=https://your-monitoring.com/api/analytics

# Feature Flag (10% rollout)
VITE_FEATURE_CANVAS_MODE=true
```

---

## Step 3: Verify Telemetry 📊

### Confirm Analytics Posts
```bash
# 1. Open staging environment in browser
# 2. Open DevTools → Network tab
# 3. Filter: XHR/Fetch
# 4. Use Canvas Mode for ~30 seconds (undo/redo, transform, AI calls)
# 5. Wait 30 seconds for auto-flush
# 6. Verify POST request to VITE_ANALYTICS_ENDPOINT
```

**Expected Network Request**:
```
POST https://your-monitoring.com/api/analytics
Content-Type: application/json

{
  "events": [...],
  "metrics": {
    "undoLatency": { "avg": 12.5, "min": 8.2, "max": 24.1, "count": 45 },
    "aiCallDuration": { "avg": 1847.3, "min": 982.1, "max": 3201.5, "count": 12 },
    "transformLatency": { ... },
    "breakpointSwitchLatency": { ... },
    "cssInjectionLatency": { ... }
  },
  "sessionId": "session-...",
  "timestamp": 1729725600000
}
```

**Verify in Monitoring Dashboard**:
- [ ] Events are appearing in real-time
- [ ] Metrics are being aggregated
- [ ] SessionId is unique per user
- [ ] All 5 metric types are tracked

**Checkpoint**: If telemetry not posting, verify `VITE_ANALYTICS_ENDPOINT` is correct and CORS is configured.

---

## Step 4: Enable Feature Flag (10% Traffic) 🎯

### Option A: Environment Variable (All-or-Nothing)
```bash
# Enable for all staging users
VITE_FEATURE_CANVAS_MODE=true
```

### Option B: Percentage-Based Rollout (Recommended)

**Update your feature flag logic** (`src/lib/featureFlags.ts` or routing logic):

```typescript
/**
 * Check if user is in 10% rollout cohort
 */
function isInRolloutCohort(userId: string, percentage: number): boolean {
  // Stable hash-based assignment
  const hash = userId.split('').reduce((acc, char) =>
    acc + char.charCodeAt(0), 0
  );
  return (hash % 100) < percentage;
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  if (feature === 'canvasMode') {
    const envEnabled = import.meta.env.VITE_FEATURE_CANVAS_MODE === 'true';
    if (!envEnabled) return false;

    // Get userId from auth context
    const userId = getCurrentUserId(); // Your auth logic
    if (!userId) return false;

    // 10% rollout
    return isInRolloutCohort(userId, 10);
  }
  // ... other features
}
```

### Verify Rollout Percentage
```bash
# Test with multiple users (10 test accounts)
# Expected: ~1 user sees Canvas Mode, ~9 see legacy editor
# Actual distribution will vary (binomial), but should average 10%
```

---

## Step 5: Observe for 48 Hours 👀

### Monitoring Checklist

**Required Metrics** (check every 6 hours):

| Metric | Target | Threshold | Action if Exceeded |
|--------|--------|-----------|-------------------|
| **Undo/Redo Latency** | < 100ms avg | > 150ms | Investigate command replay |
| **CSS Injection** | < 16ms avg | > 25ms | Check breakpoint logic |
| **AI Success Rate** | > 95% | < 90% | Review AI error logs |
| **Memory Growth** | < 5MB/session | > 10MB | Check for memory leaks |
| **Error Rate** | < 1% | > 5% | Investigate error logs |

**Dashboard Queries** (adjust for your monitoring platform):

```sql
-- Undo/Redo Latency (average over last 6 hours)
SELECT AVG(value) as avg_undo_latency
FROM analytics_events
WHERE action = 'undoLatency'
  AND timestamp > NOW() - INTERVAL '6 hours'
  AND sessionId LIKE 'session-%'
GROUP BY DATE_TRUNC('hour', timestamp);

-- AI Success Rate
SELECT
  COUNT(CASE WHEN action = 'call_success' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM analytics_events
WHERE category = 'ai'
  AND timestamp > NOW() - INTERVAL '6 hours';

-- Error Rate
SELECT
  COUNT(CASE WHEN category = 'error' THEN 1 END) * 100.0 / COUNT(*) as error_rate
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '6 hours';
```

### Observation Schedule

**Hour 0-6**: Initial monitoring (most critical)
- [ ] Check all metrics hourly
- [ ] Monitor error logs
- [ ] User feedback channels

**Hour 6-24**: Active monitoring
- [ ] Check metrics every 3 hours
- [ ] Review user sessions in monitoring tool
- [ ] Collect user feedback

**Hour 24-48**: Steady-state observation
- [ ] Check metrics every 6 hours
- [ ] Analyze trends
- [ ] Prepare for expansion if healthy

### Red Flags 🚨

**Immediate rollback if**:
- Undo/redo latency > 500ms consistently
- AI success rate < 80%
- Error rate > 10%
- Memory leaks > 20MB/session
- Critical user-reported bugs

**Rollback procedure**:
```bash
# Disable feature flag immediately
VITE_FEATURE_CANVAS_MODE=false

# Redeploy
pnpm run build && [deploy command]

# Monitor for stabilization
```

---

## Step 6: Tag Release v1.0.0 🏷️

### After 48h Observation (if metrics healthy)

```bash
# Ensure you're on staging branch with all changes
git checkout staging
git pull origin staging

# Create annotated tag
git tag -a v1.0.0 -m "Canvas Mode V1.0 - Production Release

## Metrics (48h observation)
- Undo/Redo Latency: X.Xms avg (target < 100ms) ✅
- CSS Injection: X.Xms avg (target < 16ms) ✅
- AI Success Rate: XX.X% (target > 95%) ✅
- Memory Growth: X.XMB (target < 5MB) ✅
- Error Rate: X.X% (target < 1%) ✅

## E2E Test Results
- Command History: PASS
- IndexedDB Persistence: PASS
- CSS Injection Latency: PASS
- Memory Leak Detection: PASS

## Rollout
- 10% traffic on staging for 48 hours
- Zero critical issues reported
- User feedback: positive

Approved for production rollout.
"

# Push tag to remote
git push origin v1.0.0

# Verify tag
git tag -l -n9 v1.0.0
```

### Create GitHub Release (if applicable)
```bash
# Using GitHub CLI
gh release create v1.0.0 \
  --title "Canvas Mode V1.0 - Production Release" \
  --notes-file CANVAS_MODE_README.md \
  --target staging

# Or manually at: https://github.com/your-org/your-repo/releases/new
```

---

## Step 7: Full Production Rollout (After Tag)

### Expand to 50% (Day 3-4)
```typescript
// Update rollout percentage
return isInRolloutCohort(userId, 50);
```

### Expand to 100% (Day 5+)
```bash
# Enable for all users
VITE_FEATURE_CANVAS_MODE=true

# Remove rollout logic if desired
```

### Merge to Main
```bash
git checkout main
git merge staging --no-ff -m "Release Canvas Mode V1.0 to production"
git push origin main
```

---

## Rollback Plan (If Needed)

### Emergency Rollback
```bash
# Disable feature flag
VITE_FEATURE_CANVAS_MODE=false

# Or reduce rollout percentage
isInRolloutCohort(userId, 0)

# Redeploy immediately
pnpm run build && [deploy command]
```

### Post-Rollback
1. Analyze error logs and metrics
2. Identify root cause
3. Create hotfix branch
4. Re-run E2E tests
5. Restart launch protocol

---

## Success Criteria Summary

- [ ] E2E tests: 100% pass rate
- [ ] Telemetry: Posts to analytics endpoint
- [ ] Feature flag: 10% rollout active
- [ ] 48h observation: All metrics within thresholds
- [ ] Git tag: v1.0.0 created and pushed
- [ ] Zero critical issues
- [ ] Positive user feedback

**When all checked**: Proceed to full production rollout (50% → 100%)

---

## Contact & Escalation

**Monitoring Dashboard**: [Your monitoring URL]
**Error Logs**: [Your logging URL]
**Escalation**: [Team Slack channel / Email]

---

Built with ❤️ by the RosterUp Team
🤖 Generated with [Claude Code](https://claude.com/claude-code)
