import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FinalizeRequest {
  asset_id: string
  cloudinary_public_id: string
  cloudinary_url: string
  width?: number
  height?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { asset_id, cloudinary_public_id, cloudinary_url, width, height }: FinalizeRequest = await req.json()
    
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')
    
    // Verify asset belongs to user
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('asset_id', asset_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()
    
    if (assetError || !asset) throw new Error('Asset not found or already processed')
    
    // Update asset record with provided data
    const { error: updateError } = await supabase
      .from('assets')
      .update({
        cloudinary_url,
        width: width || null,
        height: height || null,
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('asset_id', asset_id)
    
    if (updateError) throw updateError
    
    // Mark upload session as completed
    await supabase
      .from('upload_sessions')
      .update({ status: 'completed' })
      .eq('asset_id', asset_id)
    
    return new Response(JSON.stringify({
      success: true,
      asset: {
        asset_id,
        cloudinary_url,
        width,
        height
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})