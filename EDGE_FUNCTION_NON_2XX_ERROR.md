# 🔧 Edge Function Non-2xx Status Code Error - Fix Guide

## Error Message
"Edge Function returned a non-2xx status code"

This error appears when the AI Edge Function returns an error response (400, 500, etc.) instead of a success response (200).

---

## 🔍 What This Means

The Edge Function is running but encountering an error. Common causes:

1. **Invalid API Key** (Most Common)
2. **AI Not Configured**
3. **API Quota Exceeded**
4. **Model Not Available**
5. **Authentication Issues**
6. **Missing Environment Variables**

---

## ✅ Quick Fixes (Try These First)

### Fix 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for the actual error message
4. The console will show the specific error from the Edge Function

### Fix 2: Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `ai-enhance-content`
4. Check the Logs tab
5. Look for recent errors with details

### Fix 3: Run Diagnostic Script
```bash
node scripts/test-edge-function-ai.js
```

This will show you the exact error and suggest solutions.

---

## 🎯 Common Causes & Solutions

### 1. Invalid API Key ❌

**Error in logs:**
```
"API key not valid. Please pass a valid API key."
```

**Solution:**
1. Go to Admin Page → AI Settings
2. Delete the current API key
3. Get a new key from https://ai.google.dev/
4. Copy it carefully (no extra spaces)
5. Paste into AI Settings
6. Click "Test Connection"
7. Click "Save Settings"

**Or run auto-fix:**
```bash
node scripts/fix-api-key-whitespace.js
```

---

### 2. AI Not Configured ❌

**Error in logs:**
```
"AI not configured for this organization"
```

**Solution:**
1. Go to Admin Page
2. Click "AI Settings" button
3. Enter your Gemini API key
4. Select a model (e.g., gemini-1.5-pro)
5. Test connection
6. Save settings

---

### 3. API Quota Exceeded ❌

**Error in logs:**
```
"API quota exceeded"
```

**Solution:**
- **Wait**: Free tier resets every minute (60 requests/min)
- **Check quota**: Go to https://ai.google.dev/
- **Upgrade**: Consider upgrading your Gemini API plan
- **Use faster model**: Try gemini-1.5-flash for high-volume

---

### 4. Model Not Available ❌

**Error in logs:**
```
"Selected model is not available"
```

**Solution:**
1. Go to AI Settings
2. Try a different model:
   - `gemini-1.5-pro` (most stable)
   - `gemini-1.5-flash` (faster)
   - `gemini-2.0-flash-exp` (experimental)
3. Save and test again

---

### 5. Authentication Issues ❌

**Error in logs:**
```
"Unauthorized"
```

**Solution:**
1. Log out of the application
2. Log back in
3. Try AI generation again
4. If still failing, clear browser cache

---

### 6. Edge Function Not Deployed ❌

**Error in logs:**
```
"Function not found" or "404"
```

**Solution:**
```bash
supabase functions deploy ai-enhance-content
```

---

## 🔧 Step-by-Step Debugging

### Step 1: Check Browser Console
```
1. Open DevTools (F12)
2. Go to Console tab
3. Try AI generation
4. Look for error message
5. Note the exact error text
```

### Step 2: Check Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Try AI generation
4. Find the "ai-enhance-content" request
5. Click on it
6. Check Response tab
7. Look for error details
```

### Step 3: Check Supabase Logs
```
1. Go to Supabase Dashboard
2. Edge Functions → ai-enhance-content
3. Click "Logs" tab
4. Look for recent errors
5. Check error messages and stack traces
```

### Step 4: Run Test Script
```bash
node scripts/test-edge-function-ai.js
```

This will:
- Check authentication
- Test Edge Function directly
- Show exact error message
- Suggest specific solutions

### Step 5: Verify Configuration
```bash
node scripts/check-api-key.js
```

This will:
- Check if API key exists
- Verify API key format
- Test API key with Gemini
- Show if key is valid

---

## 📊 Error Response Structure

When the Edge Function returns an error, it looks like this:

```json
{
  "error": "Invalid API key. Please check your Gemini API key in AI Settings."
}
```

The frontend should display this error message to the user.

---

## 🧪 Testing

### Test 1: Direct Edge Function Call
```bash
node scripts/test-edge-function-ai.js
```

Expected output if working:
```
✅ Edge Function Response:
   Generated Text: Enhanced version of your text...
   Model Used: gemini-1.5-pro
🎉 Edge Function is working correctly!
```

### Test 2: API Key Validation
```bash
node scripts/check-api-key.js
```

Expected output if working:
```
✅ API Key is VALID!
   Response: Hello
```

### Test 3: In-App Test
1. Go to Admin → AI Settings
2. Click "Test Connection"
3. Should show: "✅ Connection successful!"

---

## 💡 Prevention Tips

### Keep API Key Clean
- Copy directly from Google AI Studio
- Don't copy from text editors
- No extra spaces or newlines
- Paste immediately after copying

### Monitor Quota
- Check usage at https://ai.google.dev/
- Free tier: 60 requests/minute
- Set up alerts for quota limits

### Use Stable Models
- `gemini-1.5-pro` is most reliable
- Avoid experimental models in production
- Test new models before switching

### Check Logs Regularly
- Monitor Supabase Edge Function logs
- Look for patterns in errors
- Address issues proactively

---

## 🆘 Still Not Working?

### Collect Information

1. **Browser Console Error:**
   ```
   [Copy exact error message]
   ```

2. **Supabase Logs:**
   ```
   [Copy recent error logs]
   ```

3. **Test Script Output:**
   ```bash
   node scripts/test-edge-function-ai.js
   [Copy output]
   ```

4. **API Key Check:**
   ```bash
   node scripts/check-api-key.js
   [Copy output]
   ```

### Check These Files

1. **Edge Function Code:**
   - `supabase/functions/ai-enhance-content/index.ts`
   - Verify it's the latest version with trim fix

2. **API Service:**
   - `services/api.ts`
   - Check enhanceContent function

3. **Environment Variables:**
   - `.env.local`
   - Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Redeploy Everything

If all else fails, redeploy:

```bash
# Redeploy Edge Function
supabase functions deploy ai-enhance-content

# Verify deployment
supabase functions list

# Test
node scripts/test-edge-function-ai.js
```

---

## 📚 Related Documentation

- `API_KEY_INVALID_FIXED.md` - API key troubleshooting
- `API_KEY_FIX_GUIDE.md` - Step-by-step API key fix
- `AI_GENERATION_TROUBLESHOOTING.md` - General AI troubleshooting
- `EDGE_FUNCTION_DEPLOYMENT_GUIDE.md` - Deployment guide

---

## 🎯 Quick Checklist

- [ ] Edge Function deployed
- [ ] API key configured in AI Settings
- [ ] API key is valid (no whitespace)
- [ ] Model name is correct
- [ ] User is authenticated
- [ ] No quota issues
- [ ] Browser console checked
- [ ] Supabase logs checked
- [ ] Test script run
- [ ] Error message noted

---

## ✅ Success Indicators

After fixing, you should see:

1. **In Browser Console:**
   ```
   ✅ No errors
   ✅ Successful API calls
   ```

2. **In Supabase Logs:**
   ```
   ✅ 200 status codes
   ✅ Successful generations
   ```

3. **In Application:**
   ```
   ✅ AI generation works
   ✅ Content appears in modal
   ✅ Regenerate works
   ✅ Apply works
   ```

---

## 🔄 Regenerate-Specific Issues

If the error only happens on regenerate:

### Possible Causes:
1. **Rate limiting** - Too many requests too fast
2. **Session timeout** - Auth token expired
3. **State issues** - Modal state not reset properly

### Solutions:
1. **Wait a few seconds** between regenerations
2. **Refresh the page** if session expired
3. **Close and reopen modal** to reset state

---

**Most common fix: Update your API key in AI Settings!** 🔑

Run the diagnostic script to identify the exact issue:
```bash
node scripts/test-edge-function-ai.js
```
