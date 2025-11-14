import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function publishCaseStudy() {
  console.log('📢 PUBLISHING CASE STUDY NOW\n')
  console.log('=' .repeat(70))
  
  // Update the case study to published
  const { data, error } = await supabase
    .from('case_studies')
    .update({ 
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('case_study_id', '01K9Z3PKH86B683DV5DYG41WCX')
    .select()
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log('✅ Case study published!')
  console.log(`   Title: ${data[0].title}`)
  console.log(`   Status: ${data[0].status}`)
  console.log(`   ID: ${data[0].case_study_id}`)
  
  console.log('\n' + '='.repeat(70))
  console.log('🎉 SUCCESS!')
  console.log('\n💡 Next steps:')
  console.log('   1. Refresh your homepage (F5)')
  console.log('   2. ✅ Your case study should appear!')
  console.log('   3. ❌ Demo projects should disappear!')
}

publishCaseStudy().catch(console.error)
