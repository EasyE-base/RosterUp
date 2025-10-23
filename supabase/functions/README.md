# Supabase Edge Functions for RosterUp

## Setup

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Supabase project created
- Anthropic API key

### Local Development

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Set environment variables:**
   ```bash
   # Create .env file (not committed to git)
   echo "ANTHROPIC_API_KEY=sk-ant-api03-your-key-here" > supabase/functions/.env
   ```

3. **Serve the function locally:**
   ```bash
   supabase functions serve convert-website-with-ai --env-file supabase/functions/.env
   ```

4. **Test the function:**
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/convert-website-with-ai' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"html":"<html>...</html>","css":"body { color: red; }","url":"https://example.com","organizationId":"uuid","subdomain":"test"}'
   ```

### Production Deployment

1. **Login to Supabase:**
   ```bash
   supabase login
   ```

2. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Set secrets in production:**
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key
   ```

4. **Deploy the function:**
   ```bash
   supabase functions deploy convert-website-with-ai
   ```

5. **Get the function URL:**
   ```
   https://your-project-ref.supabase.co/functions/v1/convert-website-with-ai
   ```

## Function: convert-website-with-ai

### Purpose
Uses Claude AI to intelligently convert external websites into RosterUp's block-based format.

### Input
```json
{
  "html": "<html>...</html>",
  "css": "body { ... }",
  "url": "https://example.com",
  "organizationId": "uuid",
  "subdomain": "myorg"
}
```

### Output
```json
{
  "success": true,
  "websiteId": "uuid",
  "pageId": "uuid",
  "sectionsCount": 4,
  "blocksCount": 15
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Environment Variables

### Required in Production
- `ANTHROPIC_API_KEY`: Your Anthropic API key (set via `supabase secrets set`)
- `SUPABASE_URL`: Automatically provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Automatically provided by Supabase

### Cost Estimates
- Claude 3.5 Sonnet pricing: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Average website conversion: ~50,000 input tokens + ~5,000 output tokens = ~$0.20 per conversion
- 100 conversions/month = ~$20/month

## Security

- The function uses the Supabase service role key for database operations
- API key is stored as a secret, never exposed to the client
- CORS is configured to allow requests from your frontend
- Always validate and sanitize HTML input

## Monitoring

View function logs:
```bash
supabase functions logs convert-website-with-ai
```

## Troubleshooting

**Error: "Missing ANTHROPIC_API_KEY"**
- Ensure you've set the secret: `supabase secrets set ANTHROPIC_API_KEY=your-key`

**Error: "Failed to parse AI response"**
- Claude's response may be malformed
- Check function logs for the raw response
- May need to adjust the prompt or increase max_tokens

**Timeout errors**
- Large websites may take longer to process
- Consider implementing a queue system for very large imports
- Default Edge Function timeout is 60 seconds
