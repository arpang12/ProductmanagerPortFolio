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
    // IMPORTANT: Trim whitespace from API key
    const apiKey = aiConfig.encrypted_api_key?.trim()
    
    if (!apiKey) {
      throw new Error('API key is empty. Please configure AI Settings.')
    }
    
    console.log('API Key check:', {
      length: apiKey.length,
      startsWithAIza: apiKey.startsWith('AIza'),
      model: aiConfig.selected_model
    })
    
    // Call Gemini API with retry logic for 503 errors
    let geminiResponse
    let geminiData
    let retries = 0
    const maxRetries = 3
    
    while (retries <= maxRetries) {
      geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.selected_model}:generateContent?key=${apiKey}`, {
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
      
      geminiData = await geminiResponse.json()
      
      // If 503 (overloaded) and we have retries left, wait and retry
      if (geminiResponse.status === 503 && retries < maxRetries) {
        const waitTime = Math.pow(2, retries) * 1000 // Exponential backoff: 1s, 2s, 4s
        console.log(`Model overloaded, retrying in ${waitTime}ms... (attempt ${retries + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        retries++
        continue
      }
      
      // Break if successful or non-retryable error
      break
    }
    
    if (!geminiResponse.ok) {
      console.error('Gemini API error:', JSON.stringify(geminiData, null, 2))
      
      // Provide specific error messages
      if (geminiData.error?.message?.includes('API key not valid')) {
        throw new Error('Invalid API key. Please check your Gemini API key in AI Settings.')
      }
      if (geminiData.error?.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please check your usage limits.')
      }
      if (geminiData.error?.message?.includes('overloaded') || geminiData.error?.code === 503) {
        throw new Error('Google AI servers are busy. Please wait a few seconds and try again.')
      }
      if (geminiData.error?.message?.includes('not available')) {
        throw new Error('Selected model is not available. Please choose a different model.')
      }
      
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
    console.error('Edge function error:', error)
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