import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'

async function rcaCVFlow() {
  console.log('🔍 ROOT CAUSE ANALYSIS: CV FLOW\n')
  console.log('=' .repeat(70))
  
  // Step 1: Get org_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id, email')
    .eq('user_id', CURRENT_USER_ID)
    .single()
  
  if (!profile) {
    console.error('❌ No profile found')
    return
  }
  
  console.log('✅ Step 1: Profile found')
  console.log(`   Org ID: ${profile.org_id}`)
  console.log(`   Email: ${profile.email}`)
  
  // Step 2: Check CV Section
  console.log('\n📋 Step 2: Checking CV Section...')
  const { data: cvSections, error: sectionError } = await supabase
    .from('cv_sections')
    .select('*')
    .eq('org_id', profile.org_id)
  
  if (sectionError) {
    console.error('❌ CV Section error:', sectionError.message)
    return
  }
  
  console.log(`✅ Found ${cvSections.length} CV Section(s):`)
  cvSections.forEach((section, i) => {
    console.log(`   ${i + 1}. ID: ${section.cv_section_id}`)
    console.log(`      Title: ${section.title}`)
    console.log(`      Created: ${section.created_at}`)
  })
  
  if (cvSections.length === 0) {
    console.error('❌ No CV sections found!')
    return
  }
  
  // Use the first section
  const cvSection = cvSections[0]
  console.log(`\n📌 Using section: ${cvSection.cv_section_id}`)
  
  // Step 3: Check CV Versions
  console.log('\n📄 Step 3: Checking CV Versions...')
  const { data: versions, error: versionsError } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('cv_section_id', cvSection.cv_section_id)
    .order('order_key')
  
  if (versionsError) {
    console.error('❌ CV Versions error:', versionsError.message)
    return
  }
  
  console.log(`✅ Found ${versions.length} CV versions:`)
  versions.forEach((v, i) => {
    console.log(`\n   ${i + 1}. ${v.name} (${v.type})`)
    console.log(`      - Version ID: ${v.cv_version_id}`)
    console.log(`      - Active: ${v.is_active}`)
    console.log(`      - Google Drive URL: ${v.google_drive_url || '❌ NOT SET'}`)
    console.log(`      - File Asset ID: ${v.file_asset_id || 'None'}`)
    console.log(`      - File Name: ${v.file_name || 'None'}`)
    console.log(`      - Order Key: ${v.order_key}`)
  })
  
  // Step 4: Check Assets (if any)
  console.log('\n🖼️  Step 4: Checking Assets...')
  const assetIds = versions.filter(v => v.file_asset_id).map(v => v.file_asset_id)
  
  if (assetIds.length > 0) {
    const { data: assets } = await supabase
      .from('assets')
      .select('*')
      .in('asset_id', assetIds)
    
    console.log(`✅ Found ${assets?.length || 0} assets`)
    assets?.forEach(a => {
      console.log(`   - ${a.asset_id}: ${a.cloudinary_url}`)
    })
  } else {
    console.log('   ℹ️  No file assets uploaded yet')
  }
  
  // Step 5: Test the ADMIN query (what CVManager uses)
  console.log('\n🔧 Step 5: Testing ADMIN query (CVManager)...')
  const { data: adminData, error: adminError } = await supabase
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
  
  if (adminError) {
    console.error('❌ Admin query error:', adminError.message)
  } else {
    console.log('✅ Admin query successful')
    console.log(`   Versions returned: ${adminData.cv_versions?.length || 0}`)
    adminData.cv_versions?.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.name}: GDrive=${v.google_drive_url || 'NOT SET'}`)
    })
  }
  
  // Step 6: Test the HOMEPAGE query (what HomePage uses)
  console.log('\n🏠 Step 6: Testing HOMEPAGE query...')
  const { data: homeData, error: homeError } = await supabase
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
  
  if (homeError) {
    console.error('❌ Homepage query error:', homeError.message)
  } else {
    console.log('✅ Homepage query successful')
    console.log(`   Versions returned: ${homeData.cv_versions?.length || 0}`)
    homeData.cv_versions?.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.name}:`)
      console.log(`      - Active: ${v.is_active}`)
      console.log(`      - GDrive: ${v.google_drive_url || '❌ NOT SET'}`)
      console.log(`      - File: ${v.file_name || 'None'}`)
    })
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('🎯 RCA SUMMARY:')
  console.log('   1. Check if Google Drive URLs are in database ☝️')
  console.log('   2. Check if admin query returns them ☝️')
  console.log('   3. Check if homepage query returns them ☝️')
  console.log('\n💡 If URLs are NOT in database, the SAVE is broken')
  console.log('💡 If URLs are in database but not on homepage, the DISPLAY is broken')
}

rcaCVFlow().catch(console.error)
