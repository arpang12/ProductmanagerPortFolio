import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'

async function testStoryImageFlow() {
  console.log('🧪 TESTING MY STORY IMAGE FLOW\n')
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
  
  console.log(`✅ Profile: ${profile.org_id}`)
  
  // Step 1: Get story section
  console.log('\n📖 Step 1: Getting story section...')
  const { data: storySection } = await supabase
    .from('story_sections')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (!storySection) {
    console.error('❌ No story section found')
    return
  }
  
  console.log(`   Story ID: ${storySection.story_id}`)
  console.log(`   Title: ${storySection.title}`)
  console.log(`   Image Asset ID: ${storySection.image_asset_id || '❌ NOT SET'}`)
  
  // Step 2: Check if image asset exists
  if (storySection.image_asset_id) {
    console.log('\n🖼️  Step 2: Checking image asset...')
    const { data: asset } = await supabase
      .from('assets')
      .select('*')
      .eq('asset_id', storySection.image_asset_id)
      .single()
    
    if (asset) {
      console.log('   ✅ Image asset found:')
      console.log(`      Asset ID: ${asset.asset_id}`)
      console.log(`      URL: ${asset.cloudinary_url}`)
      console.log(`      Type: ${asset.asset_type}`)
      console.log(`      Status: ${asset.status}`)
      console.log(`      Size: ${asset.width}x${asset.height}`)
    } else {
      console.log('   ❌ Image asset NOT found in assets table!')
      console.log('   This means the image_asset_id is invalid')
    }
  } else {
    console.log('\n⚠️  Step 2: No image_asset_id set')
    console.log('   This means no image has been uploaded yet')
  }
  
  // Step 3: Test the query that MyStoryManager uses
  console.log('\n🔧 Step 3: Testing MyStoryManager query...')
  const { data: adminData, error: adminError } = await supabase
    .from('story_sections')
    .select(`
      *,
      story_paragraphs (*),
      assets (*)
    `)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (adminError) {
    console.error('   ❌ Query error:', adminError.message)
  } else {
    console.log('   ✅ Query successful')
    console.log(`      Story ID: ${adminData.story_id}`)
    console.log(`      Image Asset ID: ${adminData.image_asset_id || 'Not set'}`)
    console.log(`      Assets data: ${adminData.assets ? 'Present' : 'NULL'}`)
    if (adminData.assets) {
      console.log(`      Cloudinary URL: ${adminData.assets.cloudinary_url || 'Not set'}`)
    }
  }
  
  // Step 4: Test homepage query
  console.log('\n🏠 Step 4: Testing homepage query...')
  const { data: homeData, error: homeError } = await supabase
    .from('story_sections')
    .select(`
      *,
      story_paragraphs (*),
      assets (*)
    `)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (homeError) {
    console.error('   ❌ Query error:', homeError.message)
  } else {
    console.log('   ✅ Query successful')
    console.log(`      Image will display: ${homeData.assets?.cloudinary_url ? 'YES' : 'NO'}`)
    if (homeData.assets?.cloudinary_url) {
      console.log(`      URL: ${homeData.assets.cloudinary_url}`)
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('🎯 DIAGNOSIS:')
  
  if (!storySection.image_asset_id) {
    console.log('   ❌ PROBLEM: No image_asset_id in story_sections table')
    console.log('   💡 SOLUTION: Upload an image in My Story Manager')
    console.log('   The image upload should set the image_asset_id field')
  } else if (!adminData?.assets) {
    console.log('   ❌ PROBLEM: image_asset_id exists but asset not found')
    console.log('   💡 SOLUTION: The asset may have been deleted')
    console.log('   Try uploading the image again')
  } else if (!adminData.assets.cloudinary_url) {
    console.log('   ❌ PROBLEM: Asset exists but no cloudinary_url')
    console.log('   💡 SOLUTION: Asset upload may have failed')
    console.log('   Try uploading the image again')
  } else {
    console.log('   ✅ Everything looks good!')
    console.log('   Image should display on both admin and homepage')
  }
}

testStoryImageFlow().catch(console.error)
