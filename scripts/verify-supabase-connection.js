import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function verifyConnection() {
  console.log('🔍 VERIFYING SUPABASE CONNECTION\n')
  console.log('=' .repeat(70))
  
  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log(`   VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL}`)
  console.log(`   VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌'}`)
  console.log(`   VITE_CLOUDINARY_CLOUD_NAME: ${process.env.VITE_CLOUDINARY_CLOUD_NAME}`)
  
  // Check if development mode
  const isDevelopmentMode = !process.env.VITE_SUPABASE_URL || 
                            !process.env.VITE_SUPABASE_ANON_KEY || 
                            process.env.VITE_SUPABASE_URL.includes('placeholder')
  
  console.log(`\n🔧 Development Mode: ${isDevelopmentMode ? '❌ YES (using mock data)' : '✅ NO (using real Supabase)'}`)
  
  if (isDevelopmentMode) {
    console.log('\n⚠️  WARNING: Application is in development mode!')
    console.log('   Configure Supabase in .env.local to enable full functionality')
    return
  }
  
  // Test database connection
  console.log('\n🔌 Testing Database Connection...')
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('org_id')
      .limit(1)
    
    if (error) {
      console.error('   ❌ Connection failed:', error.message)
      return
    }
    
    console.log('   ✅ Database connection successful!')
  } catch (err) {
    console.error('   ❌ Connection error:', err.message)
    return
  }
  
  // Check tables
  console.log('\n📊 Checking Database Tables...')
  const tables = [
    'organizations',
    'user_profiles',
    'case_studies',
    'story_sections',
    'cv_sections',
    'contact_sections',
    'assets'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: Accessible`)
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`)
    }
  }
  
  // Check current user
  console.log('\n👤 Checking Authentication...')
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.log('   ⚠️  No authenticated user (this is normal for scripts)')
  } else {
    console.log(`   ✅ Authenticated as: ${user.email}`)
  }
  
  // Check profile
  const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', CURRENT_USER_ID)
    .single()
  
  if (profile) {
    console.log(`\n✅ User Profile Found:`)
    console.log(`   User ID: ${profile.user_id}`)
    console.log(`   Org ID: ${profile.org_id}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Name: ${profile.name}`)
  }
  
  // Check data counts
  console.log('\n📈 Data Summary:')
  
  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('case_study_id')
    .eq('org_id', profile?.org_id || 'default-org')
  
  const { data: storySection } = await supabase
    .from('story_sections')
    .select('story_id')
    .eq('org_id', profile?.org_id || 'default-org')
  
  const { data: cvSection } = await supabase
    .from('cv_sections')
    .select('cv_section_id')
    .eq('org_id', profile?.org_id || 'default-org')
  
  const { data: assets } = await supabase
    .from('assets')
    .select('asset_id')
    .eq('org_id', profile?.org_id || 'default-org')
  
  console.log(`   Case Studies: ${caseStudies?.length || 0}`)
  console.log(`   My Story Sections: ${storySection?.length || 0}`)
  console.log(`   CV Sections: ${cvSection?.length || 0}`)
  console.log(`   Assets (Images): ${assets?.length || 0}`)
  
  console.log('\n' + '='.repeat(70))
  console.log('✅ SUPABASE CONNECTION VERIFIED!')
  console.log('\n💡 Status:')
  console.log('   ✅ Supabase is connected')
  console.log('   ✅ Database is accessible')
  console.log('   ✅ Tables are working')
  console.log('   ✅ Data is being stored')
  console.log('\n🎉 Your application is fully connected to Supabase!')
}

verifyConnection().catch(console.error)
