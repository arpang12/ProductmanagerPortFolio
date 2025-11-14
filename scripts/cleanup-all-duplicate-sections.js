import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'

async function cleanupTable(tableName, idColumn, orgId) {
  const { data: sections } = await supabase
    .from(tableName)
    .select(`${idColumn}, created_at`)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  
  if (!sections || sections.length <= 1) {
    return { total: sections?.length || 0, deleted: 0 }
  }
  
  const sectionsToDelete = sections.slice(1)
  let deleted = 0
  
  for (const section of sectionsToDelete) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(idColumn, section[idColumn])
    
    if (!error) deleted++
  }
  
  return { total: sections.length, deleted }
}

async function cleanupAllDuplicates() {
  console.log('🧹 CLEANING UP ALL DUPLICATE SECTIONS\n')
  console.log('=' .repeat(70))
  
  // Get org_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id')
    .eq('user_id', CURRENT_USER_ID)
    .single()
  
  if (!profile) {
    console.error('❌ No profile found')
    return
  }
  
  console.log(`✅ Profile: ${profile.org_id}\n`)
  
  const tables = [
    { name: 'story_sections', id: 'story_id', label: 'My Story' },
    { name: 'cv_sections', id: 'cv_section_id', label: 'CV' },
    { name: 'contact_sections', id: 'contact_section_id', label: 'Contact' },
    { name: 'carousels', id: 'carousel_id', label: 'Carousel' },
    { name: 'my_journey', id: 'journey_id', label: 'My Journey' },
    { name: 'magic_toolbox', id: 'toolbox_id', label: 'Magic Toolbox' },
    { name: 'ai_settings', id: 'settings_id', label: 'AI Settings' }
  ]
  
  console.log('📊 Checking for duplicates...\n')
  
  for (const table of tables) {
    const result = await cleanupTable(table.name, table.id, profile.org_id)
    
    if (result.deleted > 0) {
      console.log(`❌ ${table.label}: ${result.total} found, deleted ${result.deleted} duplicates`)
    } else if (result.total > 0) {
      console.log(`✅ ${table.label}: ${result.total} section (no duplicates)`)
    } else {
      console.log(`⚠️  ${table.label}: No sections found`)
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('🎉 CLEANUP COMPLETE!')
  console.log('\n💡 Next steps:')
  console.log('   1. Refresh your browser (F5)')
  console.log('   2. Test all sections in admin panel')
  console.log('   3. Make changes and save')
  console.log('   4. Verify persistence on homepage')
}

cleanupAllDuplicates().catch(console.error)
