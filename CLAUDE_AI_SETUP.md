# Claude AI Website Import Setup Guide

This guide walks you through setting up the Claude AI-powered website import feature for RosterUp.

## Overview

The website import feature uses:
- **Anthropic's Claude 3.5 Sonnet** for intelligent HTML-to-blocks conversion
- **Supabase Edge Functions** for secure backend processing
- **CORS Proxy** for fetching external websites
- **Client-side HTML parsing** as a fallback

## Prerequisites

1. **Supabase Project**
   - Create a project at [supabase.com](https://supabase.com)
   - Note your project reference ID

2. **Anthropic API Key**
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - Create an API key
   - You have: `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`

3. **Supabase CLI**
   ```bash
   npm install -g supabase
   ```

## Step 1: Deploy Database Schema

**📋 Detailed instructions:** See `supabase/SETUP_INSTRUCTIONS.md`

**Quick method - Using Supabase Dashboard:**

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the sidebar
3. Copy contents of `supabase/add_design_systems_table.sql`
4. Paste and click "Run"

**Alternative - Using CLI:**

```bash
# Connect to your Supabase project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
psql YOUR_DATABASE_URL < supabase/add_design_systems_table.sql
```

✅ **Verify:** You should see a new `website_design_systems` table in your database.

## Step 2: Deploy Edge Function

### Local Testing First

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Set environment variables:**
   ```bash
   # Create .env file for local testing
   cat > supabase/functions/.env << EOF
   ANTHROPIC_API_KEY=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
   EOF
   ```

3. **Serve the function locally:**
   ```bash
   supabase functions serve convert-website-with-ai --env-file supabase/functions/.env
   ```

4. **Test it:**
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/convert-website-with-ai' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{
       "html": "<html><body><h1>Test</h1><p>Hello World</p></body></html>",
       "css": "body { color: #333; }",
       "url": "https://example.com",
       "organizationId": "00000000-0000-0000-0000-000000000000",
       "subdomain": "test"
     }'
   ```

### Production Deployment

1. **Set the API key as a secret:**
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=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
   ```

2. **Deploy the function:**
   ```bash
   supabase functions deploy convert-website-with-ai
   ```

3. **Verify deployment:**
   ```bash
   supabase functions list
   ```

4. **Your function URL will be:**
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/convert-website-with-ai
   ```

## Step 3: Update Frontend Configuration

The frontend is already configured to use the Edge Function via `supabase.functions.invoke()`. No additional configuration needed!

The code in `src/components/website-builder/WebsiteImporter.tsx` will automatically:
1. Fetch the website via CORS proxy
2. Send HTML/CSS to Claude AI via Edge Function
3. Create the website in Supabase with converted blocks

## Step 4: Test the Feature

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Website Builder**

3. **Click "Import Existing Website"**

4. **Enter a test URL:**
   - Try: `https://example.com`
   - Or: `https://stripe.com`
   - Or: Any public website

5. **Watch Claude AI work its magic!**

## Cost Estimates

### Anthropic Claude API Pricing
- **Input tokens:** $3 per 1M tokens
- **Output tokens:** $15 per 1M tokens

### Typical Website Import
- **Average HTML size:** 50,000 tokens
- **Average output:** 5,000 tokens
- **Cost per import:** ~$0.20

### Monthly Estimates
- **10 imports/month:** ~$2
- **100 imports/month:** ~$20
- **1,000 imports/month:** ~$200

## Security Considerations

### API Key Security
✅ **Correct:** API key stored in Supabase secrets (never exposed to client)
❌ **Wrong:** Never put API key in frontend code or environment variables

### Rate Limiting
Consider adding rate limits to prevent abuse:
```typescript
// In Edge Function
const MAX_IMPORTS_PER_DAY = 10;
// Check user's import count before processing
```

### Input Validation
The Edge Function should validate:
- HTML size limits (prevent sending huge files to Claude)
- Organization ownership
- User authentication

## Troubleshooting

### Error: "Missing ANTHROPIC_API_KEY"
**Solution:** Ensure you've set the secret in production:
```bash
supabase secrets set ANTHROPIC_API_KEY=your-key-here
```

### Error: "Failed to parse AI response"
**Solution:** Claude's response may be malformed. Check logs:
```bash
supabase functions logs convert-website-with-ai
```

### Error: "CORS policy blocking"
**Solution:** The CORS proxy (AllOrigins) may be rate limited. Consider alternatives:
- Host your own CORS proxy
- Use a paid service like ScraperAPI
- Implement server-side fetching

### Function Timeout
**Solution:** Large websites may exceed 60-second timeout:
- Implement a queue system (e.g., Supabase Realtime)
- Process in chunks
- Use async job processing

## Monitoring

### View Function Logs
```bash
supabase functions logs convert-website-with-ai --follow
```

### Monitor API Usage
- Check Anthropic Console for token usage
- Set up billing alerts
- Track conversion success rates

### Analytics to Track
- Conversion success rate
- Average conversion time
- Most common errors
- Popular source websites

## Next Steps

### Enhancements to Consider

1. **Image Upload**
   - Currently images reference original URLs
   - Upload to Supabase Storage for reliability
   - Optimize and resize images

2. **Multi-page Support**
   - Import entire site structure
   - Preserve internal links
   - Maintain navigation hierarchy

3. **Preview Before Import**
   - Show side-by-side comparison
   - Allow manual adjustments
   - Preview in RosterUp format

4. **Template Library**
   - Save successful imports as templates
   - Share across organizations
   - Community template marketplace

5. **Batch Import**
   - Import multiple pages at once
   - Background processing queue
   - Email notification on completion

## Support

For issues with:
- **Supabase Edge Functions:** [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **Anthropic API:** [docs.anthropic.com](https://docs.anthropic.com)
- **RosterUp:** Contact your development team

---

## Quick Reference

### Important Files
- `supabase/functions/convert-website-with-ai/index.ts` - Edge Function
- `src/components/website-builder/WebsiteImporter.tsx` - Frontend UI
- `src/lib/websiteImporter.ts` - Website fetching library
- `src/lib/aiWebsiteConverter.ts` - Fallback client-side converter

### Environment Variables
```bash
# Production (Supabase Secrets)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Auto-provided by Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Useful Commands
```bash
# Deploy function
supabase functions deploy convert-website-with-ai

# View logs
supabase functions logs convert-website-with-ai

# Set secret
supabase secrets set ANTHROPIC_API_KEY=xxx

# List secrets
supabase secrets list

# Delete function (if needed)
supabase functions delete convert-website-with-ai
```

---

**You're all set!** 🎉

The Claude AI integration is now ready to intelligently import websites into RosterUp with perfect preservation of design, content, and structure.
