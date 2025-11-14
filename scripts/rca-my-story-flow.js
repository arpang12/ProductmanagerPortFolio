import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'

async function rcaMyStoryFlow() {
  console.log('🔍 ROOT CAUSE ANALYSIS: MY STORY FLOW\n')
  console.log('=' .repeat(70))
  
  // Step 1: Check Supabase connection
  console.log('🔌 Step 1: Checking Supabase connection...')
  console.log(`   URL: ${process.env.VITE_SUPABASE_URL}`)
  console.log(`   Key: ${process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`)
  
  const isDevelopmentMode = !process.env.VITE_SUPABASE_URL || 
                            !process.env.VITE_SUPABASE_ANON_KEY || 
                            process.env.VITE_SUPABASE_URL.includes('placeholder')
  
  if (isDevelopmentMode) {
    console.log('   ❌ DEVELOPMENT MODE - Using mock data!')
    console.log('   This is why data is not persisting!')
    return
  }
  console.log('   ✅ Supabase connected')
  
  // Step 2: Get org_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id, email')
    .eq('user_id', CURRENT_USER_ID)
    .single()
  
  if (!profile) {
    console.error('   ❌ No profile found')
    return
  }
  
  console.log(`\n✅ Step 2: Profile found`)
  console.log(`   Org ID: ${profile.org_id}`)
  console.log(`   Email: ${profile.email}`)
  
  // Step 3: Check My Story Sections
  console.log('\n📖 Step 3: Checking My Story Sections...')
  const { data: storySections, error: sectionError } = await supabase
    .from('story_sections')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
  
  if (sectionError) {
    console.error('   ❌ Query error:', sectionError.message)
    return
  }
  
  console.log(`   Found ${storySections.length} My Story section(s)`)
  
  if (storySections.length === 0) {
    console.log('   ⚠️  No My Story sections found!')
    return
  }
  
  if (storySections.length > 1) {
    console.log(`   ⚠️  WARNING: ${storySections.length} DUPLICATE sections found!`)
    console.log('   This is causing the persistence issue!')
    storySections.forEach((section, i) => {
      console.log(`   ${i + 1}. ID: ${section.story_id}`)
      console.log(`      Created: ${section.created_at}`)
      console.log(`      Title: ${section.title}`)
    })
  }
  
  const latestSection = storySections[0]
  console.log(`\n   📌 Latest section: ${latestSection.story_id}`)
  console.log(`      Title: ${latestSection.title}`)
  console.log(`      Subtitle: ${latestSection.subtitle}`)
  console.log(`      Image Asset ID: ${latestSection.image_asset_id || 'Not set'}`)
  
  // Step 4: Check if image is in assets table
  if (latestSection.image_asset_id) {
    console.log('\n🖼️  Step 4: Checking image asset...')
    const { data: asset } = await supabase
      .from('assets')
      .select('*')
      .eq('asset_id', latestSection.image_asset_id)
      .single()
    
    if (asset) {
      console.log('   ✅ Image asset found:')
      console.log(`      Asset ID: ${asset.asset_id}`)
      console.log(`      URL: ${asset.cloudinary_url}`)
      console.log(`      Type: ${asset.asset_type}`)
    } else {
      console.log('   ❌ Image asset not found!')
    }
  } else {
    console.log('\n🖼️  Step 4: No image asset linked')
  }
  
  // Step 5: Test ADMIN query (what MyStoryManager uses)
  console.log('\n🔧 Step 5: Testing ADMIN query (MyStoryManager)...')
  const { data: adminData, error: adminError } = await supabase
    .from('story_sections')
    .select(`
      *,
      story_paragraphs (*),
      assets (*)
    `)
    .eq('org_id', profile.org_id)
    .single()
  
  if (adminError) {
    console.error('   ❌ Admin query error:', adminError.message)
  } else if (!adminData) {
    console.log('   ⚠️  Admin query returned null')
  } else {
    console.log('   ✅ Admin query successful')
    console.log(`      Section ID: ${adminData.story_id}`)
    console.log(`      Image Asset ID: ${adminData.image_asset_id || 'Not set'}`)
    console.log(`      Paragraphs: ${adminData.story_paragraphs?.length || 0}`)
  }
  
  // Step 6: Test HOMEPAGE query
  console.log('\n🏠 Step 6: Testing HOMEPAGE query...')
  const { data: homeData, error: homeError } = await supabase
    .from('story_sections')
    .select(`
      *,
      story_paragraphs (*),
      assets (*)
    `)
    .eq('org_id', profile.org_id)
    .single()
  
  if (homeError) {
    console.error('   ❌ Homepage query error:', homeError.message)
  } else if (!homeData) {
    console.log('   ⚠️  Homepage query returned null')
  } else {
    console.log('   ✅ Homepage query successful')
    console.log(`      Section ID: ${homeData.story_id}`)
    console.log(`      Image Asset ID: ${homeData.image_asset_id || 'Not set'}`)
    console.log(`      Paragraphs: ${homeData.story_paragraphs?.length || 0}`)
  }
  
  // Step 7: Check if admin and homepage return same section
  console.log('\n🔗 Step 7: Checking consistency...')
  if (adminData && homeData) {
    if (adminData.story_id === homeData.story_id) {
      console.log('   ✅ Admin and homepage return SAME section')
    } else {
      console.log('   ❌ Admin and homepage return DIFFERENT sections!')
      console.log(`      Admin: ${adminData.story_id}`)
      console.log(`      Homepage: ${homeData.story_id}`)
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('🎯 RCA SUMMARY:')
  console.log(`   - Total sections: ${storySections.length}`)
  console.log(`   - Expected: 1`)
  console.log(`   - Duplicates: ${storySections.length - 1}`)
  
  if (storySections.length > 1) {
    console.log('\n💡 PROBLEM FOUND: Multiple My Story sections!')
    console.log('   This causes the same issue as CV - saving to one, loading another')
    console.log('\n🔧 SOLUTION: Run cleanup script to remove duplicates')
  } else {
    console.log('\n✅ No duplicates found')
    console.log('💡 Check if .maybeSingle() is causing issues with multiple results')
  }
}

rcaMyStoryFlow().catch(console.error)
