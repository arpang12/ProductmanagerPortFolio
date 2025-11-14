# Quick Edge Function Deployment

## 🚨 Current Issue

**Error**: "Failed to send a request to the Edge Function"  
**Cause**: The `ai-enhance-content` Edge Function is not deployed to your Supabase project  
**Impact**: AI generation features won't work

---

## ✅ Quick Fix (3 Steps)

### Step 1: Install Supabase CLI

**Choose your method**:

**Windows (npm)**:
```powershell
npm install -g supabase
```

**Mac/Linux (Homebrew)**:
```bash
brew install supabase/tap/supabase
```

### Step 2: Login & Link Project

```bash
# Login to Supabase
supabase login

# Link your project (get project-ref from dashboard URL)
supabase link --project-ref YOUR-PROJECT-REF
```

**Where to find project-ref**:
- Go to https://supabase.com/dashboard
- Your URL will be: `https://supabase.com/dashboard/project/YOUR-PROJECT-REF`
- Copy the `YOUR-PROJECT-REF` part

### Step 3: Deploy Function

```bash
supabase functions deploy ai-enhance-content
```

**Expected output**:
```
Deploying ai-enhance-content (project ref: YOUR-PROJECT-REF)
Bundled ai-enhance-content in XXXms
Deployed ai-enhance-content in XXXms
✓ Deployed Function ai-enhance-content
```

---

## 🧪 Test Deployment

Run this to verify:
```bash
node scripts/diagnose-ai-generation.js
```

Should show:
```
✅ Edge Function: OK
🎉 AI Generation should be working!
```

---

## 🎯 Alternative: Deploy via Dashboard

If CLI doesn't work:

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project
   - Click "Edge Functions" in sidebar

2. **Create Function**
   - Click "Create a new function"
   - Name: `ai-enhance-content`
   - Click "Create"

3. **Copy Code**
   - Open `supabase/functions/ai-enhance-content/index.ts`
   - Copy all code
   - Paste in dashboard editor
   - Click "Deploy"

4. **Set Environment Variables**
   - Go to Settings → Edge Functions
   - Add:
     - `SUPABASE_URL`: Your project URL
     - `SUPABASE_ANON_KEY`: Your anon key

---

## ⚡ After Deployment

1. **Refresh your app**
2. **Go to case study editor**
3. **Click AI button (🪄 or ✨)**
4. **Should work now!**

---

## 🆘 Still Not Working?

### Check These:

1. **Function Deployed?**
   ```bash
   supabase functions list
   ```
   Should show `ai-enhance-content`

2. **Environment Variables Set?**
   - Check Supabase dashboard
   - Settings → Edge Functions
   - Verify SUPABASE_URL and SUPABASE_ANON_KEY

3. **AI Settings Configured?**
   - Go to Admin Page
   - Click "AI Settings"
   - Enter Gemini API key
   - Save

4. **Run Diagnostic**:
   ```bash
   node scripts/diagnose-ai-generation.js
   ```

---

## 📚 Full Documentation

See `EDGE_FUNCTION_DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## ✅ Summary

**Problem**: Edge Function not deployed  
**Solution**: Deploy using Supabase CLI or Dashboard  
**Time**: 5-10 minutes  
**Result**: AI generation will work!

**Deploy command**:
```bash
supabase functions deploy ai-enhance-content
```
