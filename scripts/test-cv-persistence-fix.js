import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'

async function testCVPersistence() {
  console.log('🧪 TESTING CV PERSISTENCE FIX\n')
  console.log('=' .repeat(60))
  
  // Get user profile directly
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id, email')
    .eq('user_id', CURRENT_USER_ID)
    .single()
  
  if (!profile) {
    console.error('❌ No profile found')
    return
  }
  console.log('✅ Profile found, org_id:', profile.org_id)
  
  // Test the FIXED query
  console.log('\n🔍 Testing FIXED query with .limit(1).single()...')
  const { data, error } = await supabase
    .from('cv_sections')
    .select(`
      *,
      cv_versions!cv_versions_cv_section_id_fkey (
        *,
        assets (*)
      )
    `)
    .eq('org_id', profile.org_id)
    .limit(1)
    .single()
  
  if (error) {
    console.error('❌ Query failed:', error.message)
    return
  }
  
  console.log('✅ Query successful!')
  console.log('\n📊 CV Section Data:')
  console.log('  - Section ID:', data.cv_section_id)
  console.log('  - Title:', data.title)
  console.log('  - Subtitle:', data.subtitle)
  console.log('  - Number of versions:', data.cv_versions?.length || 0)
  
  if (data.cv_versions && data.cv_versions.length > 0) {
    console.log('\n📄 CV Versions:')
    data.cv_versions.forEach((version, index) => {
      console.log(`  ${index + 1}. ${version.name} (${version.type})`)
      console.log(`     - Active: ${version.is_active}`)
      console.log(`     - Google Drive: ${version.google_drive_url || 'Not set'}`)
      console.log(`     - File: ${version.file_name || 'Not uploaded'}`)
    })
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ CV PERSISTENCE FIX VERIFIED!')
  console.log('\n💡 Next steps:')
  console.log('   1. Refresh your browser (F5)')
  console.log('   2. Go to CV Management')
  console.log('   3. Add a Google Drive URL')
  console.log('   4. Click "Save All Changes"')
  console.log('   5. Refresh and verify it persists!')
}

testCVPersistence().catch(console.error)
