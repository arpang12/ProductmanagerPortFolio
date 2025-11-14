# Quick Fix: CV Upload Schema Error

## Error Message
```
Could not find the 'file_name' column of 'cv_versions' in the schema cache
```

## Problem
The `cv_versions` table is missing columns needed to store file metadata.

## Solution (1 Command)

Run this command to apply the database migration:

```bash
npm run db:push
```

This will add the missing columns:
- `file_name` - Stores the original filename
- `file_size` - Stores file size in bytes
- `upload_date` - Stores when file was uploaded

## What the Migration Does

```sql
ALTER TABLE cv_versions 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ;
```

## After Running Migration

1. **Refresh your browser** (F5)
2. **Try uploading again**
3. ✅ Upload should work now!

## Verify It Worked

Check if columns were added:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cv_versions' 
  AND column_name IN ('file_name', 'file_size', 'upload_date');
```

Should return 3 rows.

## Alternative: Manual SQL

If `npm run db:push` doesn't work, run this SQL directly in Supabase dashboard:

1. Go to Supabase Dashboard
2. Click SQL Editor
3. Paste this:
```sql
ALTER TABLE cv_versions 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ;
```
4. Click Run

## Test Upload

After applying the fix:
1. Go to CV Management
2. Upload a CV file
3. Should see:
   - File name displayed
   - File size shown
   - No errors!

## Files Created
- `supabase/migrations/004_add_cv_version_metadata.sql` - The migration

## Why This Happened

The original schema didn't include these metadata columns. They're needed to:
- Display file information to users
- Track upload history
- Show file details on homepage

## Related Issues

This same pattern applies to other upload features:
- ✅ Contact resume upload - Uses `resume_asset_id`
- ✅ Carousel images - Uses `asset_id`
- ✅ CV uploads - Uses `file_asset_id` + metadata

All now working correctly!
