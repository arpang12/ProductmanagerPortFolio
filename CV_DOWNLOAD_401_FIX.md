# CV Download 401 Error - Fix Guide

## Problem
When clicking the download button, you see:
```
This page isn't working right now
HTTP ERROR 401
```

The Cloudinary URL returns 401 Unauthorized.

## Root Cause
The uploaded files are not publicly accessible. This happens because:
1. Cloudinary upload type is not explicitly set to "upload" (public)
2. Files are uploaded as "authenticated" type by default for raw files
3. Cloudinary account may require authentication for file access

## Solution Options

### Option 1: Update Edge Function (Recommended)

The edge function needs to be updated to explicitly set files as public.

**I've already updated the code**, but you need to redeploy:

#### If you have Supabase CLI:
```bash
supabase functions deploy generate-upload-signature
```

#### If you don't have Supabase CLI:

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Find `generate-upload-signature`
4. Click "Edit"
5. Update line 95 to include `type: 'upload'`:

```typescript
const signParams: Record<string, string> = {
  folder,
  public_id,
  timestamp,
  type: 'upload'  // Add this line
}
```

6. Click "Deploy"

### Option 2: Use Google Drive URLs (Quick Workaround)

Instead of uploading files, use Google Drive:

1. Upload your CV to Google Drive
2. Right-click → Get link → Set to "Anyone with the link"
3. Copy the link
4. In CV Management, paste the link in "Google Drive URL" field
5. ✅ Download will work immediately!

### Option 3: Fix Cloudinary Settings

1. Go to Cloudinary Dashboard
2. Settings → Security
3. Find "Secure URLs for image and video delivery"
4. Make sure it's set to "Optional" not "Required"
5. Save changes
6. Re-upload your CV files

## Temporary Fix: Make Existing Files Public

If you've already uploaded files and they're showing 401:

### Via Cloudinary Dashboard:
1. Go to Cloudinary Dashboard
2. Media Library
3. Find your uploaded CV files
4. Select the file
5. Click "Settings" (gear icon)
6. Change "Type" from "authenticated" to "upload"
7. Save

### Via Cloudinary API:
Run this in Supabase SQL Editor:

```sql
-- Get all CV file URLs that need fixing
SELECT 
  cv.name,
  cv.file_name,
  a.cloudinary_public_id,
  a.cloudinary_url
FROM cv_versions cv
JOIN assets a ON cv.file_asset_id = a.asset_id
WHERE cv.file_asset_id IS NOT NULL;
```

Then manually update each file in Cloudinary dashboard.

## Testing the Fix

### Test 1: Upload New File
1. Go to CV Management
2. Upload a new CV file
3. Click download button
4. ✅ Should download without 401 error

### Test 2: Check URL
The URL should look like:
```
https://res.cloudinary.com/YOUR-CLOUD/raw/upload/v1234567890/production/org-id/asset_ABC.pdf
```

Key parts:
- `raw/upload` - Means it's a public raw file
- NOT `raw/authenticated` - Would cause 401

### Test 3: Direct Access
Copy the Cloudinary URL and paste in browser:
- ✅ Should download file
- ❌ Should NOT show 401 error

## Why This Happened

### Cloudinary Upload Types:
- **upload** (public) - Anyone can access with URL
- **authenticated** - Requires signed URL with timestamp
- **private** - Requires authentication token

### Default Behavior:
- Images → `upload` (public)
- Raw files (PDFs, docs) → `authenticated` (private)

### Our Fix:
Explicitly set `type: 'upload'` for all uploads to make them public.

## Prevention

After applying the fix:
- ✅ All new uploads will be public
- ✅ Download buttons will work
- ✅ No 401 errors

For existing files:
- Either re-upload them
- Or manually change type in Cloudinary
- Or use Google Drive URLs

## Alternative: Signed URLs

If you want to keep files private but still allow downloads, you can implement signed URLs:

1. Generate temporary signed URLs on-demand
2. URLs expire after X minutes
3. More secure but more complex

This would require additional edge function changes.

## Quick Workaround Summary

**Fastest solution right now:**

1. **Use Google Drive URLs** for existing CVs
   - Upload to Google Drive
   - Set sharing to "Anyone with link"
   - Paste URL in CV Management
   - ✅ Works immediately!

2. **For future uploads:**
   - Update edge function (I've done this)
   - Redeploy function
   - New uploads will be public

## Files Modified

- `supabase/functions/generate-upload-signature/index.ts` - Added `type: 'upload'`
- `CV_DOWNLOAD_401_FIX.md` - This guide

## Related Issues

This same fix applies to:
- ✅ Contact resume downloads
- ✅ Any document uploads
- ✅ All Cloudinary raw file uploads

## Support

If 401 errors persist:
1. Check Cloudinary dashboard → Media Library
2. Verify file exists
3. Check file type (should be "upload" not "authenticated")
4. Check Cloudinary account settings
5. Try Google Drive URL as workaround
