# 🚀 Run This Migration Now!

## ✅ Good News!

Your Edge Function is already deployed! 🎉

You can see it here:
https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/functions

## 📋 One Last Step: Run Database Migration

You just need to create the `website_design_systems` table.

### Method 1: Supabase Dashboard (Easiest - 1 minute)

1. **Open SQL Editor:**
   👉 https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql/new

2. **Copy this SQL:**

```sql
-- Create website_design_systems table for storing design system configurations
CREATE TABLE IF NOT EXISTS website_design_systems (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id uuid REFERENCES organization_websites(id) ON DELETE CASCADE NOT NULL UNIQUE,
  colors jsonb DEFAULT '{}',
  typography jsonb DEFAULT '{}',
  spacing jsonb DEFAULT '{}',
  buttons jsonb DEFAULT '{}',
  effects jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE website_design_systems ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_website_design_systems_website_id ON website_design_systems(website_id);

-- Create policies for website_design_systems (inherit from organization_websites)
CREATE POLICY "Users can view design systems for their organization websites"
  ON website_design_systems FOR SELECT
  TO authenticated
  USING (
    website_id IN (
      SELECT id FROM organization_websites
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage design systems for their organization websites"
  ON website_design_systems FOR ALL
  TO authenticated
  USING (
    website_id IN (
      SELECT id FROM organization_websites
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_website_design_systems_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_website_design_systems_updated_at
  BEFORE UPDATE ON website_design_systems
  FOR EACH ROW
  EXECUTE FUNCTION update_website_design_systems_updated_at();
```

3. **Click "Run" button** (or press Cmd+Enter)

4. **Verify it worked:**
   - Go to Table Editor: https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/editor
   - You should see `website_design_systems` in the list! ✅

## 🧪 Test the Feature!

Once the migration is done:

1. **Your dev server is already running** at http://localhost:5173

2. **Go to Website Builder page**

3. **Click "Import Existing Website"**

4. **Try importing a simple site:**
   - URL: `https://example.com`
   - Click "Import Website"

5. **Watch Claude AI work!** 🤖✨
   - Should take 15-30 seconds
   - You'll see progress bar and messages
   - Should complete successfully!

## 📊 What's Already Done

✅ Edge Function deployed
✅ Anthropic API key set
✅ Frontend code updated
✅ Dev server running

❓ Database migration (you're doing this now)

## 🔧 If Something Goes Wrong

### Issue: "Failed to import website"

Check the Edge Function logs:
```bash
supabase functions logs convert-website-with-ai
```

### Issue: Can't see website_design_systems table

Make sure you ran the SQL in the SQL Editor, not somewhere else.

### Issue: CORS error when fetching website

The AllOrigins CORS proxy might be rate limited. Try a different URL.

### Need Help?

- **Edge Function Dashboard:** https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/functions
- **SQL Editor:** https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/sql
- **Table Editor:** https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/editor
- **Function Logs:** https://supabase.com/dashboard/project/hnaqmskjbsrltdcvinai/logs/functions

---

## 🎉 You're Almost There!

Just run that SQL migration and you're ready to test! 🚀

**Time to complete:** 1 minute

**Then you can import websites with AI!** 🤖✨
