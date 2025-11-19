# ✅ FIXED: Missing org_id Column in case_study_sections

## Problem

Two related errors:
1. `Failed to save changes: new row violates row-level security policy for table "case_study_sections"`
2. `ERROR: 42703: column "org_id" does not exist`

## Root Cause

The `case_study_sections` table is **missing the `org_id` column** entirely. This explains both errors:

1. **RLS Policy Error**: The security policies expect an `org_id` column to determine ownership
2. **SQL Error**: The policies reference a column that doesn't exist

## Database Schema Issue

**Current Schema:**
```
case_study_sections:
- section_id ✅
- case_study_id ✅  
- section_type ✅
- title ✅
- content ✅
- enabled ✅
- order_key ✅
- metadata ✅
- created_at ✅
- updated_at ✅
- org_id ❌ MISSING!
```

**Expected Schema:**
```
case_study_sections:
- All above columns ✅
- org_id ✅ NEEDED!
```

## Complete Fix

### Step 1: Add Missing Column (SQL)
Run `ADD_ORG_ID_TO_CASE_STUDY_SECTIONS.sql` in Supabase SQL Editor.

This will:
1. ✅ Add `org_id` column to `case_study_sections`
2. ✅ Populate existing records with correct `org_id` from related case studies
3. ✅ Create proper RLS policies
4. ✅ Add performance index

### Step 2: Code Fix (Already Applied)
The code in `services/api.ts` has been updated to include `org_id` when creating new sections.

## Files Created

1. **ADD_ORG_ID_TO_CASE_STUDY_SECTIONS.sql** - Complete database fix
2. **scripts/check-case-study-sections-schema.js** - Schema verification tool

## How to Apply

### Run the SQL Fix:
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy **ALL** content from `ADD_ORG_ID_TO_CASE_STUDY_SECTIONS.sql`
3. Paste and click **"Run"**
4. Should see success messages

### Verify the Fix:
```sql
-- Check if org_id column exists and is populated
SELECT section_id, case_study_id, org_id, section_type 
FROM case_study_sections 
LIMIT 5;
```

Should show `org_id` values, not NULL.

## What the Fix Does

### Before Fix:
```
case_study_sections table:
- No org_id column ❌
- RLS policies fail ❌
- Cannot determine ownership ❌
- INSERT/UPDATE blocked ❌
```

### After Fix:
```
case_study_sections table:
- Has org_id column ✅
- RLS policies work ✅
- Ownership determined correctly ✅
- INSERT/UPDATE allowed ✅
```

## Testing After Fix

### Test Case Study Creation:
1. Go to Admin → Case Studies
2. Click "Create New Case Study"
3. Should create without errors

### Test Section Editing:
1. Open existing case study
2. Edit any section
3. Click "Save"
4. Should save without RLS errors

### Test New Sections:
1. Try adding new sections
2. Enable/disable sections
3. All should work properly

## Why This Happened

The `case_study_sections` table was created without the `org_id` column, but:
1. The RLS policies assumed it existed
2. The code was updated to use it
3. This created a mismatch between schema and expectations

This is a common issue when database schema evolves but migrations aren't applied consistently.

## Prevention

Future case study sections will automatically have the correct `org_id` because:
1. The `createDefaultSections()` function now includes it
2. The database column now exists
3. RLS policies enforce it

## Verification Commands

After running the SQL, verify with:

```bash
# Check schema
node scripts/check-case-study-sections-schema.js

# Should show org_id column exists
```

```sql
-- Check data
SELECT COUNT(*) as total_sections,
       COUNT(org_id) as sections_with_org_id
FROM case_study_sections;

-- Should show equal counts
```

---

**Status**: ✅ **READY TO FIX**  
**Action**: Run `ADD_ORG_ID_TO_CASE_STUDY_SECTIONS.sql`  
**Expected**: Case study sections work without errors  
**Result**: Complete case study management functionality  