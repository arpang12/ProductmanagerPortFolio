import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface BulkOperation {
  operation: 'reorder' | 'bulk_update' | 'bulk_delete'
  resource_type: 'carousel_slides' | 'journey_milestones' | 'skills' | 'tools'
  items: Array<{
    id: string
    order_key?: string
    updates?: Record<string, any>
  }>
}

serve(async (req) => {
  try {
    const { operation, resource_type, items }: BulkOperation = await req.json()
    
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')
    
    let result
    
    switch (operation) {
      case 'reorder':
        result = await handleReorder(supabase, resource_type, items)
        break
      case 'bulk_update':
        result = await handleBulkUpdate(supabase, resource_type, items)
        break
      case 'bulk_delete':
        result = await handleBulkDelete(supabase, resource_type, items)
        break
      default:
        throw new Error('Invalid operation')
    }
    
    // Log bulk operation
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single()
    
    const { ulid } = await import('https://deno.land/x/ulid@v0.3.0/mod.ts')
    await supabase.from('audit_logs').insert({
      log_id: ulid(),
      org_id: profile.org_id,
      user_id: user.id,
      action: `bulk_${operation}`,
      resource_type,
      resource_id: 'multiple',
      new_values: { item_count: items.length, items: items.map(i => i.id) }
    })
    
    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function handleReorder(supabase: any, resourceType: string, items: any[]) {
  const updates = items.map(item => ({
    [`${getIdField(resourceType)}`]: item.id,
    order_key: item.order_key,
    updated_at: new Date().toISOString()
  }))
  
  const { error } = await supabase
    .from(resourceType)
    .upsert(updates, { onConflict: getIdField(resourceType) })
  
  if (error) throw error
  return { updated_count: updates.length }
}

async function handleBulkUpdate(supabase: any, resourceType: string, items: any[]) {
  let updatedCount = 0
  
  for (const item of items) {
    const { error } = await supabase
      .from(resourceType)
      .update({
        ...item.updates,
        updated_at: new Date().toISOString()
      })
      .eq(getIdField(resourceType), item.id)
    
    if (!error) updatedCount++
  }
  
  return { updated_count: updatedCount }
}

async function handleBulkDelete(supabase: any, resourceType: string, items: any[]) {
  const ids = items.map(item => item.id)
  
  const { error } = await supabase
    .from(resourceType)
    .delete()
    .in(getIdField(resourceType), ids)
  
  if (error) throw error
  return { deleted_count: ids.length }
}

function getIdField(resourceType: string): string {
  const mapping = {
    'carousel_slides': 'slide_id',
    'journey_milestones': 'milestone_id',
    'skills': 'skill_id',
    'tools': 'tool_id'
  }
  return mapping[resourceType] || 'id'
}