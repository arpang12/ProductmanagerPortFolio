# 🚀 Publish Feature Setup Guide

## What's New

Added publish/unpublish functionality for case studies! Now you can:
- ✅ Save case studies as drafts
- ✅ Publish them when ready
- ✅ Unpublish if needed
- ✅ Only published case studies appear on homepage

---

## 🔧 Setup Required

### Step 1: Run Database Migration

You need to add the `is_published` field to your database.

**Option A: Using Supabase CLI** (Recommended)
```bash
supabase db push
```

**Option B: Manual SQL in Supabase Dashboard**
1. Go to https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz
2. Click "SQL Editor"
3. Click "New Query"
4. Copy and paste this SQL:

```sql
-- Add is_published field to case_studies table
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Add published_at timestamp
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create index for faster queries on published case studies
CREATE INDEX IF NOT EXISTS idx_case_studies_published 
ON case_studies(is_published, created_at DESC);

-- Optional: Set existing case studies as published
-- Uncomment the line below if you want existing case studies to be published by default
-- UPDATE case_studies SET is_published = true WHERE is_published IS NULL;
```

5. Click "Run"
6. You should see "Success. No rows returned"

### Step 2: Redeploy to Vercel

Vercel will automatically redeploy when you push to GitHub (already done!).

Or manually trigger:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Deployments"
4. Click "Redeploy" on the latest deployment

---

## 🎯 How to Use

### In the Case Study Editor:

**Save as Draft:**
1. Edit your case study
2. Click "Save Changes"
3. Case study is saved but NOT visible on homepage

**Publish:**
1. Click the "🚀 Publish" button
2. Case study is now live on homepage
3. Button changes to "📤 Unpublish"

**Unpublish:**
1. Click the "📤 Unpublish" button
2. Case study is hidden from homepage
3. Still accessible in admin panel
4. Button changes back to "🚀 Publish"

---

## 📊 What Changed

### Database Schema
- Added `is_published` (boolean) field
- Added `published_at` (timestamp) field
- Added index for performance

### TypeScript Types
- Updated `CaseStudy` interface with `is_published` and `published_at`

### Admin Page
- Added "Publish" / "Unpublish" button next to "Save Changes"
- Button color changes based on state:
  - Green "🚀 Publish" when unpublished
  - Orange "📤 Unpublish" when published

### Homepage
- Only shows published case studies
- Unpublished case studies are hidden
- Empty state if no published studies

### API
- `getProjects()` now filters by `is_published = true`
- `updateCaseStudy()` handles publish status

---

## ✅ Testing Checklist

- [ ] Database migration run successfully
- [ ] Vercel redeployed
- [ ] Can save case study as draft
- [ ] Can publish case study
- [ ] Published case study appears on homepage
- [ ] Can unpublish case study
- [ ] Unpublished case study disappears from homepage
- [ ] Unpublished case study still visible in admin

---

## 🔍 Troubleshooting

### "Column does not exist" error
**Solution:** Run the database migration (Step 1 above)

### Publish button not showing
**Solution:** 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check Vercel deployment completed

### All case studies disappeared from homepage
**Cause:** All case studies are unpublished by default

**Solution:** Go to admin panel and publish the ones you want visible:
1. Open each case study in editor
2. Click "🚀 Publish"
3. They will appear on homepage

### Want to publish all existing case studies at once?
Run this SQL in Supabase Dashboard:
```sql
UPDATE case_studies 
SET is_published = true, 
    published_at = NOW() 
WHERE is_published IS NULL OR is_published = false;
```

---

## 💡 Use Cases

### Draft Workflow
1. Create new case study
2. Work on it over time (saves as draft)
3. When ready, click "Publish"
4. Goes live immediately

### Temporary Removal
1. Need to update a published case study?
2. Click "Unpublish" to hide it
3. Make your changes
4. Click "Publish" when ready

### Portfolio Curation
1. Keep all your work in the system
2. Only publish your best projects
3. Rotate published projects seasonally
4. Maintain a curated portfolio

---

## 🎨 UI Changes

### Editor Header
```
Before: [Save Changes]
After:  [Save Changes] [🚀 Publish]
```

When published:
```
[Save Changes] [📤 Unpublish]
```

### Button States
- **Unpublished**: Green button with "🚀 Publish"
- **Published**: Orange button with "📤 Unpublish"
- **Saving**: Gray button (disabled)

---

## 📚 Related Files

### Modified:
- `types.ts` - Added publish fields to CaseStudy interface
- `pages/AdminPage.tsx` - Added publish button and handler
- `services/api.ts` - Updated getProjects to filter published

### Created:
- `supabase/migrations/005_add_published_field.sql` - Database migration
- `PUBLISH_FEATURE_SETUP.md` - This guide

---

## ✨ Benefits

- ✅ **Better workflow**: Save drafts, publish when ready
- ✅ **Portfolio control**: Show only your best work
- ✅ **Flexibility**: Easy to hide/show projects
- ✅ **Professional**: No half-finished projects visible
- ✅ **SEO friendly**: Only complete content indexed

---

**Your publish feature is ready! Just run the database migration and start using it!** 🎉
