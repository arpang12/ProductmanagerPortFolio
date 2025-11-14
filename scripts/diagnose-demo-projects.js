import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'

async function diagnoseDemoProjects() {
  console.log('🔍 DIAGNOSING WHY DEMO PROJECTS STILL SHOW\n')
  console.log('=' .repeat(70))
  
  // Get org_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id')
    .eq('user_id', CURRENT_USER_ID)
    .single()
  
  console.log(`✅ Profile: ${profile.org_id}\n`)
  
  // Step 1: Check case study status
  console.log('📊 Step 1: Checking case study status...')
  const { data: allCaseStudies } = await supabase
    .from('case_studies')
    .select('case_study_id, title, status')
    .eq('org_id', profile.org_id)
  
  console.log(`   Total: ${allCaseStudies?.length || 0}`)
  allCaseStudies?.forEach(cs => {
    console.log(`   - ${cs.title}: ${cs.status}`)
  })
  
  // Step 2: Check published case studies
  console.log('\n📊 Step 2: Checking published case studies...')
  const { data: published } = await supabase
    .from('case_studies')
    .select('case_study_id, title, status')
    .eq('org_id', profile.org_id)
    .eq('status', 'published')
  
  console.log(`   Published: ${published?.length || 0}`)
  if (published && published.length > 0) {
    console.log('   ✅ Has published case studies')
  } else {
    console.log('   ❌ NO published case studies!')
    console.log('   This is why demo projects show')
    return
  }
  
  // Step 3: Check hero sections
  console.log('\n📊 Step 3: Checking hero sections...')
  const { data: heroSections, error: heroError } = await supabase
    .from('case_study_sections')
    .select('case_study_id, section_type, enabled')
    .in('case_study_id', published.map(p => p.case_study_id))
    .eq('section_type', 'hero')
  
  if (heroError) {
    console.log(`   ❌ Error: ${heroError.message}`)
  } else {
    console.log(`   Hero sections found: ${heroSections?.length || 0}`)
    heroSections?.forEach(hs => {
      console.log(`   - Case study ${hs.case_study_id}: enabled=${hs.enabled}`)
    })
  }
  
  // Step 4: Run the EXACT query that getProjects uses
  console.log('\n📊 Step 4: Running EXACT homepage query...')
  const { data: projectData, error: projectError } = await supabase
    .from('case_studies')
    .select(`
      case_study_id,
      title,
      hero_image_asset_id,
      assets!case_studies_hero_image_asset_id_fkey (cloudinary_url),
      case_study_sections!inner (content)
    `)
    .eq('status', 'published')
    .eq('case_study_sections.section_type', 'hero')
  
  if (projectError) {
    console.log(`   ❌ Query error: ${projectError.message}`)
    console.log('   This is why demo projects show!')
  } else {
    console.log(`   ✅ Query successful`)
    console.log(`   Results: ${projectData?.length || 0} case studies`)
    
    if (!projectData || projectData.length === 0) {
      console.log('   ❌ NO RESULTS!')
      console.log('   This is why demo projects show!')
    } else {
      console.log('\n   📋 Case studies that will show:')
      projectData.forEach((cs, i) => {
        console.log(`   ${i + 1}. ${cs.title}`)
        console.log(`      ID: ${cs.case_study_id}`)
        console.log(`      Hero image: ${cs.hero_image_asset_id || 'None'}`)
        console.log(`      Hero sections: ${cs.case_study_sections?.length || 0}`)
      })
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('🎯 DIAGNOSIS:')
  
  if (!published || published.length === 0) {
    console.log('   ❌ No published case studies')
    console.log('   💡 Run: UPDATE case_studies SET status = \'published\'')
  } else if (!projectData || projectData.length === 0) {
    console.log('   ❌ Published case studies exist BUT query returns nothing')
    console.log('   💡 Possible reasons:')
    console.log('      1. No hero section exists')
    console.log('      2. Hero section is disabled')
    console.log('      3. Inner join fails (no matching hero section)')
    console.log('\n   🔧 Fix: Check hero section in case study editor')
  } else {
    console.log('   ✅ Everything looks good!')
    console.log('   💡 Try:')
    console.log('      1. Hard refresh browser (Ctrl+Shift+R)')
    console.log('      2. Clear browser cache')
    console.log('      3. Check browser console for errors')
  }
}

diagnoseDemoProjects().catch(console.error)
