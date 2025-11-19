# 🔧 Fix Public Portfolio RLS Error

## Error You Got:
```
ERROR: 42703: column "section_id" does not exist
```

## ✅ Quick Fix

### Step 1: Run the Fixed SQL
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy **ALL** content from `FIX_PUBLIC_PORTFOLIO_RLS.sql`
4. Paste and click "Run"

### Step 2: Set Your Username
1. Open `SETUP_YOUR_USERNAME.sql`
2. Replace `YOUR_EMAIL_HERE` with your actual email (3 places)
3. Replace `'arpan'` with your desired username
4. Copy and run in Supabase SQL Editor

### Step 3: Test
Visit: `http://localhost:3002/u/arpan` (replace 'arpan' with your username)

## What Was Fixed:
- ✅ Corrected column name: `story_id` (not `section_id`)
- ✅ Added all public read RLS policies
- ✅ Added username generation function
- ✅ Made policies safe to re-run (DROP IF EXISTS)

## Verification:
After running, check if it worked:

```sql
-- Check your username
SELECT username, is_portfolio_public, name 
FROM user_profiles 
WHERE email = 'your@email.com';

-- Should return your username and is_portfolio_public = true
```

## If Still Having Issues:

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'story_sections', 'carousels');
```

### Check policies exist:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

## Next Steps:
1. ✅ Run `FIX_PUBLIC_PORTFOLIO_RLS.sql`
2. ✅ Run `SETUP_YOUR_USERNAME.sql`
3. ✅ Test `/u/yourusername`
4. ✅ Deploy to Vercel
5. ✅ Share your public URL!

---

**The error is fixed!** Just run the SQL files in order. 🚀
