# 🌐 Deploy Edge Function via Dashboard (No CLI)

## Project ID: `djbdwbkhnrdnjreigtfz`

---

## 📋 Step-by-Step Guide

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz
2. Login if needed
3. Click **"Edge Functions"** in the left sidebar

---

### Step 2: Create New Function

1. Click the **"Create a new function"** button
2. Enter function name: `ai-enhance-content`
3. Click **"Create function"**

---

### Step 3: Copy the Function Code

1. Open the file `supabase/functions/ai-enhance-content/index.ts` in your project
2. Select all code (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

**The code to copy** (also shown below for reference):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AIRequest {
  prompt: string
  existing_text?: string
  tone?: string
  custom_instruction?: string
  section_type?: string
}

serve(async (req) => {
  try {
    const { prompt, existing_text, tone, custom_instruction, section_type }: AIRequest = await req.json()
    
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')
    
    // Get user's org and AI config
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single()
    
    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('encrypted_api_key, selected_model, is_configured')
      .eq('org_id', profile.org_id)
      .single()
    
    if (!aiConfig?.is_configured) {
      throw new Error('AI not configured for this organization')
    }
    
    // For now, use the encrypted key directly (implement proper decryption in production)
    const apiKey = aiConfig.encrypted_api_key
    
    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.selected_model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: buildPrompt(prompt, existing_text, tone, custom_instruction, section_type)
          }]
        }]
      })
    })
    
    const geminiData = await geminiResponse.json()
    
    if (!geminiResponse.ok) {
      throw new Error(geminiData.error?.message || 'AI generation failed')
    }
    
    const generatedText = geminiData.candidates[0]?.content?.parts[0]?.text
    
    // Log AI usage for audit
    const { ulid } = await import('https://deno.land/x/ulid@v0.3.0/mod.ts')
    await supabase.from('audit_logs').insert({
      log_id: ulid(),
      org_id: profile.org_id,
      user_id: user.id,
      action: 'ai_content_generation',
      resource_type: 'ai_enhancement',
      resource_id: section_type || 'general',
      new_values: { 
        prompt_length: prompt.length,
        response_length: generatedText?.length || 0,
        model: aiConfig.selected_model
      }
    })
    
    return new Response(JSON.stringify({
      generated_text: generatedText,
      model_used: aiConfig.selected_model
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

function buildPrompt(prompt: string, existingText?: string, tone?: string, customInstruction?: string, sectionType?: string): string {
  if (existingText) {
    return `Please enhance the following ${sectionType || 'content'} with a ${tone || 'professional'} tone.
    
${customInstruction ? `Special instruction: ${customInstruction}\n` : ''}
Original text:
"""
${existingText}
"""

Return only the enhanced text without any commentary.`
  }
  
  return `${prompt}${tone ? ` Use a ${tone} tone.` : ''}${customInstruction ? ` ${customInstruction}` : ''}`
}
```

---

### Step 4: Paste Code in Dashboard

1. In the Supabase dashboard editor, **delete any existing code**
2. **Paste** the code you copied (Ctrl+V or Cmd+V)
3. Click **"Deploy"** button (usually at the top right)

---

### Step 5: Wait for Deployment

You'll see a deployment progress indicator. Wait for:
- ✅ "Function deployed successfully"

This usually takes 10-30 seconds.

---

### Step 6: Verify Deployment

1. Stay on the Edge Functions page
2. You should see `ai-enhance-content` listed
3. Status should show as **"Active"** or **"Deployed"**

---

### Step 7: Check Environment Variables (Important!)

The function needs these environment variables:

1. In Supabase dashboard, go to **Settings** → **Edge Functions**
2. Scroll to **"Environment Variables"** section
3. Verify these exist (they should be auto-set):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

If they're missing, add them:
- `SUPABASE_URL`: Your project URL (e.g., `https://djbdwbkhnrdnjreigtfz.supabase.co`)
- `SUPABASE_ANON_KEY`: Your anon/public key (from Settings → API)

---

## ✅ Test Deployment

### Method 1: Use the Dashboard Test

1. In Edge Functions page, click on `ai-enhance-content`
2. Click **"Invoke"** or **"Test"** button
3. Enter test payload:
```json
{
  "prompt": "Say hello in a friendly way",
  "tone": "friendly"
}
```
4. Click **"Send"**
5. Should see response with generated text

### Method 2: Run Diagnostic Script

```bash
node scripts/diagnose-ai-generation.js
```

Should show:
```
✅ Edge Function: OK
🎉 AI Generation should be working!
```

### Method 3: Test in Your App

1. **Refresh** your app in browser
2. Go to **case study editor**
3. Click **🪄 or ✨** button
4. AI generation should work!

---

## 📸 Visual Guide

### What You'll See:

**Step 1 - Edge Functions Page**:
```
┌─────────────────────────────────────┐
│ Edge Functions                      │
├─────────────────────────────────────┤
│ [Create a new function]             │
│                                     │
│ No functions yet                    │
└─────────────────────────────────────┘
```

**Step 2 - Create Function Dialog**:
```
┌─────────────────────────────────────┐
│ Create a new function               │
├─────────────────────────────────────┤
│ Function name:                      │
│ [ai-enhance-content            ]    │
│                                     │
│ [Cancel]  [Create function]         │
└─────────────────────────────────────┘
```

**Step 3 - Code Editor**:
```
┌─────────────────────────────────────┐
│ ai-enhance-content        [Deploy]  │
├─────────────────────────────────────┤
│ 1  import { serve } from ...        │
│ 2  import { createClient } ...      │
│ 3                                   │
│ 4  interface AIRequest {            │
│ 5    prompt: string                 │
│ ...                                 │
└─────────────────────────────────────┘
```

**Step 4 - After Deployment**:
```
┌─────────────────────────────────────┐
│ Edge Functions                      │
├─────────────────────────────────────┤
│ ✅ ai-enhance-content               │
│    Status: Active                   │
│    Last deployed: Just now          │
└─────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

### Issue: "Create function" button not visible

**Solution**: Make sure you're on the Edge Functions page:
- https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions

### Issue: Deployment fails

**Solution**: 
1. Check code is copied correctly
2. No syntax errors
3. Try deploying again

### Issue: Function shows but doesn't work

**Solution**:
1. Check environment variables are set
2. Verify function status is "Active"
3. Check function logs for errors

### Issue: "Unauthorized" error

**Solution**:
1. Make sure you're logged in to the app
2. Check RLS policies are set up
3. Verify user has profile

---

## 📋 Checklist

- [ ] Opened Supabase dashboard
- [ ] Navigated to Edge Functions
- [ ] Created new function named `ai-enhance-content`
- [ ] Copied code from local file
- [ ] Pasted code in dashboard editor
- [ ] Clicked Deploy button
- [ ] Deployment successful
- [ ] Function shows as Active
- [ ] Environment variables verified
- [ ] Tested function works
- [ ] AI generation works in app

---

## 🎉 Success!

Once deployed, you should see:
- ✅ Function listed in dashboard
- ✅ Status: Active
- ✅ AI generation works in app
- ✅ No more "Failed to send request" errors

---

## 🔗 Quick Links

- **Your Dashboard**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz
- **Edge Functions**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions
- **Settings**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/settings/functions

---

## ⏱️ Time Required

- **Total**: 5-10 minutes
- **Create function**: 1 minute
- **Copy/paste code**: 2 minutes
- **Deploy**: 1 minute
- **Test**: 2 minutes

---

## 💡 Pro Tips

1. **Keep dashboard open** - Useful for monitoring
2. **Check logs** - If issues occur, check function logs
3. **Test immediately** - Verify it works right away
4. **Bookmark function page** - For future updates

---

**No CLI needed! Everything done through the dashboard.** 🎉
