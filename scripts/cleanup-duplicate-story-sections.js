import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba'

async function cleanupDuplicateStory() {
  console.log('🧹 CLEANING UP DUPLICATE MY STORY SECTIONS\n')
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
  
  console.log(`✅ Profile found: ${profile.org_id}`)
  
  // Count story sections
  const { data: sections } = await supabase
    .from('story_sections')
    .select('story_id, created_at, title')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
  
  console.log(`\n📊 Found ${sections.length} My Story sections`)
  
  if (sections.length <= 1) {
    console.log('✅ No duplicates to clean up!')
    return
  }
  
  // Keep the most recent, delete the rest
  const latestSection = sections[0]
  const sectionsToDelete = sections.slice(1)
  
  console.log(`\n✅ Keeping most recent section: ${latestSection.story_id}`)
  console.log(`   Created: ${latestSection.created_at}`)
  console.log(`   Title: ${latestSection.title}`)
  console.log(`\n❌ Deleting ${sectionsToDelete.length} old sections...`)
  
  // Delete old sections (this will CASCADE delete story_paragraphs)
  let deleted = 0
  for (const section of sectionsToDelete) {
    const { error } = await supabase
      .from('story_sections')
      .delete()
      .eq('story_id', section.story_id)
    
    if (error) {
      console.error(`   ❌ Failed to delete ${section.story_id}:`, error.message)
    } else {
      deleted++
      if (deleted % 10 === 0) {
        console.log(`   ✅ Deleted ${deleted}/${sectionsToDelete.length} sections...`)
      }
    }
  }
  
  console.log(`   ✅ Deleted all ${deleted} old sections`)
  
  // Verify cleanup
  const { data: remaining } = await supabase
    .from('story_sections')
    .select('story_id, created_at')
    .eq('org_id', profile.org_id)
  
  console.log(`\n✅ Cleanup complete!`)
  console.log(`   Remaining sections: ${remaining.length}`)
  
  if (remaining.length === 1) {
    console.log('\n🎉 SUCCESS! Only 1 My Story section remains.')
    console.log('\n💡 Next steps:')
    console.log('   1. Refresh your browser (F5)')
    console.log('   2. Go to My Story Management')
    console.log('   3. Upload an image and edit content')
    console.log('   4. Save changes')
    console.log('   5. Check homepage - changes should persist!')
  } else {
    console.log(`\n⚠️  Warning: ${remaining.length} sections still remain`)
  }
}

cleanupDuplicateStory().catch(console.error)
