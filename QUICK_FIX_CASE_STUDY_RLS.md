# ✅ QUICK FIX: Case Study Sections RLS Error

## Problem
```
Failed to save changes: new row violates row-level security policy for table "case_study_sections"
```

## Root Cause
Case study sections were missing `org_id` field, causing RLS policy to block saves.

## Fix Applied
✅ **Code Fix**: Added `org_id` to `createDefaultSections()` function in `services/api.ts`

## Still Need to Run
🔧 **Database Fix**: Run `FIX_CASE_STUDY_SECTIONS_RLS.sql` in Supabase SQL Editor

## Steps to Complete Fix

### 1. Run SQL Fix
1. Open Supabase Dashboard → SQL Editor
2. Copy ALL content from `FIX_CASE_STUDY_SECTIONS_RLS.sql`
3. Paste and click "Run"

### 2. Test
1. Try creating/editing a case study
2. Should work without RLS errors

## Result
After running the SQL, you'll be able to:
- ✅ Create case studies
- ✅ Edit case study sections  
- ✅ Save changes without errors
- ✅ Publish case studies

---

**Status**: ✅ Code fixed, SQL needs to be run  
**Action**: Run `FIX_CASE_STUDY_SECTIONS_RLS.sql`  
**Expected**: Case study editing works  