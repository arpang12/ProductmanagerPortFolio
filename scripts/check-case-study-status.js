import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'

async function checkCaseStudyStatus() {
  console.log('🔍 CHECKING CASE STUDY STATUS\n')
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
  
  // Get all case studies
  const { data: allCaseStudies } = await supabase
    .from('case_studies')
    .select('case_study_id, title, status, created_at')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
  
  console.log(`📊 Total Case Studies: ${allCaseStudies?.length || 0}\n`)
  
  if (!allCaseStudies || allCaseStudies.length === 0) {
    console.log('⚠️  No case studies found!')
    console.log('\n💡 Create a case study in Admin Panel first')
    return
  }
  
  // Show each case study
  console.log('📋 Case Studies:\n')
  allCaseStudies.forEach((cs, index) => {
    const statusIcon = cs.status === 'published' ? '✅' : '⚠️ '
    console.log(`${index + 1}. ${cs.title}`)
    console.log(`   Status: ${statusIcon} ${cs.status}`)
    console.log(`   ID: ${cs.case_study_id}`)
    console.log(`   Created: ${cs.created_at}`)
    console.log()
  })
  
  // Count by status
  const published = allCaseStudies.filter(cs => cs.status === 'published').length
  const draft = allCaseStudies.filter(cs => cs.status === 'draft').length
  const archived = allCaseStudies.filter(cs => cs.status === 'archived').length
  
  console.log('📊 Status Summary:')
  console.log(`   Published: ${published} ✅`)
  console.log(`   Draft: ${draft} ⚠️ `)
  console.log(`   Archived: ${archived}`)
  
  console.log('\n' + '='.repeat(70))
  
  if (published === 0) {
    console.log('❌ PROBLEM: No published case studies!')
    console.log('\n💡 SOLUTION:')
    console.log('   1. Go to Admin Panel')
    console.log('   2. Edit your case study')
    console.log('   3. Change status to "published"')
    console.log('   4. Save changes')
    console.log('   5. Refresh homepage')
    console.log('   6. ✅ Your case studies will appear!')
    
    if (draft > 0) {
      console.log('\n🔧 Quick Fix SQL:')
      console.log('   Run this in Supabase Dashboard to publish all drafts:\n')
      console.log(`   UPDATE case_studies`)
      console.log(`   SET status = 'published'`)
      console.log(`   WHERE org_id = '${profile.org_id}'`)
      console.log(`   AND status = 'draft';`)
    }
  } else {
    console.log('✅ You have published case studies!')
    console.log('   They should appear on homepage')
    console.log('\n💡 If still showing demo projects:')
    console.log('   1. Check browser console for errors')
    console.log('   2. Refresh homepage (F5)')
    console.log('   3. Clear browser cache')
  }
}

checkCaseStudyStatus().catch(console.error)
