# Edge Function Deployment Guide

## Problem: "Failed to send a request to the Edge Function"

This error means the `ai-enhance-content` Edge Function is not deployed to your Supabase project.

---

## 🚀 Solution: Deploy the Edge Function

### Option 1: Using Supabase CLI (Recommended)

#### Step 1: Install Supabase CLI

**Windows (PowerShell)**:
```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# OR using npm
npm install -g supabase
```

**Mac/Linux**:
```bash
# Using Homebrew
brew install supabase/tap/supabase

# OR using npm
npm install -g supabase
```

#### Step 2: Login to Supabase
```bash
supabase login
```

#### Step 3: Link Your Project
```bash
# Get your project ref from Supabase dashboard URL
# https://supabase.com/dashboard/project/YOUR-PROJECT-REF

supabase link --project-ref YOUR-PROJECT-REF
```

#### Step 4: Deploy the Edge Function
```bash
supabase functions deploy ai-enhance-content
```

#### Step 5: Verify Deployment
```bash
supabase functions list
```

You should see `ai-enhance-content` in the list.

---

### Option 2: Using Supabase Dashboard

#### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** in the left sidebar

#### Step 2: Create New Function
1. Click **"Create a new function"**
2. Name: `ai-enhance-content`
3. Click **"Create function"**

#### Step 3: Copy Function Code
1. Open `supabase/functions/ai-enhance-content/index.ts` in your project
2. Copy all the code
3. Paste into the Supabase dashboard editor
4. Click **"Deploy"**

#### Step 4: Set Environment Variables
In the Supabase dashboard:
1. Go to **Settings** → **Edge Functions**
2. Add these environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your anon/public key

---

### Option 3: Manual Deployment via API

If you can't use CLI or dashboard, you can deploy via API:

```bash
# Get your access token from Supabase dashboard
# Settings → API → Service Role Key

curl -X POST https://api.supabase.com/v1/projects/YOUR-PROJECT-REF/functions \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ai-enhance-content",
    "verify_jwt": true
  }'
```

---

## 🔍 Verify Deployment

### Test the Edge Function

Run this script to test:
```bash
node scripts/diagnose-ai-generation.js
```

Or test manually:
```bash
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/ai-enhance-content \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Say hello",
    "tone": "friendly"
  }'
```

---

## 📋 Edge Function Code

The Edge Function code is located at:
`supabase/functions/ai-enhance-content/index.ts`

**What it does**:
1. Receives AI generation request from frontend
2. Authenticates the user
3. Retrieves API key from database
4. Calls Google Gemini API
5. Returns generated content
6. Logs usage for audit

---

## ⚠️ Common Issues

### Issue 1: "Function not found"
**Cause**: Edge Function not deployed  
**Solution**: Deploy using one of the options above

### Issue 2: "Unauthorized"
**Cause**: Missing or invalid auth token  
**Solution**: Ensure user is logged in

### Issue 3: "Environment variables not set"
**Cause**: Missing SUPABASE_URL or SUPABASE_ANON_KEY  
**Solution**: Set in Supabase dashboard → Settings → Edge Functions

### Issue 4: "AI not configured"
**Cause**: No API key in database  
**Solution**: Configure AI Settings in the app

---

## 🎯 Quick Fix Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Edge Function deployed
- [ ] Environment variables set
- [ ] Function appears in dashboard
- [ ] Test successful

---

## 🔧 Alternative: Use Direct API Call (Temporary)

If you can't deploy the Edge Function immediately, you can temporarily use direct API calls from the frontend (NOT RECOMMENDED for production):

**⚠️ WARNING**: This exposes your API key to the frontend. Only use for testing!

### Temporary Solution

1. Create a new file: `services/geminiDirect.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateContentDirect(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const generativeModel = genAI.getGenerativeModel({ model });
  
  const result = await generativeModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
```

2. Update `services/geminiService.ts` to use direct call temporarily

**Remember**: Deploy the Edge Function as soon as possible for security!

---

## 📚 Resources

- Supabase CLI Docs: https://supabase.com/docs/guides/cli
- Edge Functions Docs: https://supabase.com/docs/guides/functions
- Deployment Guide: https://supabase.com/docs/guides/functions/deploy

---

## ✅ After Deployment

Once deployed, you should see:
- ✅ Function in Supabase dashboard
- ✅ Function URL available
- ✅ Test requests succeed
- ✅ AI generation works in app

Then you can use AI enhancement in your case study editor!
