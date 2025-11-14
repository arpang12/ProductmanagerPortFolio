import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugCaseStudyMismatch() {
  console.log('🔍 Debugging Case Study Data Mismatch\n');
  console.log('='.repeat(70));

  // Step 1: Check what getProjects() returns
  console.log('\n📋 Step 1: Checking Projects Data (Homepage)\n');
  
  const { data: projectsData, error: projectsError } = await supabase
    .from('case_studies')
    .select(`
      case_study_id,
      title,
      hero_image_asset_id,
      assets!case_studies_hero_image_asset_id_fkey (cloudinary_url),
      case_study_sections!inner (content)
    `)
    .eq('status', 'published')
    .eq('case_study_sections.section_type', 'hero');

  if (projectsError) {
    console.log('❌ Error fetching projects:', projectsError.message);
  } else {
    console.log(`✅ Found ${projectsData.length} published case study(ies) for homepage:`);
    projectsData.forEach((cs, index) => {
      console.log(`\n${index + 1}. ${cs.title}`);
      console.log(`   Case Study ID: ${cs.case_study_id}`);
      console.log(`   Hero sections: ${cs.case_study_sections?.length || 0}`);
      if (cs.case_study_sections && cs.case_study_sections.length > 0) {
        console.log(`   Hero content preview: ${JSON.stringify(cs.case_study_sections[0].content).substring(0, 100)}...`);
      }
    });
  }

  // Step 2: Check what getCaseStudyById() returns
  console.log('\n\n📋 Step 2: Checking Full Case Study Data (Detail Page)\n');
  
  if (projectsData && projectsData.length > 0) {
    const caseStudyId = projectsData[0].case_study_id;
    console.log(`Fetching full data for: ${caseStudyId}\n`);

    const { data: fullData, error: fullError } = await supabase
      .from('case_studies')
      .select(`
        *,
        case_study_sections (
          *,
          section_assets (
            *,
            assets (*)
          ),
          embed_widgets (*)
        )
      `)
      .eq('case_study_id', caseStudyId)
      .single();

    if (fullError) {
      console.log('❌ Error fetching full case study:', fullError.message);
    } else {
      console.log('✅ Full case study data:');
      console.log(`   Title: ${fullData.title}`);
      console.log(`   Template: ${fullData.template}`);
      console.log(`   Status: ${fullData.status}`);
      console.log(`   Slug: ${fullData.slug}`);
      console.log(`   Total sections: ${fullData.case_study_sections?.length || 0}`);
      
      if (fullData.case_study_sections) {
        console.log('\n   Sections breakdown:');
        fullData.case_study_sections.forEach((section) => {
          console.log(`   - ${section.section_type}: ${section.enabled ? 'Enabled' : 'Disabled'}`);
        });
      }
    }
  }

  // Step 3: Check for data inconsistencies
  console.log('\n\n📋 Step 3: Checking for Data Inconsistencies\n');

  const { data: allSections, error: sectionsError } = await supabase
    .from('case_study_sections')
    .select('case_study_id, section_type, enabled, content')
    .order('case_study_id');

  if (sectionsError) {
    console.log('❌ Error fetching sections:', sectionsError.message);
  } else {
    const sectionsByCase = {};
    allSections.forEach(section => {
      if (!sectionsByCase[section.case_study_id]) {
        sectionsByCase[section.case_study_id] = [];
      }
      sectionsByCase[section.case_study_id].push(section);
    });

    console.log(`Found sections for ${Object.keys(sectionsByCase).length} case study(ies):`);
    Object.entries(sectionsByCase).forEach(([caseId, sections]) => {
      console.log(`\n   Case Study ID: ${caseId}`);
      console.log(`   Sections: ${sections.length}`);
      sections.forEach(s => {
        console.log(`     - ${s.section_type}: ${s.enabled ? 'Enabled' : 'Disabled'}`);
      });
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n💡 Common Issues:\n');
  console.log('1. Case Study ID Mismatch:');
  console.log('   - Homepage shows one ID, but clicks load different ID');
  console.log('   - Check: project.caseStudyId in ProjectCard');
  console.log('');
  console.log('2. Missing Sections:');
  console.log('   - Case study exists but has no sections');
  console.log('   - Solution: Add sections in Admin → Case Studies');
  console.log('');
  console.log('3. Disabled Sections:');
  console.log('   - Sections exist but are disabled');
  console.log('   - Solution: Enable sections in case study editor');
  console.log('');
  console.log('4. Empty Content:');
  console.log('   - Sections enabled but content is empty');
  console.log('   - Solution: Add content to each section');
}

debugCaseStudyMismatch().catch(console.error);
