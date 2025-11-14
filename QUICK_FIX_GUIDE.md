# Quick Fix Guide - 406 Error Resolution

## The Problem
Getting **406 Not Acceptable** errors and **"Cannot read properties of null"** errors in admin sections.

## The Quick Fix (3 Steps)

### Step 1: Make Sure You're Logged In
```
Visit: http://localhost:5173/admin
Log in with your credentials
```

### Step 2: Run the Diagnostic
```bash
node scripts/diagnose-profile.js
```

This will tell you exactly what's wrong.

### Step 3: Fix the Profile
```bash
node scripts/setup-user-profile-simple.js
```

This creates your user profile if it's missing.

### Step 4: Refresh
Refresh your admin page - errors should be gone!

## What Was Fixed

The code now handles missing user profiles gracefully:
- ✅ No more crashes
- ✅ Shows default data instead of errors
- ✅ All sections load properly
- ✅ Clear error messages in console

## Verification

After running the fix, you should see:
- ✅ Journey section loads
- ✅ CV section loads
- ✅ Contact section loads
- ✅ All other sections work
- ✅ No 406 errors in console

## If You Still Have Issues

1. Check the browser console for specific errors
2. Run the diagnostic script again
3. Make sure you're logged in
4. Check that your .env.local has correct Supabase credentials

## Need More Help?

See these detailed guides:
- `USER_PROFILE_FIX.md` - Detailed explanation
- `FIXES_APPLIED.md` - Technical details
- `QUICK_START.md` - General setup guide

---

**TL;DR**: Run `node scripts/setup-user-profile-simple.js` while logged in, then refresh.
