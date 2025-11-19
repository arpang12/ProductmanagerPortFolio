# ✅ Fix: Case Studies Missing from Public Homepage

## Problem Found

Your case study "jtk" has the wrong `org_id`:
- Case study org_id: `default-org` ❌
- Your profile org_id: `arpan-portfolio` ✅

This mismatch prevents the case study from appearing on your public homepage.

## Quick Fix

### Option 1: Run SQL (Recommended - 30 seconds)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy ALL content from `RUN_THIS_TO_FIX_CASE_STUDIES.sql`
4. Paste and click **"Run"**
5. Refresh your homepage: http://localhost:3002/

### Option 2: Manual Update

In Supabase SQL Editor, run:

```sql
UPDATE case_studies
SET org_id = 'arpan-portfolio'
WHERE org_id = 'default-org';
```

## Why This Happened

When case studies are created, they need to be associated with your profile's `org_id`. Somehow the case study got created with `default-org` instead of `arpan-portfolio`.

## How to Verify It's Fixed

After running the SQL:

1. **Check in browser**: Visit http://localhost:3002/
2. **Look for**: "Magical Projects" section should show your "jtk" case study
3. **Console check**: Open DevTools (F12) and look for any errors

## What the Fix Does

```
Before:
  Profile org_id: arpan-portfolio
  Case study org_id: default-org
  Result: ❌ No match → Case study hidden

After:
  Profile org_id: arpan-portfolio
  Case study org_id: arpan-portfolio
  Result: ✅ Match → Case study visible!
```

## Test Results

Run this to verify:
```bash
node scripts/check-org-id-mismatch.js
```

Should show:
```
✅ All case studies have correct org_id!
```

## Prevention

When creating new case studies in the future, the admin panel should automatically use your profile's `org_id`. This was likely a one-time issue during initial setup.

---

**Status**: 🔧 Ready to fix  
**Time**: 30 seconds  
**File to run**: `RUN_THIS_TO_FIX_CASE_STUDIES.sql`  
**Expected result**: Case studies appear on homepage  
