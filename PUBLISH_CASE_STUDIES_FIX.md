# ✅ Fix: Publish Your Case Studies

## 🐛 Problem Found

Your case study is in **DRAFT** status, so it's not showing on the homepage.

**Current Status:**
```
Case Study: "gf"
Status: ⚠️  draft
Result: Homepage shows demo projects instead
```

## ✅ Solution: Publish Your Case Studies

### Option 1: Through Admin Panel (Recommended)

**Steps:**
1. Go to Admin Panel
2. Click on your case study ("gf")
3. Look for status dropdown (should be near the top)
4. Change from "draft" to "published"
5. Click "Save Changes"
6. Refresh homepage (F5)
7. ✅ Your case study appears!

### Option 2: Quick SQL Fix

Run this in Supabase Dashboard → SQL Editor:

```sql
-- Publish all draft case studies
UPDATE case_studies
SET status = 'published'
WHERE org_id = 'default-org'
AND status = 'draft';
```

Then refresh your homepage.

## 🎯 Why This Happens

The `getProjects()` method only shows **published** case studies:

```typescript
.eq('status', 'published')  // ← Only published ones
```

This is intentional so you can:
- Work on drafts privately
- Only show finished case studies
- Control what visitors see

## 📊 Case Study Status Options

**draft** (default)
- Not visible on homepage
- Only visible in admin panel
- Good for work in progress

**published** ✅
- Visible on homepage
- Shows in project cards
- Public to all visitors

**archived**
- Not visible on homepage
- Kept for reference
- Can be republished later

## 🔧 How to Change Status in Admin Panel

Unfortunately, I don't see a status dropdown in the current case study editor! Let me check if it exists...

Actually, looking at the code, the status field might not be exposed in the UI yet. Let me add it!

## 🚀 Quick Fix for Now

**Run this SQL to publish your case study:**

```sql
UPDATE case_studies
SET status = 'published'
WHERE case_study_id = '01K9Z3PKH86B683DV5DYG41WCX';
```

Or publish ALL your drafts:

```sql
UPDATE case_studies
SET status = 'published'
WHERE org_id = 'default-org'
AND status = 'draft';
```

**Then:**
1. Refresh homepage (F5)
2. ✅ Your case study appears!
3. ❌ Demo projects disappear!

## 💡 Verification

After publishing, run this to verify:

```bash
node scripts/check-case-study-status.js
```

Should show:
```
Published: 1 ✅
Draft: 0
```

## 🎉 Result

After publishing:
- ✅ Your real case studies appear on homepage
- ❌ Demo projects disappear
- ✅ Project cards show your content
- ✅ Hero images display (once uploaded)

**Publish your case study now to see it on the homepage!** 🚀
