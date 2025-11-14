# 🚀 Dashboard Deployment - Quick Start

## No CLI Required! Deploy in 5 Minutes

### Your Project: `djbdwbkhnrdnjreigtfz`

---

## 📍 Step 1: Go to Edge Functions

**Link**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions

Click the link above or:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Edge Functions" in left sidebar

---

## ➕ Step 2: Create Function

1. Click **"Create a new function"** button
2. Name: `ai-enhance-content`
3. Click **"Create function"**

---

## 📄 Step 3: Get the Code

**Option A**: Copy from your local file
- Open: `supabase/functions/ai-enhance-content/index.ts`
- Select all (Ctrl+A)
- Copy (Ctrl+C)

**Option B**: Copy from below (click to expand)

<details>
<summary>Click to see full code</summary>

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
    
    const apiKey = aiConfig.encrypted_api_key
    
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

</details>

---

## 📝 Step 4: Paste & Deploy

1. In dashboard editor, **delete any existing code**
2. **Paste** your copied code (Ctrl+V)
3. Click **"Deploy"** button (top right)
4. Wait 10-30 seconds for deployment

---

## ✅ Step 5: Verify

You should see:
- ✅ "Function deployed successfully" message
- ✅ `ai-enhance-content` listed in functions
- ✅ Status: Active

---

## 🧪 Step 6: Test

### In Your App:
1. Refresh browser
2. Go to case study editor
3. Click 🪄 or ✨ button
4. AI should work!

### Or Run Diagnostic:
```bash
node scripts/diagnose-ai-generation.js
```

---

## 🎯 That's It!

**Time**: 5 minutes  
**Difficulty**: Easy  
**Result**: AI features working!

---

## 🔗 Direct Links

- **Create Function**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions
- **Settings**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/settings/functions

---

## 📚 Need More Help?

See `DEPLOY_VIA_DASHBOARD.md` for detailed step-by-step guide with screenshots and troubleshooting.

---

**Deploy now and start using AI in your case studies!** 🚀
