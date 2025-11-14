import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function publishCaseStudy() {
  console.log('🔍 Publishing Case Study "ffs"\n');
  console.log('='.repeat(70));

  // Check current status
  const { data: before, error: beforeError } = await supabase
    .from('case_studies')
    .select('case_study_id, title, status')
    .eq('title', 'ffs')
    .single();

  if (beforeError) {
    console.log('\n❌ Error finding case study:', beforeError.message);
    return;
  }

  if (!before) {
    console.log('\n❌ Case study "ffs" not found');
    return;
  }

  console.log('\n📋 Current Status:');
  console.log(`   Title: ${before.title}`);
  console.log(`   Status: ${before.status}`);
  console.log(`   ID: ${before.case_study_id}`);

  if (before.status === 'published') {
    console.log('\n✅ Already published!');
    console.log('   Your case study should appear on the homepage.');
    return;
  }

  // Publish it
  console.log('\n🔄 Publishing...');
  const { data: after, error: updateError } = await supabase
    .from('case_studies')
    .update({ 
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('case_study_id', before.case_study_id)
    .select()
    .single();

  if (updateError) {
    console.log('\n❌ Error publishing:', updateError.message);
    console.log('\n💡 This might be an RLS (Row Level Security) issue.');
    console.log('   Try running the SQL in Supabase dashboard instead:');
    console.log('   See: PUBLISH_CASE_STUDY.sql');
    return;
  }

  console.log('\n✅ Successfully published!');
  console.log(`   Title: ${after.title}`);
  console.log(`   Status: ${after.status}`);
  console.log(`   Updated: ${new Date(after.updated_at).toLocaleString()}`);

  console.log('\n🎉 Done!');
  console.log('   1. Refresh your homepage');
  console.log('   2. Scroll to "Magical Projects"');
  console.log('   3. Your case study "ffs" should appear!');
  console.log('\n='.repeat(70));
}

publishCaseStudy().catch(console.error);
