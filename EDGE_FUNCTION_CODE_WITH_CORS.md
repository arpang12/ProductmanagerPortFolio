# 🔧 Updated Edge Function Code (With CORS Fix)

## The Issue
Your function is deployed but returning 400 on OPTIONS requests (CORS preflight). This updated code handles CORS properly.

---

## 📄 Copy This Updated Code

**Replace your current function code with this:**

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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

## 🔄 How to Update

1. **Go to**: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/functions

2. **Click on**: `ai-enhance-content` function

3. **Select all code** in the editor (Ctrl+A)

4. **Delete it**

5. **Paste the new code** above

6. **Click "Deploy"**

7. **Wait** for deployment to complete

8. **Refresh your app** and try again

---

## ✅ What Changed

Added CORS handling:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}
```

And added CORS headers to all responses:
```typescript
headers: { ...corsHeaders, 'Content-Type': 'application/json' }
```

---

## 🧪 After Update

1. **Refresh your app**
2. **Try AI generation** again
3. **Should work now!**

The OPTIONS request will now return 200 instead of 400, and the actual POST request will work.

---

**This will fix the CORS issue!** 🎉
