# CV Persistence Issue - Diagnosis & Fix

## Problem
Google Drive URLs and other CV data saves successfully (shows success message) but disappears when you close and reopen CV Management.

## Root Causes

### 1. Missing Database Columns ⚠️
The database is missing required columns. You need to run the SQL migration!

**Check if you ran this SQL:**
```sql
ALTER TABLE cv_versions 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ;
```

### 2. Silent Save Failures
The save might be failing but showing success message anyway.

## Step-by-Step Fix

### Step 1: Run the SQL Migration (CRITICAL!)

**Go to Supabase Dashboard:**
1. Open https://supabase.com
2. Go to SQL Editor
3. Run this SQL:

```sql
-- Add missing columns to cv_versions
ALTER TABLE cv_versions 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cv_versions' 
  AND column_name IN ('file_name', 'file_size', 'upload_date', 'order_key');
```

Should return 4 rows showing all columns exist.

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try saving again
4. Look for errors

**Common errors:**
- `column "file_name" does not exist` → Run SQL migration
- `column "order_key" violates not-null constraint` → Already fixed in code
- `permission denied` → Check RLS policies

### Step 3: Test Save Operation

1. Open CV Management
2. Add Google Drive URL
3. Click "Save All Changes"
4. **Check console logs:**
   - Should see: `💾 Saving all CV changes...`
   - Should see: `✅ All changes saved successfully`
   - Should NOT see any ❌ errors

### Step 4: Verify Database

Run this SQL to check if data was saved:

```sql
-- Check CV versions
SELECT 
  cv.cv_version_id,
  cv.name,
  cv.type,
  cv.google_drive_url,
  cv.file_name,
  cv.is_active,
  cv.order_key
FROM cv_versions cv
JOIN cv_sections cs ON cv.cv_section_id = cs.cv_section_id
WHERE cs.org_id = (
  SELECT org_id FROM user_profiles 
  WHERE user_id = auth.uid()
  LIMIT 1
);
```

**What to look for:**
- ✅ `google_drive_url` should have your URL
- ✅ `order_key` should have values like '000001', '000002', '000003'
- ❌ If `google_drive_url` is NULL → Save failed

### Step 5: Check RLS Policies

Run this to verify you can update:

```sql
-- Test if you can update cv_versions
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'cv_versions';
```

Should show policies allowing UPDATE for authenticated users.

## Quick Test Script

Run this in browser console after saving:

```javascript
// Check if data persists
const testPersistence = async () => {
  const response = await fetch('/api/cv-section');
  const data = await response.json();
  console.log('CV Data:', data);
  console.log('Indian CV Google Drive URL:', 
    data.versions.find(v => v.type === 'indian')?.googleDriveUrl
  );
};
testPersistence();
```

## Common Issues & Solutions

### Issue 1: "Success" but data not saved
**Cause:** SQL migration not run
**Solution:** Run the SQL in Step 1

### Issue 2: Console shows errors
**Cause:** Database schema mismatch
**Solution:** 
1. Run SQL migration
2. Refresh browser
3. Try again

### Issue 3: Data saves but doesn't load
**Cause:** Transform function not reading field
**Solution:** Already fixed in code

### Issue 4: Only file uploads work, not Google Drive URLs
**Cause:** Different code paths
**Solution:** Use "Save All Changes" button

## Verification Checklist

Before testing:
- [ ] SQL migration run in Supabase
- [ ] Browser refreshed (F5)
- [ ] Console open to see logs
- [ ] Logged in to admin panel

During test:
- [ ] Add Google Drive URL
- [ ] Yellow banner appears
- [ ] Click "Save All Changes"
- [ ] See "Saving..." state
- [ ] See success message
- [ ] No errors in console

After test:
- [ ] Close CV Management
- [ ] Reopen CV Management
- [ ] Google Drive URL still there ✅
- [ ] "Google Drive Link Active" shows ✅

## Debug Mode

Add this to see detailed logs:

1. Open browser console
2. Before saving, run:
```javascript
localStorage.setItem('debug', 'true');
```

3. Try saving again
4. You'll see detailed logs

## If Still Not Working

### Check 1: Verify Migration Ran
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'cv_versions' 
  AND column_name = 'file_name';
```
Should return 1 row. If not, migration didn't run.

### Check 2: Check Actual Database Values
```sql
SELECT * FROM cv_versions LIMIT 5;
```
Look at the actual data.

### Check 3: Test Direct Update
```sql
UPDATE cv_versions 
SET google_drive_url = 'https://test.com'
WHERE cv_version_id = 'your-version-id';
```
If this fails, it's a permissions issue.

## Success Indicators

✅ SQL migration returns "Success"
✅ Verification query returns 4 rows
✅ Save shows success message
✅ No console errors
✅ Data persists after close/reopen
✅ Database query shows saved data

## Next Steps

1. **Run SQL migration** (most important!)
2. **Refresh browser**
3. **Test save again**
4. **Check console for errors**
5. **Verify in database**

If you've done all this and it still doesn't work, share:
- Console error messages
- SQL query results
- Screenshot of database table structure
