# AI Generation Troubleshooting Guide

## Problem: "AI Generation failed" Error

This guide will help you diagnose and fix AI generation issues.

---

## 🔍 Quick Diagnostic

Run this command to check your setup:
```bash
node scripts/diagnose-ai-generation.js
```

This will check:
- ✅ Authentication
- ✅ User profile
- ✅ AI configuration
- ✅ Edge Function
- ✅ API key validity

---

## 🎯 Common Causes & Solutions

### 1. AI Settings Not Configured ❌

**Error**: "AI not configured" or "Please check your AI Settings"

**Solution**:
1. Go to **Admin Page**
2. Click **"AI Settings"** button
3. Enter your **Gemini API key** (get from https://ai.google.dev/)
4. Select a **model** (recommended: Gemini 2.5 Pro)
5. Click **"Test Connection"**
6. Click **"Save Settings"**

---

### 2. Invalid API Key ❌

**Error**: "Invalid API key" or "API_KEY" error

**Solution**:
1. Go to https://ai.google.dev/
2. Sign in with your Google account
3. Create a new API key or verify existing one
4. Copy the API key
5. Go to AI Settings in your app
6. Paste the new API key
7. Test connection
8. Save

**Check**:
- API key should start with `AIza...`
- No extra spaces before/after
- Key is not expired
- Key has proper permissions

---

### 3. API Quota Exceeded ❌

**Error**: "quota exceeded" or "rate limit"

**Solution**:
1. Wait 1 minute (free tier: 60 requests/minute)
2. Check your quota at https://ai.google.dev/
3. Consider upgrading your plan
4. Use a faster model (Gemini 2.5 Flash) for high-volume tasks

---

### 4. Edge Function Not Deployed ❌

**Error**: "Function not found" or "404"

**Solution**:
```bash
# Deploy the Edge Function
supabase functions deploy ai-enhance-content

# Verify deployment
supabase functions list
```

---

### 5. Network/Connection Issues ❌

**Error**: "Failed to connect" or timeout

**Solution**:
1. Check your internet connection
2. Try refreshing the page
3. Check if Supabase is accessible
4. Verify firewall/proxy settings
5. Try a different browser

---

### 6. Model Not Available ❌

**Error**: "Model not available" or "MODEL" error

**Solution**:
1. Go to AI Settings
2. Try a different model:
   - Gemini 2.5 Pro (recommended)
   - Gemini 2.5 Flash (faster)
   - Gemini 1.5 Pro (stable)
3. Save and test again

---

### 7. Empty Response ❌

**Error**: "Empty response" or no content generated

**Solution**:
1. Check if prompt is too short
2. Try adding more context
3. Use custom instructions
4. Try a different model
5. Check Edge Function logs

---

## 🔧 Step-by-Step Troubleshooting

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Note the exact error text

### Step 2: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try AI generation again
4. Look for failed requests (red)
5. Click on failed request
6. Check Response tab for error details

### Step 3: Verify AI Settings
1. Go to Admin Page
2. Click "AI Settings"
3. Verify:
   - ✅ "✓ Saved" indicator visible
   - ✅ Model selected
   - ✅ "Configured" status
4. Try "Test Connection"
5. Should see success message

### Step 4: Test with Simple Content
1. Go to case study editor
2. Find a short text field (e.g., headline)
3. Click ✨ (generate) button
4. Wait for response
5. If works: Issue is with specific content
6. If fails: Issue is with setup

### Step 5: Check Supabase Dashboard
1. Go to Supabase dashboard
2. Navigate to Edge Functions
3. Click on `ai-enhance-content`
4. Check logs for errors
5. Look for recent invocations

---

## 📊 Error Messages Explained

### "AI Generation failed. AI content generation failed. Please check your AI Settings and try again."
**Cause**: Generic error, need more details  
**Solution**: Check browser console for specific error

### "AI not configured for this organization"
**Cause**: No AI settings saved  
**Solution**: Configure AI Settings (see Solution #1)

### "Invalid API key. Please check your Gemini API key."
**Cause**: API key is wrong or expired  
**Solution**: Update API key (see Solution #2)

### "API quota exceeded. Please check your usage limits."
**Cause**: Too many requests  
**Solution**: Wait or upgrade plan (see Solution #3)

### "Selected model is not available. Please choose a different model."
**Cause**: Model not accessible  
**Solution**: Change model (see Solution #6)

### "Failed to connect to AI service. Please check your AI Settings."
**Cause**: Edge Function or network issue  
**Solution**: Check deployment and network (see Solutions #4, #5)

---

## 🧪 Testing Checklist

### Before Testing:
- [ ] AI Settings configured
- [ ] API key entered and saved
- [ ] Model selected
- [ ] Test connection successful
- [ ] "Configured" status showing

### During Testing:
- [ ] Browser console open
- [ ] Network tab monitoring
- [ ] Try simple text first
- [ ] Note exact error message
- [ ] Check response time

### After Error:
- [ ] Copy error message
- [ ] Check browser console
- [ ] Check network requests
- [ ] Run diagnostic script
- [ ] Review this guide

---

## 🔍 Diagnostic Script Output

### Good Output:
```
✅ Authentication: OK
✅ User Profile: OK
✅ AI Configuration: OK
✅ Edge Function: OK
🎉 AI Generation should be working!
```

### Bad Output Examples:

**Not Configured**:
```
❌ AI configuration not found
💡 Solution: Configure AI Settings
```

**No API Key**:
```
❌ No API key stored
💡 Solution: Add Gemini API key
```

**Edge Function Error**:
```
❌ Edge Function error: [error message]
💡 Check API key and deployment
```

---

## 💡 Pro Tips

### For Best Results:
1. **Use clear prompts**: Be specific about what you want
2. **Add context**: Use custom instructions
3. **Choose right tone**: Match your content style
4. **Try different modes**: Tone vs Rephrase
5. **Iterate**: Enhance multiple times if needed

### For Faster Response:
1. Use **Gemini 2.5 Flash** model
2. Keep prompts concise
3. Avoid very long text
4. Use during off-peak hours

### For Better Quality:
1. Use **Gemini 2.5 Pro** model
2. Add detailed custom instructions
3. Provide more context
4. Use appropriate tone

---

## 🆘 Still Not Working?

### Check These:

1. **Environment Variables**:
   - `VITE_SUPABASE_URL` set correctly
   - `VITE_SUPABASE_ANON_KEY` set correctly
   - No placeholder values

2. **Database**:
   - `ai_configurations` table exists
   - RLS policies active
   - User has profile

3. **Edge Function**:
   - Deployed to Supabase
   - Has correct environment variables
   - Logs show no errors

4. **API Key**:
   - Valid and not expired
   - Has proper permissions
   - Not rate limited

### Get Help:
1. Run diagnostic script
2. Check browser console
3. Check Supabase logs
4. Review error message
5. Check this guide
6. Contact support with:
   - Error message
   - Diagnostic output
   - Browser console logs
   - Steps to reproduce

---

## 📚 Related Documentation

- `AI_SETTINGS_GUIDE.md` - How to configure AI
- `AI_CONTENT_ENHANCEMENT_GUIDE.md` - How to use AI features
- `GEMINI_INTEGRATION_REPORT.md` - Technical details
- `AI_KEY_PERSISTENCE_FIX.md` - API key issues

---

## ✅ Quick Fix Checklist

Try these in order:

1. [ ] Refresh the page
2. [ ] Check AI Settings configured
3. [ ] Test connection in AI Settings
4. [ ] Try different model
5. [ ] Check browser console
6. [ ] Run diagnostic script
7. [ ] Verify API key valid
8. [ ] Check internet connection
9. [ ] Try different browser
10. [ ] Review this guide

---

## 🎯 Summary

Most AI generation errors are caused by:
1. **Not configured** (50%) - Configure AI Settings
2. **Invalid API key** (30%) - Update API key
3. **Quota exceeded** (10%) - Wait or upgrade
4. **Network issues** (5%) - Check connection
5. **Other** (5%) - Check logs and documentation

**Run the diagnostic script first** to identify the exact issue!

```bash
node scripts/diagnose-ai-generation.js
```
