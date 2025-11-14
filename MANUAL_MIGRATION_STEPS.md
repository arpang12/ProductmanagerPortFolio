# Manual Database Migration Steps

## Quick Fix (5 Minutes)

Since Supabase CLI is not installed, we'll apply the migration manually through the Supabase dashboard.

---

## Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your account
3. Select your project

---

## Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** button

---

## Step 3: Copy and Paste SQL

Copy this SQL and paste it into the editor:

```sql
-- Add metadata columns to cv_versions table
ALTER TABLE cv_versions 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ;

-- Add icon_url columns to Magic Toolbox tables
ALTER TABLE skill_categories 
ADD COLUMN IF NOT EXISTS icon_url TEXT;

ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS icon_url TEXT;
```

---

## Step 4: Run the SQL

1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for "Success" message
3. Should see: "Success. No rows returned"

---

## Step 5: Verify It Worked

Run this verification query:

```sql
-- Check cv_versions columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cv_versions' 
  AND column_name IN ('file_name', 'file_size', 'upload_date');
```

Should return **3 rows**:
- file_name | text
- file_size | integer
- upload_date | timestamp with time zone

---

## Step 6: Test CV Upload

1. **Refresh your browser** (F5)
2. Go to **Admin Panel → CV Management**
3. **Upload a CV file**
4. ✅ Should work now!

---

## Alternative: Use the SQL File

I've created a file with all the SQL: `RUN_THIS_SQL_NOW.sql`

1. Open `RUN_THIS_SQL_NOW.sql` in your editor
2. Copy all the SQL
3. Paste into Supabase SQL Editor
4. Click Run

---

## What These Columns Do

### cv_versions table:
- **file_name** - Stores "Resume.pdf" or "CV.docx"
- **file_size** - Stores file size in bytes (e.g., 1234567)
- **upload_date** - Stores when file was uploaded

### skill_categories table:
- **icon_url** - Stores custom uploaded icon images

### tools table:
- **icon_url** - Stores custom uploaded tool logos

---

## Troubleshooting

### Error: "relation cv_versions does not exist"
**Solution:** The table doesn't exist. Run the initial schema first:
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'cv_versions';
```

### Error: "column already exists"
**Solution:** That's fine! The `IF NOT EXISTS` clause prevents errors. The column is already there.

### Error: "permission denied"
**Solution:** Make sure you're logged in as the project owner or have admin access.

---

## After Migration

### Test Everything:

1. **CV Upload:**
   - Upload a CV file
   - See file name and size
   - Refresh page - file still there

2. **Magic Toolbox:**
   - Upload custom icons
   - See images display
   - Refresh page - images still there

3. **Contact Resume:**
   - Upload resume
   - See success message
   - Refresh page - resume still there

---

## Success Indicators

✅ SQL runs without errors
✅ Verification query returns 3 rows
✅ CV upload works
✅ File metadata displays
✅ Data persists after refresh

---

## If Still Having Issues

1. **Check browser console** (F12)
2. **Copy any error messages**
3. **Check Supabase logs:**
   - Dashboard → Logs → Database
   - Look for errors

---

## Quick Reference

### Supabase Dashboard URL:
```
https://supabase.com/dashboard/project/YOUR-PROJECT-ID
```

### SQL Editor Path:
```
Dashboard → SQL Editor → New query
```

### Tables to Check:
- `cv_versions` - CV file metadata
- `skill_categories` - Magic Toolbox categories
- `tools` - Magic Toolbox tools

---

## Next Steps After Migration

1. ✅ Refresh browser
2. ✅ Test CV upload
3. ✅ Test Magic Toolbox icons
4. ✅ Test Contact resume
5. ✅ Verify data persists

---

## Files Created

- `RUN_THIS_SQL_NOW.sql` - Complete SQL to run
- `MANUAL_MIGRATION_STEPS.md` - This guide
- `supabase/migrations/004_add_cv_version_metadata.sql` - Migration file (for future reference)

---

## Why Manual Migration?

The Supabase CLI is not installed on your system. Manual migration through the dashboard is:
- ✅ Faster (no installation needed)
- ✅ Easier (just copy/paste SQL)
- ✅ Safer (can see results immediately)
- ✅ Works on any system

---

## Installing Supabase CLI (Optional)

If you want to use CLI in the future:

**Windows:**
```powershell
scoop install supabase
```

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
curl -fsSL https://supabase.com/install.sh | sh
```

But for now, manual migration is the quickest solution!

---

## Summary

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste the SQL from `RUN_THIS_SQL_NOW.sql`
4. Click Run
5. Refresh browser
6. Test CV upload
7. ✅ Done!

Takes less than 5 minutes! 🚀
