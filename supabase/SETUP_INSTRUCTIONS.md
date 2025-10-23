# Supabase Setup Instructions

## Quick Setup (For Claude AI Integration)

You need to run **one SQL migration** to enable the Claude AI website import feature.

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to your Supabase project dashboard**
   - Visit: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run the Design Systems Migration**
   - Copy the contents of `supabase/add_design_systems_table.sql`
   - Paste into SQL Editor
   - Click "Run"

4. **Verify it worked**
   - Go to "Table Editor" in left sidebar
   - You should see a new table: `website_design_systems`

### Option 2: Using Supabase CLI

```bash
# 1. Install Supabase CLI (if not already installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Apply migration
supabase db push

# Or run the SQL file directly
psql YOUR_DATABASE_CONNECTION_STRING < supabase/add_design_systems_table.sql
```

### Option 3: Using psql directly

If you have PostgreSQL client installed:

```bash
# Get your database connection string from Supabase dashboard
# Settings → Database → Connection string

psql "YOUR_CONNECTION_STRING" < supabase/add_design_systems_table.sql
```

## What This Migration Does

The `add_design_systems_table.sql` migration:

1. **Creates `website_design_systems` table**
   - Stores colors, typography, spacing, buttons, effects
   - One design system per website
   - Uses JSONB for flexible schema

2. **Sets up Row Level Security (RLS)**
   - Users can only access design systems for their organization's websites
   - Automatically enforced by Supabase

3. **Creates indexes**
   - Fast lookups by `website_id`

4. **Adds triggers**
   - Auto-updates `updated_at` timestamp

## Verify Setup

After running the migration, verify it worked:

```sql
-- Check that table exists
SELECT * FROM website_design_systems LIMIT 1;

-- Check that policies exist
SELECT * FROM pg_policies WHERE tablename = 'website_design_systems';
```

You should see:
- ✅ Table created successfully
- ✅ 2 policies created (SELECT and ALL)
- ✅ Index on website_id
- ✅ Trigger for updated_at

## Already Have Existing Tables?

If you've been using RosterUp, you likely already have these tables:
- ✅ `organizations`
- ✅ `organization_websites`
- ✅ `website_pages`
- ✅ `website_sections`
- ✅ `website_content_blocks`

You only need to add:
- ⭐ `website_design_systems` (NEW - for Claude AI integration)

## Troubleshooting

### Error: "relation already exists"

This means the table is already created. You're good to go!

```sql
-- Verify it has the right columns
\d website_design_systems
```

### Error: "permission denied"

Make sure you're using the **database connection string** with the service role key, not the anon key.

### Error: "function uuid_generate_v4 does not exist"

Enable the uuid extension first:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Then run the migration again.

## Next Steps

After running this migration:

1. **Deploy the Edge Function**
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=your-key
   supabase functions deploy convert-website-with-ai
   ```

2. **Test the import feature**
   - Start your app: `npm run dev`
   - Go to Website Builder
   - Click "Import Existing Website"
   - Enter any public website URL

3. **Check the database**
   ```sql
   -- After importing a website, you should see:
   SELECT * FROM website_design_systems;
   ```

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **SQL Editor:** https://supabase.com/docs/guides/database/overview
- **Migrations:** https://supabase.com/docs/guides/cli/local-development

---

**That's it!** Just one migration to run, and you're ready for Claude AI-powered website imports! 🚀
