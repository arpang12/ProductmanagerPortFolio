import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UploadRequest {
  asset_type: 'image' | 'document' | 'video'
  original_filename: string
  file_size: number
  mime_type: string
}

// Simple ULID generator
function ulid(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return (timestamp + randomPart).toUpperCase()
}

// Simple SHA1 hash function
async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { asset_type, original_filename, file_size, mime_type }: UploadRequest = await req.json()
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')
    
    // Get user's org_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw new Error('Error fetching user profile')
    }
    
    if (!profile) {
      throw new Error('User profile not found. Please set up your profile first by running: node scripts/setup-user-profile-simple.js')
    }
    
    // Generate asset ID
    const asset_id = ulid()
    const environment = Deno.env.get('ENVIRONMENT') || 'production'
    const public_id = `${environment}/${profile.org_id}/asset_${asset_id}`
    
    // Pre-create asset record
    const { error: insertError } = await supabase
      .from('assets')
      .insert({
        asset_id,
        org_id: profile.org_id,
        user_id: user.id,
        cloudinary_public_id: public_id,
        cloudinary_url: '', // Will be updated after upload
        original_filename,
        file_size,
        mime_type,
        asset_type,
        status: 'pending'
      })
    
    if (insertError) throw insertError
    
    // Generate Cloudinary signature
    const timestamp = Math.round(Date.now() / 1000).toString()
    const folder = `${environment}/${profile.org_id}`
    const resource_type = asset_type === 'image' ? 'image' : 'raw'
    
    // Build parameters object for signing (only include parameters that need to be signed)
    const signParams: Record<string, string> = {
      folder,
      public_id,
      timestamp,
      type: 'upload'  // Explicitly set as public upload
    }
    
    if (asset_type === 'image') {
      signParams.transformation = 'c_limit,w_2048,h_2048,q_85,f_auto'
    }
    
    // Sort parameters alphabetically and create string to sign
    const sortedParams = Object.keys(signParams)
      .sort()
      .map(key => `${key}=${signParams[key]}`)
      .join('&')
    
    const stringToSign = sortedParams + Deno.env.get('CLOUDINARY_API_SECRET')
    const signature = await sha1(stringToSign)
    
    // Create upload session
    const upload_id = ulid()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    await supabase
      .from('upload_sessions')
      .insert({
        upload_id,
        user_id: user.id,
        asset_id,
        cloudinary_signature: signature,
        expires_at: expiresAt.toISOString()
      })
    
    // Prepare upload parameters (include all signed parameters plus additional required ones)
    const uploadParams: Record<string, string> = {
      ...signParams,
      resource_type,  // Include resource_type in upload but not in signature
      signature,
      api_key: Deno.env.get('CLOUDINARY_API_KEY')!,
      cloud_name: Deno.env.get('CLOUDINARY_CLOUD_NAME')!
    }
    
    return new Response(JSON.stringify({
      asset_id,
      upload_params: uploadParams,
      upload_url: `https://api.cloudinary.com/v1_1/${Deno.env.get('CLOUDINARY_CLOUD_NAME')}/${resource_type}/upload`
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