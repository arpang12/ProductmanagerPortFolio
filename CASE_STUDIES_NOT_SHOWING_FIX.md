# 🔧 Case Studies Not Showing on Homepage - Fix

## Problem
Case studies don't appear on the homepage even after clicking "Publish".

---

## ✅ Quick Fix (Run This SQL)

### Step 1: Go to Supabase SQL Editor

1. Open https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**

### Step 2: Run This SQL

Copy and paste this entire script:

```sql
-- Add is_published field if it doesn't exist
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Add published_at timestamp
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_case_studies_published 
ON case_studies(is_published, created_at DESC);

-- Set all existing case studies to published
UPDATE case_studies 
SET is_published = true, 
    published_at = COALESCE(published_at, updated_at, created_at)
WHERE is_published IS NULL OR is_published = false;

-- Verify the update
SELECT case_study_id, title, is_published, published_at 
FROM case_studies 
ORDER BY created_at DESC;
```

### Step 3: Click "Run"

You should see your case studies listed with `is_published = true`.

### Step 4: Refresh Homepage

Go to your homepage and refresh (Ctrl+R or Cmd+R). Your case studies should now appear!

---

## 🔍 Why This Happens

The `is_published` field was added in a migration but might not have been applied to your database yet. This SQL script:

1. Adds the `is_published` column if missing
2. Adds the `published_at` timestamp
3. Creates an index for performance
4. **Sets all existing case studies to published**
5. Shows you the results

---

## 🎯 Alternative: Apply Migration

If you prefer to use migrations:

```bash
# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase migration up
```

---

## ✅ Verify It's Working

### Check Database

Run this query in Supabase SQL Editor:

```sql
SELECT 
  case_study_id,
  title,
  is_published,
  published_at,
  created_at
FROM case_studies
WHERE is_published = true
ORDER BY created_at DESC;
```

You should see your published case studies.

### Check Homepage

1. Go to your homepage
2. Scroll to "Projects" section
3. Your case studies should be visible
4. Click on one to view the full case study

---

## 🔧 If Still Not Showing

### Check 1: Case Study Has Hero Section

Case studies need a hero section to appear on homepage.

```sql
SELECT 
  cs.case_study_id,
  cs.title,
  cs.is_published,
  COUNT(css.section_id) as hero_sections
FROM case_studies cs
LEFT JOIN case_study_sections css 
  ON cs.case_study_id = css.case_study_id 
  AND css.section_type = 'hero'
WHERE cs.is_published = true
GROUP BY cs.case_study_id, cs.title, cs.is_published;
```

If `hero_sections = 0`, the case study won't show. Add a hero section in the editor.

### Check 2: Browser Cache

Clear your browser cache:
- Chrome/Edge: Ctrl+Shift+Delete
- Firefox: Ctrl+Shift+Delete
- Safari: Cmd+Option+E

Or do a hard refresh:
- Windows: Ctrl+Shift+R
- Mac: Cmd+Shift+R

### Check 3: Console Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors related to fetching projects
4. Check Network tab for failed API calls

### Check 4: RLS Policies

Make sure Row Level Security allows reading published case studies:

```sql
-- Check if policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'case_studies' 
AND policyname LIKE '%select%';

-- If missing, create it
CREATE POLICY "Anyone can view published case studies"
ON case_studies FOR SELECT
USING (is_published = true);
```

---

## 📊 Diagnostic Query

Run this to see the full picture:

```sql
SELECT 
  cs.case_study_id,
  cs.title,
  cs.is_published,
  cs.published_at,
  cs.hero_image_asset_id,
  a.cloudinary_url as hero_image,
  COUNT(DISTINCT css.section_id) as total_sections,
  COUNT(DISTINCT CASE WHEN css.section_type = 'hero' THEN css.section_id END) as hero_sections
FROM case_studies cs
LEFT JOIN assets a ON cs.hero_image_asset_id = a.asset_id
LEFT JOIN case_study_sections css ON cs.case_study_id = css.case_study_id
GROUP BY cs.case_study_id, cs.title, cs.is_published, cs.published_at, cs.hero_image_asset_id, a.cloudinary_url
ORDER BY cs.created_at DESC;
```

This shows:
- Which case studies exist
- If they're published
- If they have hero images
- How many sections they have

---

## 🚀 Publish/Unpublish Feature

### Publish a Case Study

```sql
UPDATE case_studies 
SET is_published = true, 
    published_at = NOW()
WHERE case_study_id = 'your-case-study-id';
```

### Unpublish a Case Study

```sql
UPDATE case_studies 
SET is_published = false
WHERE case_study_id = 'your-case-study-id';
```

### Publish All Case Studies

```sql
UPDATE case_studies 
SET is_published = true, 
    published_at = COALESCE(published_at, NOW())
WHERE is_published = false OR is_published IS NULL;
```

---

## 📝 How Publishing Works

### In the Admin Editor

When you click "Publish" in the case study editor:

1. Sets `is_published = true`
2. Sets `published_at = current timestamp`
3. Case study becomes visible on homepage

### On the Homepage

The homepage only shows case studies where:
- `is_published = true`
- Has at least one hero section
- Has a title

---

## ✅ Success Checklist

- [ ] SQL script run successfully
- [ ] `is_published` column exists
- [ ] Case studies show `is_published = true`
- [ ] Case studies have hero sections
- [ ] Homepage refreshed
- [ ] Case studies visible on homepage
- [ ] Can click and view full case study

---

## 🎯 Quick Test

After running the fix:

1. **Check Database:**
   ```sql
   SELECT title, is_published FROM case_studies;
   ```
   Should show `is_published = true`

2. **Check Homepage:**
   - Visit homepage
   - Scroll to Projects section
   - Should see your case studies

3. **Click a Project:**
   - Should navigate to full case study
   - All sections should display

---

## 💡 Prevention

To avoid this in the future:

1. **Apply migrations** when deploying:
   ```bash
   supabase db push
   ```

2. **Check migrations** are applied:
   ```bash
   supabase migration list
   ```

3. **Test publishing** after creating a case study

---

## 📚 Related Files

- `FIX_PUBLISHED_FIELD.sql` - Quick fix SQL script
- `supabase/migrations/005_add_published_field.sql` - Migration file
- `PUBLISH_CASE_STUDIES_FIX.md` - Detailed publishing guide
- `services/api.ts` - getProjects() function (line 439)

---

**Run the SQL script above and your case studies will appear on the homepage!** 🎉
