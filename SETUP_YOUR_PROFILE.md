# Setup Your User Profile

## Why You Need This

Your user profile is missing from the database. This is why:
- ✅ You can browse all sections (they show demo data)
- ❌ You cannot upload files
- ❌ You cannot save changes

## Quick Setup (5 minutes)

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Log in to your account
   - Select your project: `djbdwbkhnrdnjreigtfz`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Run This SQL**
   ```sql
   -- Create organization if needed
   INSERT INTO organizations (org_id, name, slug)
   VALUES ('default-org', 'My Portfolio', 'my-portfolio')
   ON CONFLICT (org_id) DO NOTHING;

   -- Create user profile
   INSERT INTO user_profiles (user_id, org_id, email, name, role)
   VALUES (
     '1f1a3c1a-e0ff-42a6-910c-930724e7ea5d',
     'default-org',
     'your-email@example.com',  -- Replace with your actual email
     'Portfolio Owner',          -- Replace with your name
     'admin'
   )
   ON CONFLICT (user_id) DO UPDATE SET
     org_id = EXCLUDED.org_id,
     name = EXCLUDED.name,
     role = EXCLUDED.role,
     updated_at = NOW();

   -- Verify it worked
   SELECT * FROM user_profiles WHERE user_id = '1f1a3c1a-e0ff-42a6-910c-930724e7ea5d';
   ```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify Success**
   - You should see your profile in the results
   - Look for a row with your user_id

6. **Refresh Your Admin Page**
   - Go back to http://localhost:5173/admin
   - Refresh the page (F5)
   - Try uploading a file - it should work now!

### Option 2: Generate Custom SQL

Run this script to generate SQL with your actual email:
```bash
node scripts/generate-profile-sql.js
```

Then copy the output and paste it into Supabase SQL Editor.

## What This Does

The SQL creates two things:

1. **Organization** (`default-org`)
   - Your portfolio's organization
   - All your content belongs to this org
   - Enables multi-user support in the future

2. **User Profile**
   - Links your auth user to the organization
   - Stores your name and role
   - Enables all features

## After Setup

Once your profile is created, you can:
- ✅ Upload images (carousel, profile pics)
- ✅ Upload documents (CV files)
- ✅ Save content changes
- ✅ Create new items
- ✅ Edit existing content
- ✅ Use all admin features

## Verify It Worked

### Method 1: Try Uploading
1. Go to CV Management
2. Try uploading a CV file
3. If it works, you're all set!

### Method 2: Check Console
1. Open browser console (F12)
2. Refresh the page
3. Look for: "User profile org_id: default-org"
4. No more "User profile not found" warnings

### Method 3: Run Diagnostic
```bash
node scripts/diagnose-profile.js
```

Should show:
```
✅ User profile found
   Profile ID: [your-user-id]
   Name: Portfolio Owner
   Role: admin
   Org ID: default-org
```

## Troubleshooting

### "Permission denied" error
- Make sure you're logged in to Supabase dashboard
- Try using the SQL Editor (not the Table Editor)
- The SQL has proper conflict handling

### "Email already exists" error
- This is fine! The SQL uses ON CONFLICT to update
- Your profile will be updated, not duplicated

### Still not working?
1. Check you copied the entire SQL
2. Verify the user_id matches yours: `1f1a3c1a-e0ff-42a6-910c-930724e7ea5d`
3. Make sure you clicked "Run" in SQL Editor
4. Try refreshing your admin page
5. Check browser console for new errors

## Need Help?

Run the diagnostic tool:
```bash
node scripts/diagnose-profile.js
```

This will tell you exactly what's missing and how to fix it.

---

**TL;DR**: Copy the SQL above, paste it in Supabase SQL Editor, click Run, refresh your admin page. Done!
