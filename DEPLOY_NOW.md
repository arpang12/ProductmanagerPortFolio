# 🚀 Deploy Edge Function NOW

## Your Project ID: `djbdwbkhnrdnjreigtfz`

---

## ⚡ Quick Deploy (Copy & Paste)

### Step 1: Install Supabase CLI (if not installed)

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser. Login with your Supabase account.

### Step 3: Link Your Project

```bash
supabase link --project-ref djbdwbkhnrdnjreigtfz
```

### Step 4: Deploy the Edge Function

```bash
supabase functions deploy ai-enhance-content
```

---

## ✅ Expected Output

After running the deploy command, you should see:

```
Deploying ai-enhance-content (project ref: djbdwbkhnrdnjreigtfz)
Bundled ai-enhance-content in XXXms
Deployed ai-enhance-content in XXXms
✓ Deployed Function ai-enhance-content
```

---

## 🧪 Verify Deployment

### Check if function is deployed:

```bash
supabase functions list
```

Should show:
```
ai-enhance-content
```

### Test the function:

```bash
node scripts/diagnose-ai-generation.js
```

Should show:
```
✅ Edge Function: OK
🎉 AI Generation should be working!
```

---

## 🎯 After Deployment

1. **Refresh your app** in the browser
2. **Go to case study editor**
3. **Click any AI button** (🪄 or ✨)
4. **AI generation should work!**

---

## 🆘 If Deploy Fails

### Error: "supabase: command not found"

**Solution**: Install Supabase CLI first
```bash
npm install -g supabase
```

### Error: "Not logged in"

**Solution**: Login first
```bash
supabase login
```

### Error: "Project not found"

**Solution**: Check project ID is correct
```bash
supabase link --project-ref djbdwbkhnrdnjreigtfz
```

### Error: "Permission denied"

**Solution**: Make sure you're logged in with the correct account that owns this project

---

## 📋 Complete Command Sequence

Copy and paste all at once:

```bash
# Install CLI (if needed)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref djbdwbkhnrdnjreigtfz

# Deploy function
supabase functions deploy ai-enhance-content

# Verify
supabase functions list
```

---

## 🎉 Success!

Once deployed, your AI generation will work immediately. No app restart needed!

**Test it**:
1. Go to your app
2. Open case study editor
3. Click 🪄 or ✨ button
4. Enjoy AI-powered content generation!

---

## 📚 Your Project Info

- **Project ID**: `djbdwbkhnrdnjreigtfz`
- **Function Name**: `ai-enhance-content`
- **Function URL**: `https://djbdwbkhnrdnjreigtfz.supabase.co/functions/v1/ai-enhance-content`

---

## ⏱️ Time Required

- Install CLI: 1-2 minutes
- Login: 30 seconds
- Link project: 10 seconds
- Deploy function: 30 seconds

**Total**: ~3-5 minutes

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz
- **Edge Functions**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions
- **CLI Docs**: https://supabase.com/docs/guides/cli

---

## ✅ Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Edge Function deployed
- [ ] Deployment verified
- [ ] AI generation tested
- [ ] Everything working!

---

**Ready? Run the commands above and your AI features will be live in minutes!** 🚀
