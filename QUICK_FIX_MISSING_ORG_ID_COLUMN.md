# ✅ QUICK FIX: Missing org_id Column

## Problem
```
ERROR: 42703: column "org_id" does not exist
```

## Root Cause
The `case_study_sections` table is missing the `org_id` column that RLS policies expect.

## Fix
✅ **Code**: Already updated in `services/api.ts`  
🔧 **Database**: Run `ADD_ORG_ID_TO_CASE_STUDY_SECTIONS.sql`

## Steps to Fix

### 1. Run SQL Migration
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy **ALL** content from `ADD_ORG_ID_TO_CASE_STUDY_SECTIONS.sql`
3. Paste and click **"Run"**

### 2. Test
1. Try creating/editing a case study
2. Should work without errors

## What It Does
- ✅ Adds missing `org_id` column
- ✅ Populates existing records
- ✅ Creates proper RLS policies
- ✅ Enables case study editing

## Result
After running the SQL:
- ✅ Case study creation works
- ✅ Section editing works
- ✅ No more RLS errors
- ✅ Can add projects to public portfolio

---

**Action**: Run `ADD_ORG_ID_TO_CASE_STUDY_SECTIONS.sql`  
**Expected**: Case study management works perfectly  