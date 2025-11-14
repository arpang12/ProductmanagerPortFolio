import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifySetup() {
  console.log('🔍 Verifying Profile Setup\n');
  console.log('='.repeat(70));

  const USER_ID = '1f1a3c1a-e0ff-42a6-910c-930724e7ea5d';

  // Check user profile
  console.log('\n📋 Step 1: Checking User Profile\n');
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', USER_ID)
    .maybeSingle();

  if (profileError) {
    console.log('❌ Error checking profile:', profileError.message);
    return;
  }

  if (!profile) {
    console.log('❌ User profile NOT found');
    console.log('\n💡 The SQL might not have run successfully.');
    console.log('   Please check Supabase SQL Editor for errors.');
    return;
  }

  console.log('✅ User profile found!');
  console.log(`   User ID: ${profile.user_id}`);
  console.log(`   Org ID: ${profile.org_id}`);
  console.log(`   Email: ${profile.email}`);
  console.log(`   Name: ${profile.name}`);
  console.log(`   Role: ${profile.role}`);

  // Check organization
  console.log('\n📋 Step 2: Checking Organization\n');
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('org_id', profile.org_id)
    .single();

  if (orgError || !org) {
    console.log('❌ Organization not found');
    return;
  }

  console.log('✅ Organization found!');
  console.log(`   Org ID: ${org.org_id}`);
  console.log(`   Name: ${org.name}`);
  console.log(`   Slug: ${org.slug}`);

  // Check journey timeline
  console.log('\n📋 Step 3: Checking Journey Timeline\n');
  const { data: timeline, error: timelineError } = await supabase
    .from('journey_timelines')
    .select('*')
    .eq('org_id', profile.org_id)
    .maybeSingle();

  if (timelineError) {
    console.log('⚠️  Error checking timeline:', timelineError.message);
  } else if (!timeline) {
    console.log('⚠️  No journey timeline found');
    console.log('   This is normal - it will be created when you save');
  } else {
    console.log('✅ Journey timeline exists!');
    console.log(`   Timeline ID: ${timeline.timeline_id}`);
    console.log(`   Title: ${timeline.title}`);
  }

  // Check journey milestones
  console.log('\n📋 Step 4: Checking Journey Milestones\n');
  const { data: milestones, error: milestonesError } = await supabase
    .from('journey_milestones')
    .select('*')
    .order('order_key');

  if (milestonesError) {
    console.log('⚠️  Error checking milestones:', milestonesError.message);
  } else if (!milestones || milestones.length === 0) {
    console.log('⚠️  No milestones found');
    console.log('   This is normal - add them in Journey Management');
  } else {
    console.log(`✅ Found ${milestones.length} milestone(s):`);
    milestones.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title} at ${m.company}`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Summary:\n');
  console.log(`✅ User Profile: ${profile ? 'EXISTS' : 'MISSING'}`);
  console.log(`✅ Organization: ${org ? 'EXISTS' : 'MISSING'}`);
  console.log(`${timeline ? '✅' : '⚠️ '} Journey Timeline: ${timeline ? 'EXISTS' : 'WILL BE CREATED'}`);
  console.log(`${milestones?.length > 0 ? '✅' : '⚠️ '} Milestones: ${milestones?.length || 0}`);

  if (profile && org) {
    console.log('\n🎉 Profile setup is COMPLETE!');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh your admin page (F5)');
    console.log('   2. Go to Journey Management');
    console.log('   3. Add milestones');
    console.log('   4. Click "Save Changes"');
    console.log('   5. Check browser console for any errors');
  }
}

verifySetup().catch(console.error);
