# 🚀 Claude AI Integration - Deployment Checklist

Use this checklist to deploy the Claude AI website import feature to production.

## Prerequisites ✅

- [ ] Supabase project created
- [ ] Anthropic account created
- [ ] API key obtained: `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`
- [ ] Supabase CLI installed (`npm install -g supabase`)

## Step 1: Database Migration 🗄️

**Time required: 2 minutes**

Choose one method:

### Method A: Supabase Dashboard (Easiest)
- [ ] Go to https://supabase.com/dashboard
- [ ] Open your project
- [ ] Click "SQL Editor" in sidebar
- [ ] Open file: `supabase/add_design_systems_table.sql`
- [ ] Copy all contents
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify: Go to "Table Editor" → See `website_design_systems` table ✅

### Method B: Supabase CLI
- [ ] Run: `supabase login`
- [ ] Run: `supabase link --project-ref YOUR_PROJECT_REF`
- [ ] Run: `psql YOUR_DATABASE_URL < supabase/add_design_systems_table.sql`
- [ ] Verify success message

**📋 Detailed help:** See `supabase/SETUP_INSTRUCTIONS.md`

## Step 2: Deploy Edge Function 🔧

**Time required: 3 minutes**

- [ ] Login to Supabase CLI: `supabase login`
- [ ] Link project: `supabase link --project-ref YOUR_PROJECT_REF`
- [ ] Set API key secret:
  ```bash
  supabase secrets set ANTHROPIC_API_KEY=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
  ```
- [ ] Deploy function:
  ```bash
  supabase functions deploy convert-website-with-ai
  ```
- [ ] Verify deployment:
  ```bash
  supabase functions list
  ```
- [ ] See `convert-website-with-ai` in list ✅

## Step 3: Test the Feature 🧪

**Time required: 5 minutes**

### Test 1: Simple Website
- [ ] Start app: `npm run dev`
- [ ] Go to Website Builder page
- [ ] Click "Import Existing Website"
- [ ] Enter URL: `https://example.com`
- [ ] Click "Import Website"
- [ ] Watch progress bar (should take ~15-30 seconds)
- [ ] Should see "Import Complete!" message ✅
- [ ] Redirects to editor ✅

### Test 2: Complex Website
- [ ] Repeat above with: `https://stripe.com`
- [ ] Should successfully import ✅

### Test 3: Invalid URL
- [ ] Enter invalid URL: `not-a-url`
- [ ] Should show error message ✅
- [ ] Can retry ✅

### Test 4: Database Verification
- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Check `organization_websites` → Should see new website ✅
- [ ] Check `website_pages` → Should see "Home" page ✅
- [ ] Check `website_sections` → Should see 3-7 sections ✅
- [ ] Check `website_content_blocks` → Should see 15-40 blocks ✅
- [ ] Check `website_design_systems` → Should see design system ✅

## Step 4: Monitor & Optimize 📊

### Set Up Monitoring
- [ ] Go to Anthropic Console: https://console.anthropic.com
- [ ] Check API usage dashboard
- [ ] Set billing alerts:
  - [ ] Alert at $10
  - [ ] Alert at $50
  - [ ] Alert at $100

### View Function Logs
- [ ] Run: `supabase functions logs convert-website-with-ai --follow`
- [ ] Make a test import
- [ ] Should see logs streaming ✅

### Performance Baseline
After first few imports, note:
- [ ] Average conversion time: ______ seconds
- [ ] Average token usage: ______ tokens
- [ ] Cost per conversion: $______
- [ ] Success rate: ______%

## Step 5: Production Ready 🎉

### Final Checks
- [ ] Mobile blocking still works (try on phone)
- [ ] Website builder loads without errors
- [ ] All keyboard shortcuts work
- [ ] Design system panel works
- [ ] Can edit imported websites
- [ ] Can publish imported websites
- [ ] Images show correctly
- [ ] Links work correctly

### Security Checks
- [ ] API key NOT in frontend code ✅ (it's in Edge Function)
- [ ] API key NOT in git repo ✅ (it's in .gitignore)
- [ ] API key set as Supabase secret ✅
- [ ] RLS policies active on `website_design_systems` ✅

### Documentation
- [ ] Read `CLAUDE_AI_SETUP.md` ✅
- [ ] Read `CLAUDE_AI_INTEGRATION_SUMMARY.md` ✅
- [ ] Read `supabase/SETUP_INSTRUCTIONS.md` ✅
- [ ] Read `supabase/functions/CLAUDE_PROMPT_GUIDE.md` (optional, for optimization)

## Troubleshooting 🔧

### If imports fail:

1. **Check Edge Function logs:**
   ```bash
   supabase functions logs convert-website-with-ai
   ```

2. **Check API key is set:**
   ```bash
   supabase secrets list
   ```
   Should see `ANTHROPIC_API_KEY` ✅

3. **Test Edge Function directly:**
   ```bash
   curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/convert-website-with-ai' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"html":"<h1>Test</h1>","css":"","url":"https://test.com","organizationId":"...","subdomain":"test"}'
   ```

4. **Common issues:**
   - ❌ "Missing ANTHROPIC_API_KEY" → Run `supabase secrets set` again
   - ❌ "Failed to parse AI response" → Check Claude API status
   - ❌ "CORS error" → AllOrigins may be rate limited (try different website)
   - ❌ "Timeout" → Large website, this is expected (implement queue system)

### Need Help?

- **Database issues:** `supabase/SETUP_INSTRUCTIONS.md`
- **Edge Function issues:** `supabase/functions/README.md`
- **Prompt optimization:** `supabase/functions/CLAUDE_PROMPT_GUIDE.md`
- **Overall guide:** `CLAUDE_AI_SETUP.md`

## Cost Tracking 💰

Track monthly costs:

| Month | Imports | Total Tokens | Total Cost | Avg Cost/Import |
|-------|---------|--------------|------------|-----------------|
| Oct   |         |              |            |                 |
| Nov   |         |              |            |                 |
| Dec   |         |              |            |                 |

**Budget guidance:**
- 10 imports/month = ~$2
- 100 imports/month = ~$20
- 1,000 imports/month = ~$200

## Next Steps 🎯

After successful deployment:

- [ ] Announce feature to users
- [ ] Gather user feedback
- [ ] Monitor success rates
- [ ] Consider enhancements:
  - [ ] Multi-page import
  - [ ] Image optimization
  - [ ] Template library
  - [ ] Preview before import
  - [ ] Batch imports

---

## ✅ Deployment Complete!

Once all checkboxes are checked, you're ready for production! 🚀

**Questions?** Check the documentation or contact your development team.

**Ready to launch?** Start with a few test imports, then roll out to users!

---

**Date deployed:** __________

**Deployed by:** __________

**Notes:**
