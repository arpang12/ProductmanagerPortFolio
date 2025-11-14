import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkCaseStudies() {
  console.log('🔍 Checking Case Studies\n');
  console.log('='.repeat(70));

  // Check all case studies
  const { data: allCaseStudies, error: allError } = await supabase
    .from('case_studies')
    .select('case_study_id, title, status, created_at');

  if (allError) {
    console.log('\n❌ Error fetching case studies:', allError.message);
    console.log('\n💡 This might mean:');
    console.log('   - No case studies exist yet');
    console.log('   - RLS is blocking access');
    return;
  }

  if (!allCaseStudies || allCaseStudies.length === 0) {
    console.log('\n⚠️  No case studies found in database');
    console.log('\n💡 This is why "Magical Projects" shows "Loading projects..."');
    console.log('\n📋 To fix this:');
    console.log('   Option 1: Create case studies in Admin → Case Studies');
    console.log('   Option 2: Use demo data (see below)');
    return;
  }

  console.log(`\n✅ Found ${allCaseStudies.length} case study(ies)\n`);

  // Show all case studies
  allCaseStudies.forEach((cs, index) => {
    console.log(`${index + 1}. ${cs.title}`);
    console.log(`   ID: ${cs.case_study_id}`);
    console.log(`   Status: ${cs.status}`);
    console.log(`   Created: ${new Date(cs.created_at).toLocaleDateString()}`);
    console.log('');
  });

  // Check published case studies
  const publishedCount = allCaseStudies.filter(cs => cs.status === 'published').length;
  const draftCount = allCaseStudies.filter(cs => cs.status === 'draft').length;

  console.log('='.repeat(70));
  console.log('\n📊 Summary:');
  console.log(`   Total case studies: ${allCaseStudies.length}`);
  console.log(`   Published: ${publishedCount} ✅`);
  console.log(`   Draft: ${draftCount} ⚠️`);

  if (publishedCount === 0) {
    console.log('\n⚠️  No published case studies!');
    console.log('\n💡 This is why projects don\'t show on homepage.');
    console.log('   The getProjects() function only fetches published case studies.');
    console.log('\n📋 To fix:');
    console.log('   1. Go to Admin → Case Studies');
    console.log('   2. Edit a case study');
    console.log('   3. Change status to "Published"');
    console.log('   4. Refresh homepage');
  } else {
    console.log('\n✅ Published case studies exist!');
    console.log('   They should appear on the homepage.');
  }
}

checkCaseStudies().catch(console.error);
