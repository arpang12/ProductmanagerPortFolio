import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'
const TEST_GDRIVE_URL = 'https://drive.google.com/file/d/TEST_FILE_ID_123/view'

async function testSaveLoadCycle() {
  console.log('🧪 TESTING CV SAVE/LOAD CYCLE\n')
  console.log('=' .repeat(70))
  
  // Get org_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id')
    .eq('user_id', CURRENT_USER_ID)
    .single()
  
  console.log(`✅ Profile: ${profile.org_id}`)
  
  // Step 1: Load CV section (simulating admin load)
  console.log('\n📥 Step 1: Loading CV section (admin)...')
  const { data: cvSection } = await supabase
    .from('cv_sections')
    .select(`
      *,
      cv_versions!cv_versions_cv_section_id_fkey (*)
    `)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  console.log(`   Section ID: ${cvSection.cv_section_id}`)
  console.log(`   Versions: ${cvSection.cv_versions.length}`)
  
  // Step 2: Update a version with Google Drive URL (simulating user edit)
  console.log('\n✏️  Step 2: Updating Indian CV with Google Drive URL...')
  const indianVersion = cvSection.cv_versions.find(v => v.type === 'indian')
  
  const { error: updateError } = await supabase
    .from('cv_versions')
    .update({ 
      google_drive_url: TEST_GDRIVE_URL,
      updated_at: new Date().toISOString()
    })
    .eq('cv_version_id', indianVersion.cv_version_id)
  
  if (updateError) {
    console.error('   ❌ Update failed:', updateError.message)
    return
  }
  console.log('   ✅ Update successful')
  
  // Step 3: Reload CV section (simulating page refresh)
  console.log('\n🔄 Step 3: Reloading CV section (simulating refresh)...')
  const { data: reloadedSection } = await supabase
    .from('cv_sections')
    .select(`
      *,
      cv_versions!cv_versions_cv_section_id_fkey (*)
    `)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  console.log(`   Section ID: ${reloadedSection.cv_section_id}`)
  
  // Step 4: Check if Google Drive URL persisted
  console.log('\n🔍 Step 4: Checking if Google Drive URL persisted...')
  const reloadedIndianVersion = reloadedSection.cv_versions.find(v => v.type === 'indian')
  
  if (reloadedIndianVersion.google_drive_url === TEST_GDRIVE_URL) {
    console.log('   ✅ SUCCESS! Google Drive URL persisted!')
    console.log(`   URL: ${reloadedIndianVersion.google_drive_url}`)
  } else {
    console.log('   ❌ FAILED! Google Drive URL did not persist')
    console.log(`   Expected: ${TEST_GDRIVE_URL}`)
    console.log(`   Got: ${reloadedIndianVersion.google_drive_url || 'null'}`)
  }
  
  // Step 5: Check homepage query
  console.log('\n🏠 Step 5: Testing homepage query...')
  const { data: homepageSection } = await supabase
    .from('cv_sections')
    .select(`
      *,
      cv_versions!cv_versions_cv_section_id_fkey (*)
    `)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  const homepageIndianVersion = homepageSection.cv_versions.find(v => v.type === 'indian')
  
  if (homepageIndianVersion.google_drive_url === TEST_GDRIVE_URL) {
    console.log('   ✅ SUCCESS! Homepage shows correct URL!')
    console.log(`   URL: ${homepageIndianVersion.google_drive_url}`)
  } else {
    console.log('   ❌ FAILED! Homepage shows wrong URL')
    console.log(`   Expected: ${TEST_GDRIVE_URL}`)
    console.log(`   Got: ${homepageIndianVersion.google_drive_url || 'null'}`)
  }
  
  // Step 6: Verify section IDs match
  console.log('\n🔗 Step 6: Verifying section consistency...')
  if (cvSection.cv_section_id === reloadedSection.cv_section_id && 
      reloadedSection.cv_section_id === homepageSection.cv_section_id) {
    console.log('   ✅ All queries return the SAME section!')
    console.log(`   Section ID: ${cvSection.cv_section_id}`)
  } else {
    console.log('   ❌ Queries return DIFFERENT sections!')
    console.log(`   Initial: ${cvSection.cv_section_id}`)
    console.log(`   Reloaded: ${reloadedSection.cv_section_id}`)
    console.log(`   Homepage: ${homepageSection.cv_section_id}`)
  }
  
  // Cleanup: Remove test URL
  console.log('\n🧹 Cleanup: Removing test URL...')
  await supabase
    .from('cv_versions')
    .update({ 
      google_drive_url: null,
      updated_at: new Date().toISOString()
    })
    .eq('cv_version_id', indianVersion.cv_version_id)
  
  console.log('\n' + '='.repeat(70))
  console.log('🎯 TEST COMPLETE!')
  console.log('\n✅ If all steps passed, CV persistence is working correctly!')
}

testSaveLoadCycle().catch(console.error)
