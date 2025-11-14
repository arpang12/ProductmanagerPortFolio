import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function cleanupDuplicateTimelines() {
  console.log('🔍 Cleaning Up Duplicate Journey Timelines\n');
  console.log('='.repeat(70));

  const ORG_ID = 'default-org';

  // Step 1: Get all timelines
  const { data: timelines } = await supabase
    .from('journey_timelines')
    .select('timeline_id, title, created_at')
    .eq('org_id', ORG_ID)
    .order('created_at', { ascending: false });

  if (!timelines || timelines.length === 0) {
    console.log('✅ No timelines found - nothing to clean up');
    return;
  }

  console.log(`\n📋 Found ${timelines.length} timeline(s):\n`);
  timelines.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.title} (${new Date(t.created_at).toLocaleString()})`);
  });

  if (timelines.length === 1) {
    console.log('\n✅ Only one timeline - no duplicates to clean up!');
    return;
  }

  // Step 2: Keep the newest, delete the rest
  const newestTimeline = timelines[0];
  const oldTimelines = timelines.slice(1);

  console.log(`\n📌 Keeping newest: ${newestTimeline.title}`);
  console.log(`   Created: ${new Date(newestTimeline.created_at).toLocaleString()}`);
  console.log(`\n🗑️  Deleting ${oldTimelines.length} old timeline(s)...`);

  for (const timeline of oldTimelines) {
    const { error } = await supabase
      .from('journey_timelines')
      .delete()
      .eq('timeline_id', timeline.timeline_id);

    if (error) {
      console.log(`   ❌ Failed to delete ${timeline.timeline_id}: ${error.message}`);
    } else {
      console.log(`   ✅ Deleted: ${timeline.title} (${new Date(timeline.created_at).toLocaleString()})`);
    }
  }

  // Step 3: Verify
  const { data: remaining } = await supabase
    .from('journey_timelines')
    .select('timeline_id, title')
    .eq('org_id', ORG_ID);

  console.log('\n' + '='.repeat(70));
  console.log(`\n✅ Cleanup complete! ${remaining?.length || 0} timeline(s) remaining.`);
  console.log('\n💡 Next steps:');
  console.log('   1. Refresh your admin page (F5)');
  console.log('   2. Open Journey Management');
  console.log('   3. Your milestones should appear!');
}

cleanupDuplicateTimelines().catch(console.error);
