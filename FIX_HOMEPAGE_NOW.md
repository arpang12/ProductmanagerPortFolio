# 🔧 Fix Homepage - Case Studies Not Showing

## Quick 3-Step Fix

### Step 1: Go to Supabase SQL Editor

1. Open: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz
2. Click **SQL Editor** in left sidebar
3. Click **"New query"**

### Step 2: Run Diagnostic

Copy and paste this to see what's wrong:

```sql
-- Check if is_published exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'case_studies' 
AND column_name = 'is_published';

-- Check case studies status
SELECT 
  case_study_id,
  title,
  is_published,
  (SELECT COUNT(*) FROM case_study_sections WHERE case_study_sections.case_study_id = case_studies.case_study_id AND section_type = 'hero') as has_hero
FROM case_studies
ORDER BY created_at DESC;
```

Click **Run**. Look at the results:

**If `is_published` column doesn't exist:**
- Go to Step 3A

**If `is_published` is `false` or `NULL`:**
- Go to Step 3B

**If `has_hero` is `0`:**
- Go to Step 3C

### Step 3A: Add is_published Column

```sql
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

UPDATE case_studies 
SET is_published = true, 
    published_at = NOW();

-- Verify
SELECT title, is_published FROM case_studies;
```

### Step 3B: Publish All Case Studies

```sql
UPDATE case_studies 
SET is_published = true, 
    published_at = NOW()
WHERE is_published IS NULL OR is_published = false;

-- Verify
SELECT title, is_published FROM case_studies;
```

### Step 3C: Check Hero Sections

If case studies have no hero sections, they won't show. Fix in Admin:

1. Go to Admin page
2. Edit your case study
3. Make sure **Hero** section is **enabled** (toggle on)
4. Fill in headline and tagline
5. Save
6. Click **Publish**

### Step 4: Verify

Run this to confirm:

```sql
SELECT 
  cs.title,
  cs.is_published,
  COUNT(css.section_id) as sections,
  COUNT(CASE WHEN css.section_type = 'hero' THEN 1 END) as hero_sections
FROM case_studies cs
LEFT JOIN case_study_sections css ON cs.case_study_id = css.case_study_id
WHERE cs.is_published = true
GROUP BY cs.case_study_id, cs.title, cs.is_published;
```

Should show:
- `is_published = true`
- `hero_sections = 1` or more

### Step 5: Refresh Homepage

1. Go to your homepage
2. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. Scroll to Projects section
4. Your case studies should appear!

---

## Still Not Working?

### Check Browser Console

1. Press **F12**
2. Go to **Console** tab
3. Look for errors
4. Share the error message

### Check Network Tab

1. Press **F12**
2. Go to **Network** tab
3. Refresh page
4. Look for failed requests (red)
5. Click on them to see error details

### Common Issues

**"Development Mode" banner still showing:**
- Environment variables not set in Vercel
- Redeploy needed
- Clear browser cache

**Console error: "is_published column doesn't exist":**
- Run Step 3A above

**No case studies in database:**
- Create one in Admin page
- Make sure to save and publish

**Case study has no hero section:**
- Edit in Admin
- Enable Hero section
- Fill in content
- Save and publish

---

## Quick Test Query

Run this to see exactly what the homepage will show:

```sql
SELECT 
  cs.case_study_id,
  cs.title,
  cs.is_published,
  a.cloudinary_url as image,
  css.content->>'headline' as headline
FROM case_studies cs
LEFT JOIN assets a ON cs.hero_image_asset_id = a.asset_id
INNER JOIN case_study_sections css 
  ON cs.case_study_id = css.case_study_id 
  AND css.section_type = 'hero'
WHERE cs.is_published = true;
```

This is the exact query the homepage uses. If this returns results, they should appear on homepage.

---

## ✅ Success Checklist

- [ ] `is_published` column exists
- [ ] Case studies have `is_published = true`
- [ ] Case studies have hero sections
- [ ] SQL query returns results
- [ ] Browser cache cleared
- [ ] Homepage refreshed
- [ ] Case studies visible!

---

**Most common fix: Just run Step 3B to publish all case studies!** 🚀
