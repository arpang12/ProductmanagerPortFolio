import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba';

async function debugJourneyFlow() {
  console.log('🔍 Debugging Journey Save/Load Flow\n');
  console.log('='.repeat(70));

  // Step 1: Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id')
    .eq('user_id', CURRENT_USER_ID)
    .single();

  if (!profile) {
    console.log('❌ No profile found');
    return;
  }

  console.log(`✅ Profile found - Org ID: ${profile.org_id}\n`);

  // Step 2: Check what's in journey_timelines
  console.log('📋 Checking journey_timelines table:\n');
  const { data: timelines, error: timelineError } = await supabase
    .from('journey_timelines')
    .select('*')
    .eq('org_id', profile.org_id);

  if (timelineError) {
    console.log('❌ Error:', timelineError.message);
  } else if (!timelines || timelines.length === 0) {
    console.log('⚠️  No timelines found');
    console.log('   This means data was not saved, or was deleted');
  } else {
    console.log(`✅ Found ${timelines.length} timeline(s):`);
    timelines.forEach((t, i) => {
      console.log(`\n   ${i + 1}. Timeline ID: ${t.timeline_id}`);
      console.log(`      Title: ${t.title}`);
      console.log(`      Subtitle: ${t.subtitle}`);
      console.log(`      Created: ${new Date(t.created_at).toLocaleString()}`);
    });
  }

  // Step 3: Check what's in journey_milestones
  console.log('\n📋 Checking journey_milestones table:\n');
  const { data: milestones, error: milestoneError } = await supabase
    .from('journey_milestones')
    .select('*')
    .order('order_key');

  if (milestoneError) {
    console.log('❌ Error:', milestoneError.message);
  } else if (!milestones || milestones.length === 0) {
    console.log('⚠️  No milestones found');
    console.log('   This means milestones were not saved');
  } else {
    console.log(`✅ Found ${milestones.length} milestone(s):`);
    milestones.forEach((m, i) => {
      console.log(`\n   ${i + 1}. ${m.title}`);
      console.log(`      Company: ${m.company}`);
      console.log(`      Period: ${m.period}`);
      console.log(`      Timeline ID: ${m.timeline_id}`);
      console.log(`      Active: ${m.is_active}`);
      console.log(`      Order: ${m.order_key}`);
    });
  }

  // Step 4: Test the getMyJourney query (what the app uses)
  console.log('\n📋 Testing getMyJourney query (what app uses):\n');
  const { data: journeyData, error: journeyError } = await supabase
    .from('journey_timelines')
    .select(`
      *,
      journey_milestones (*)
    `)
    .eq('org_id', profile.org_id)
    .maybeSingle();

  if (journeyError) {
    console.log('❌ Error:', journeyError.message);
  } else if (!journeyData) {
    console.log('⚠️  No journey data returned');
    console.log('   This is why Journey Management shows empty!');
  } else {
    console.log('✅ Journey data found:');
    console.log(`   Title: ${journeyData.title}`);
    console.log(`   Subtitle: ${journeyData.subtitle}`);
    console.log(`   Milestones: ${journeyData.journey_milestones?.length || 0}`);
    
    if (journeyData.journey_milestones && journeyData.journey_milestones.length > 0) {
      console.log('\n   Milestone details:');
      journeyData.journey_milestones.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.title} at ${m.company}`);
      });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n💡 Diagnosis:\n');
  
  if (!timelines || timelines.length === 0) {
    console.log('❌ ISSUE: No timeline in database');
    console.log('   → Save is failing or data is being deleted');
    console.log('   → Check browser console for save errors');
  } else if (!milestones || milestones.length === 0) {
    console.log('❌ ISSUE: Timeline exists but no milestones');
    console.log('   → Milestones are not being saved');
    console.log('   → Check updateMyJourney function');
  } else if (!journeyData) {
    console.log('❌ ISSUE: Data exists but query returns nothing');
    console.log('   → Possible RLS (Row Level Security) issue');
    console.log('   → Or org_id mismatch');
  } else {
    console.log('✅ Everything looks good in database!');
    console.log('   → Data is saved correctly');
    console.log('   → Issue might be in frontend refresh');
    console.log('   → Try closing and reopening Journey Management');
  }
}

debugJourneyFlow().catch(console.error);
