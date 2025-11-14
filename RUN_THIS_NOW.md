# 🚀 Run This Now - Complete Setup Guide

## What This Does

This will:
1. ✅ Create your organization
2. ✅ Create your user profile
3. ✅ Clean up duplicate CV sections
4. ✅ Enable all features (uploads, saving, etc.)

## Steps to Run

### 1. Open Supabase Dashboard

Go to: **https://supabase.com/dashboard**

### 2. Select Your Project

Click on your project: **djbdwbkhnrdnjreigtfz**

### 3. Open SQL Editor

- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** button

### 4. Copy the SQL

Open the file: **`SUPABASE_SETUP_COMPLETE.sql`**

Copy ALL the SQL (the entire file)

### 5. Paste and Modify

Paste the SQL into the editor, then:

**IMPORTANT:** Find this line:
```sql
'your-email@example.com',  -- ⚠️ REPLACE THIS
```

Replace `your-email@example.com` with your actual email address.

To find your email, look at the results from Step 2 in the SQL, or check your Supabase auth users.

### 6. Run the SQL

Click the **"Run"** button (or press Ctrl+Enter)

### 7. Check the Results

You should see several result tables showing:
- ✅ Your user email
- ✅ Profile created successfully
- ✅ 1 organization
- ✅ 1 user profile
- ✅ 1 CV section

### 8. Refresh Your Admin Page

- Go to: http://localhost:5173/admin
- Press F5 to refresh
- Try uploading a file - it should work now!

## Quick Verification

Run this in your terminal:
```bash
node scripts/diagnose-profile.js
```

Should show all green checkmarks ✅

## What Changes

### Before Setup
- ⚠️ Can browse admin (demo data)
- ❌ Cannot upload files
- ❌ Cannot save changes

### After Setup
- ✅ Can browse admin (real data)
- ✅ Can upload files
- ✅ Can save changes
- ✅ All features enabled

## Troubleshooting

### "Permission denied" error
- Make sure you're logged in to Supabase dashboard
- Try refreshing the dashboard
- Make sure you selected the correct project

### "Email already exists" error
- This is fine! The SQL uses ON CONFLICT to update
- Your profile will be updated, not duplicated

### Still not working?
1. Check you replaced the email address
2. Verify the user_id matches: `1f1a3c1a-e0ff-42a6-910c-930724e7ea5d`
3. Run: `node scripts/diagnose-profile.js`
4. Check browser console for errors

## After Setup

Once complete, you can:

1. **Upload CV Files**
   - Go to Admin → CV Management
   - Upload PDF files
   - They'll appear on homepage

2. **Add Content**
   - Edit "My Story"
   - Add journey milestones
   - Upload carousel images

3. **Configure AI**
   - Add your Gemini API key
   - Use AI content enhancement

## Files Reference

- `SUPABASE_SETUP_COMPLETE.sql` - The SQL to run
- `scripts/diagnose-profile.js` - Verify setup
- `SETUP_YOUR_PROFILE.md` - Detailed guide
- `CV_CONNECTION_EXPLAINED.md` - How CV works

---

**Ready?** Open `SUPABASE_SETUP_COMPLETE.sql`, copy it, and run it in Supabase!
