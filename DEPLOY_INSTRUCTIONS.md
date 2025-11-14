# 🚀 Deploy Edge Function - Complete Instructions

## Your Project: `djbdwbkhnrdnjreigtfz`

---

## 🎯 Choose Your Method

### Method 1: Automated Script (Easiest) ⭐

**Windows (PowerShell)**:
```powershell
.\deploy-edge-function.ps1
```

**Mac/Linux (Bash)**:
```bash
chmod +x deploy-edge-function.sh
./deploy-edge-function.sh
```

The script will:
- ✅ Check/install Supabase CLI
- ✅ Login to Supabase
- ✅ Link your project
- ✅ Deploy the Edge Function
- ✅ Verify deployment

---

### Method 2: Manual Commands

```bash
# 1. Install CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref djbdwbkhnrdnjreigtfz

# 4. Deploy
supabase functions deploy ai-enhance-content

# 5. Verify
supabase functions list
```

---

### Method 3: Supabase Dashboard (No CLI)

1. **Go to Dashboard**:
   - https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions

2. **Create Function**:
   - Click "Create a new function"
   - Name: `ai-enhance-content`
   - Click "Create"

3. **Copy Code**:
   - Open `supabase/functions/ai-enhance-content/index.ts`
   - Copy all code (Ctrl+A, Ctrl+C)
   - Paste in dashboard editor
   - Click "Deploy"

4. **Set Environment Variables**:
   - Go to Settings → Edge Functions
   - Add:
     - `SUPABASE_URL`: Your project URL
     - `SUPABASE_ANON_KEY`: Your anon key

---

## ✅ After Deployment

### Test It Works:

1. **Run Diagnostic**:
   ```bash
   node scripts/diagnose-ai-generation.js
   ```

2. **Expected Output**:
   ```
   ✅ Authentication: OK
   ✅ User Profile: OK
   ✅ AI Configuration: OK
   ✅ Edge Function: OK
   🎉 AI Generation should be working!
   ```

3. **Test in App**:
   - Refresh your browser
   - Go to case study editor
   - Click 🪄 or ✨ button
   - AI should generate content!

---

## 🔍 Verify Deployment

### Check Function Exists:

**Dashboard**:
- https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions
- Should see `ai-enhance-content` listed

**CLI**:
```bash
supabase functions list
```

### Test Function Directly:

```bash
curl -X POST https://djbdwbkhnrdnjreigtfz.supabase.co/functions/v1/ai-enhance-content \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello", "tone": "friendly"}'
```

---

## 🆘 Troubleshooting

### "supabase: command not found"

**Solution**:
```bash
npm install -g supabase
```

### "Not logged in"

**Solution**:
```bash
supabase login
```

### "Project not found"

**Solution**: Verify project ID
```bash
supabase link --project-ref djbdwbkhnrdnjreigtfz
```

### "Permission denied"

**Solution**: Login with correct account that owns the project

### "Function already exists"

**Solution**: That's fine! Just redeploy:
```bash
supabase functions deploy ai-enhance-content --no-verify-jwt
```

---

## 📊 Deployment Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked (djbdwbkhnrdnjreigtfz)
- [ ] Edge Function deployed
- [ ] Function visible in dashboard
- [ ] Diagnostic test passed
- [ ] AI generation works in app

---

## 🎉 Success Indicators

### You'll Know It Worked When:

1. **CLI shows**:
   ```
   ✓ Deployed Function ai-enhance-content
   ```

2. **Dashboard shows**:
   - Function listed under Edge Functions
   - Status: Active
   - Recent invocations visible

3. **App shows**:
   - AI buttons work (🪄 & ✨)
   - Content generates successfully
   - No error messages

---

## 📚 Files Created

- `DEPLOY_NOW.md` - Quick reference
- `deploy-edge-function.ps1` - Windows script
- `deploy-edge-function.sh` - Mac/Linux script
- `DEPLOY_INSTRUCTIONS.md` - This file
- `EDGE_FUNCTION_DEPLOYMENT_GUIDE.md` - Detailed guide

---

## ⏱️ Time Required

- **Automated Script**: 3-5 minutes
- **Manual Commands**: 5-7 minutes
- **Dashboard Method**: 10-15 minutes

---

## 🔗 Quick Links

- **Your Dashboard**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz
- **Edge Functions**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions
- **Function URL**: https://djbdwbkhnrdnjreigtfz.supabase.co/functions/v1/ai-enhance-content

---

## 💡 Pro Tips

1. **Use the automated script** - It's the easiest way
2. **Keep CLI installed** - Useful for future deployments
3. **Check dashboard** - Visual confirmation of deployment
4. **Run diagnostic** - Confirms everything works
5. **Test in app** - Real-world verification

---

## ✅ Ready to Deploy?

**Recommended**: Run the automated script

**Windows**:
```powershell
.\deploy-edge-function.ps1
```

**Mac/Linux**:
```bash
chmod +x deploy-edge-function.sh
./deploy-edge-function.sh
```

**Or use manual commands from Method 2 above.**

---

**Your AI features will be live in minutes!** 🚀
