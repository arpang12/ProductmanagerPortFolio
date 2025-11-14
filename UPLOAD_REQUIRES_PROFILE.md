# File Uploads Require User Profile

## Important Notice

File uploads (images and documents) **require a user profile** to be set up in the database.

## Why?

File uploads need to:
1. Associate files with your organization
2. Track who uploaded the file
3. Organize files in Cloudinary folders by organization
4. Maintain proper access control

## What Happens Without Profile?

If you try to upload a file without setting up your profile, you'll see:

```
❌ Error uploading file: User profile not found. 
   Please set up your profile first by running: 
   node scripts/setup-user-profile-simple.js
```

## How to Fix

### Step 1: Make Sure You're Logged In
Visit http://localhost:5173/admin and log in

### Step 2: Run the Setup Script
```bash
node scripts/setup-user-profile-simple.js
```

### Step 3: Try Uploading Again
Refresh the page and try your upload again - it should work!

## What Works Without Profile?

You can still:
- ✅ Browse all admin sections
- ✅ View default/demo data
- ✅ Explore the interface
- ✅ See how everything works

You cannot:
- ❌ Upload files (images, documents)
- ❌ Save content changes
- ❌ Create new items

## After Setting Up Profile

Once your profile is set up, you can:
- ✅ Upload images for carousel
- ✅ Upload CV documents
- ✅ Upload profile pictures
- ✅ Create and edit all content
- ✅ Full access to all features

## Quick Check

To see if your profile is set up:
```bash
node scripts/diagnose-profile.js
```

This will tell you:
- ✅ If you're logged in
- ✅ If your profile exists
- ✅ What your organization ID is
- ✅ What features are available

---

**Remember**: Run `node scripts/setup-user-profile-simple.js` to enable file uploads!
