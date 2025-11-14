# API Key Invalid Error - Quick Fix Guide

## Problem
Getting error: "API key not valid. Please pass a valid API key" from Gemini API

## ✅ Solution Applied

### 1. Edge Function Updated
- Added `.trim()` to remove whitespace from API key
- Added detailed logging to check API key format
- Improved error messages for specific issues

### 2. API Service Updated  
- Added `.trim()` when saving API key to database
- Prevents whitespace from being stored

### 3. Next Steps for You

#### Step 1: Redeploy the Edge Function
```bash
supabase functions deploy ai-enhance-content
```

#### Step 2: Update Your API Key
1. Go to **Admin Page** → **AI Settings**
2. **Delete the current API key** from the field
3. Go to https://ai.google.dev/
4. **Create a NEW API key** (or copy existing one carefully)
5. **Paste it carefully** (no extra spaces)
6. Click **"Test Connection"** - should show success
7. Click **"Save Settings"**

#### Step 3: Verify the Fix
Try using AI enhancement again. It should work now!

---

## 🔍 Common Causes

### 1. Whitespace in API Key ⚠️
**Problem**: Extra spaces, tabs, or newlines when copying
**Solution**: We now trim automatically, but re-enter the key to be safe

### 2. Invalid API Key ❌
**Problem**: 
- API key is incorrect
- API key is expired
- API key doesn't have proper permissions

**Solution**: Get a fresh API key from https://ai.google.dev/

### 3. Wrong Model Name ❌
**Problem**: Model name doesn't exist or isn't available

**Solution**: Try these models:
- `gemini-1.5-pro` (most stable)
- `gemini-1.5-flash` (faster)
- `gemini-2.0-flash-exp` (experimental)

---

## 🧪 Testing Your API Key

### Option 1: Use the Diagnostic Script
```bash
# First, log in to your app in the browser
# Then run:
node scripts/check-api-key.js
```

This will show:
- ✅ If API key is valid
- ⚠️ If API key has whitespace
- ❌ If API key is invalid
- 💡 Suggestions for fixing

### Option 2: Test Manually with cURL
```bash
# Replace YOUR_API_KEY and MODEL_NAME
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
```

If valid, you'll get a response with "Hello" or similar.
If invalid, you'll get an error message.

---

## 📋 Checklist

- [ ] Edge Function redeployed with trim fix
- [ ] Old API key removed from AI Settings
- [ ] New API key obtained from https://ai.google.dev/
- [ ] New API key pasted carefully (no spaces)
- [ ] Test Connection clicked and successful
- [ ] Settings saved
- [ ] AI enhancement tested and working

---

## 🎯 Valid API Key Format

A valid Gemini API key should:
- Start with `AIza`
- Be 39 characters long
- Contain only alphanumeric characters and hyphens
- Have NO spaces or newlines

Example format: `AIzaSyABC123def456GHI789jkl012MNO345pqr`

---

## 🆘 Still Not Working?

### Check These:

1. **API Key Permissions**
   - Go to https://ai.google.dev/
   - Check if API key is enabled
   - Check if it has Generative Language API access

2. **Quota Limits**
   - Free tier: 60 requests per minute
   - Check your usage at https://ai.google.dev/

3. **Model Availability**
   - Some models are region-restricted
   - Try `gemini-1.5-pro` (most widely available)

4. **Edge Function Logs**
   - Go to Supabase Dashboard
   - Edge Functions → ai-enhance-content
   - Check logs for detailed error messages

---

## 💡 Pro Tips

### Get a Fresh API Key
1. Go to https://ai.google.dev/
2. Sign in with Google account
3. Click "Get API Key"
4. Click "Create API Key"
5. Copy it immediately (shown only once)
6. Paste directly into AI Settings

### Copy Carefully
- Use Ctrl+C / Cmd+C to copy
- Don't select extra characters
- Don't copy from a text editor (might add formatting)
- Paste directly from the source

### Test Before Saving
- Always click "Test Connection" first
- Wait for success message
- Then click "Save Settings"

---

## ✅ After Fix

Once fixed, you should see:
- ✅ "Test Connection" shows success
- ✅ "✓ Saved" indicator appears
- ✅ AI enhancement buttons work
- ✅ Content generation succeeds
- ✅ No more "invalid API key" errors

---

## 📚 Related Documentation

- `AI_SETTINGS_GUIDE.md` - Full AI configuration guide
- `AI_GENERATION_TROUBLESHOOTING.md` - Comprehensive troubleshooting
- `DEPLOY_NOW.md` - Edge Function deployment guide

---

**The fix is ready! Just redeploy the Edge Function and re-enter your API key.** 🚀
