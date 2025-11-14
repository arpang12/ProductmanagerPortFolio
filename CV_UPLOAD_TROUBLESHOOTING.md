# CV Upload Troubleshooting Guide

## Error: "Failed to upload file. Please try again."

This error can have several causes. Follow these steps to diagnose and fix the issue.

## Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try uploading a file again
4. Look for error messages

### Common Error Messages:

#### Error 1: "Development mode detected"
```
⚠️  In development mode - this should not happen for real uploads
Development mode detected - real uploads not available
```

**Cause:** Supabase is not configured in `.env.local`

**Solution:**
1. Check if `.env.local` exists in project root
2. Verify it contains:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restart the dev server: `npm run dev`

#### Error 2: "Not authenticated"
```
❌ Auth check failed
🔍 Current user: Not authenticated
```

**Cause:** User is not logged in

**Solution:**
1. Go to homepage
2. Click "Admin" in header
3. Log in with your credentials
4. Try upload again

#### Error 3: "Upload signature error"
```
❌ Upload signature error: {...}
```

**Cause:** Supabase edge function not deployed or not working

**Solution:**
1. Check Supabase dashboard → Edge Functions
2. Verify `generate-upload-signature` function exists
3. Check function logs for errors
4. Redeploy if needed: `npm run functions:deploy`

#### Error 4: "Cloudinary upload failed"
```
❌ Cloudinary upload failed: {...}
```

**Cause:** Cloudinary credentials not configured or invalid

**Solution:**
1. Go to Supabase dashboard → Settings → Secrets
2. Verify these secrets exist:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Check values are correct
4. Restart edge functions if changed

#### Error 5: "Finalize upload error"
```
❌ Finalize upload error: {...}
```

**Cause:** Database insert failed or RLS policy blocking

**Solution:**
1. Check Supabase dashboard → Database → assets table
2. Verify RLS policies allow INSERT
3. Check user has valid org_id in user_profiles

## Step 2: Check File Requirements

### Supported Formats:
- ✅ PDF (.pdf)
- ✅ Word Document (.doc, .docx)

### File Size Limit:
- Maximum: 10MB
- Recommended: Under 5MB

### File Name:
- Avoid special characters
- Use English characters only
- Keep it short and simple

## Step 3: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try uploading again
4. Look for failed requests (red)

### Check These Requests:

#### Request 1: generate-upload-signature
- **URL:** `/functions/v1/generate-upload-signature`
- **Status:** Should be 200
- **Response:** Should contain `upload_url` and `upload_params`

**If Failed:**
- Check Supabase edge function is deployed
- Check function logs in Supabase dashboard
- Verify authentication token is valid

#### Request 2: Cloudinary Upload
- **URL:** `https://api.cloudinary.com/v1_1/.../upload`
- **Status:** Should be 200
- **Response:** Should contain `public_id` and `secure_url`

**If Failed:**
- Check Cloudinary credentials
- Verify file size is under limit
- Check file format is supported

#### Request 3: finalize-upload
- **URL:** `/functions/v1/finalize-upload`
- **Status:** Should be 200
- **Response:** Should contain asset data

**If Failed:**
- Check database connection
- Verify RLS policies
- Check user permissions

## Step 4: Verify Environment Setup

### Check .env.local:
```bash
# Should contain:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Check Supabase Secrets:
```bash
# In Supabase Dashboard → Settings → Secrets
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Restart Server:
```bash
# After changing .env.local
npm run dev
```

## Step 5: Test with Simple File

Try uploading a simple test file:
1. Create a small PDF (under 1MB)
2. Name it simply: `test.pdf`
3. Try uploading
4. Check console for detailed logs

## Step 6: Check Database

### Verify User Profile:
```sql
SELECT * FROM user_profiles WHERE user_id = 'your-user-id';
```

Should have:
- ✅ Valid `org_id`
- ✅ User exists

### Check Assets Table:
```sql
SELECT * FROM assets WHERE org_id = 'your-org-id' ORDER BY created_at DESC LIMIT 5;
```

Should show recent uploads.

### Check RLS Policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'assets';
```

Should allow INSERT for authenticated users.

## Step 7: Common Solutions

### Solution 1: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Try upload again

### Solution 2: Try Different Browser
- Test in Chrome
- Test in Firefox
- Test in incognito/private mode

### Solution 3: Check File Permissions
- Make sure file is not corrupted
- Try opening file locally first
- Try a different file

### Solution 4: Restart Everything
```bash
# Stop dev server (Ctrl+C)
# Restart
npm run dev
```

## Detailed Error Logging

The system now logs detailed information:

### Upload Start:
```
🔄 Starting document upload: filename.pdf 1234567 application/pdf
🔍 Development mode check: false
🔍 Current user: user@example.com
```

### Upload Signature:
```
📋 Upload signature response: Success
```

### Cloudinary Upload:
```
🔄 Uploading to Cloudinary: https://api.cloudinary.com/...
📊 Cloudinary response status: 200
✅ Cloudinary upload successful: abc123xyz
```

### Finalize:
```
🔄 Finalizing upload...
✅ Upload finalized successfully
```

### CV Section Save:
```
💾 Saving CV section with updated version...
✅ CV section saved successfully
```

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Logged in to admin panel
- [ ] .env.local file exists and has correct values
- [ ] Dev server restarted after .env changes
- [ ] File is PDF or DOC/DOCX
- [ ] File size is under 10MB
- [ ] Browser console shows no errors
- [ ] Network tab shows all requests succeed
- [ ] Supabase edge functions are deployed
- [ ] Cloudinary credentials are configured
- [ ] User has valid org_id in database

## Still Not Working?

### Get Help:
1. Copy all console logs
2. Copy network tab errors
3. Check Supabase function logs
4. Check database for errors

### Manual Test:
```bash
# Test upload directly
node scripts/test-image-upload.js
```

### Check System Status:
```bash
# Run comprehensive test
node scripts/test-all-sections.js
```

## Success Indicators

When upload works correctly, you should see:

1. **Console Logs:**
   ```
   🔄 Starting document upload...
   ✅ Upload successful
   💾 Saving CV section...
   ✅ CV section saved successfully
   ```

2. **Alert Message:**
   ```
   CV file uploaded successfully!
   ```

3. **UI Updates:**
   - File name displays
   - File size shows
   - Download icon appears
   - "Uploading..." changes to file info

4. **Persistence:**
   - Refresh page
   - File still shows
   - Download works

## Prevention

To avoid upload issues:

1. **Always log in first** before uploading
2. **Keep files under 5MB** for best performance
3. **Use simple file names** without special characters
4. **Check console** before reporting issues
5. **Test with small files** first

## Related Documentation

- `CV_MANAGEMENT_PERSISTENCE_FIX.md` - Persistence details
- `IMAGE_UPLOAD_FIXED.md` - Image upload guide
- `CLOUDINARY_SIGNATURE_FIXED.md` - Cloudinary setup
- `scripts/test-cv-management.js` - Test script
