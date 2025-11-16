/**
 * RCA: Case Study Sections Data Flow Analysis
 * 
 * This script analyzes why Gallery, Document, Video, Figma, Miro, and Links sections
 * are not flowing from the editor to the frontend homepage.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 RCA: Case Study Sections Data Flow Analysis\n');
console.log('=' .repeat(80));

async function analyzeDataFlow() {
  try {
    // Step 1: Check if there are any published case studies
    console.log('\n📊 STEP 1: Checking Published Case Studies');
    console.log('-'.repeat(80));
    
    const { data: caseStudies, error: csError } = await supabase
      .from('case_studies')
      .select('*')
      .eq('is_published', true);
    
    if (csError) {
      console.error('❌ Error fetching case studies:', csError);
      return;
    }
    
    console.log(`✅ Found ${caseStudies?.length || 0} published case studies`);
    
    if (!caseStudies || caseStudies.length === 0) {
      console.log('⚠️  No published case studies found. Please publish a case study first.');
      return;
    }
    
    // Step 2: For each case study, check all sections
    for (const cs of caseStudies) {
      console.log(`\n📝 Analyzing Case Study: "${cs.title}" (ID: ${cs.case_study_id})`);
      console.log('-'.repeat(80));
      
      // Fetch all sections for this case study
      const { data: sections, error: sectionsError } = await supabase
        .from('case_study_sections')
        .select('*')
        .eq('case_study_id', cs.case_study_id)
        .order('section_type');
      
      if (sectionsError) {
        console.error('❌ Error fetching sections:', sectionsError);
        continue;
      }
      
      console.log(`\n📋 Total sections found: ${sections?.length || 0}`);
      
      // Group sections by type
      const sectionsByType = {};
      sections?.forEach(section => {
        if (!sectionsByType[section.section_type]) {
          sectionsByType[section.section_type] = [];
        }
        sectionsByType[section.section_type].push(section);
      });
      
      // Check for the specific sections we're interested in
      const targetSections = ['gallery', 'document', 'video', 'figma', 'miro', 'links'];
      
      console.log('\n🎯 Target Sections Analysis:');
      console.log('-'.repeat(80));
      
      for (const sectionType of targetSections) {
        const found = sectionsByType[sectionType];
        
        if (!found || found.length === 0) {
          console.log(`\n❌ ${sectionType.toUpperCase()}: NOT FOUND`);
        } else {
          console.log(`\n✅ ${sectionType.toUpperCase()}: FOUND (${found.length} record(s))`);
          
          found.forEach((section, idx) => {
            console.log(`\n   Record #${idx + 1}:`);
            console.log(`   - Section ID: ${section.section_id}`);
            console.log(`   - Order: ${section.order_key}`);
            console.log(`   - Content Preview:`);
            
            try {
              const content = typeof section.content === 'string' 
                ? JSON.parse(section.content) 
                : section.content;
              
              console.log(`     Enabled: ${content.enabled}`);
              
              // Show relevant fields based on section type
              if (sectionType === 'gallery') {
                console.log(`     Images: ${content.images?.length || 0} image(s)`);
                if (content.images && content.images.length > 0) {
                  content.images.forEach((img, i) => {
                    console.log(`       ${i + 1}. ${img.substring(0, 60)}...`);
                  });
                }
              } else if (sectionType === 'document') {
                console.log(`     URL: ${content.url || 'NOT SET'}`);
              } else if (sectionType === 'video') {
                console.log(`     URL: ${content.url || 'NOT SET'}`);
                console.log(`     Caption: ${content.caption || 'NOT SET'}`);
              } else if (sectionType === 'figma') {
                console.log(`     URL: ${content.url || 'NOT SET'}`);
                console.log(`     Caption: ${content.caption || 'NOT SET'}`);
              } else if (sectionType === 'miro') {
                console.log(`     URL: ${content.url || 'NOT SET'}`);
                console.log(`     Caption: ${content.caption || 'NOT SET'}`);
              } else if (sectionType === 'links') {
                console.log(`     Title: ${content.title || 'NOT SET'}`);
                console.log(`     Items: ${content.items || 'NOT SET'}`);
                if (content.items) {
                  const links = content.items.split('\n').filter(l => l.trim());
                  console.log(`     Number of links: ${links.length}`);
                  links.forEach((link, i) => {
                    console.log(`       ${i + 1}. ${link}`);
                  });
                }
              }
            } catch (e) {
              console.log(`     ⚠️  Error parsing content: ${e.message}`);
              console.log(`     Raw content: ${JSON.stringify(section.content).substring(0, 200)}...`);
            }
          });
        }
      }
      
      // Step 3: Check what the getProjects API would return
      console.log('\n\n🔄 STEP 3: Simulating getProjects() API Call');
      console.log('-'.repeat(80));
      
      const { data: projectData, error: projError } = await supabase
        .from('case_studies')
        .select(`
          case_study_id,
          title,
          hero_image_asset_id,
          is_published,
          assets!case_studies_hero_image_asset_id_fkey (cloudinary_url),
          case_study_sections!inner (content)
        `)
        .eq('is_published', true)
        .eq('case_study_sections.section_type', 'hero')
        .eq('case_study_id', cs.case_study_id);
      
      if (projError) {
        console.error('❌ Error simulating getProjects:', projError);
      } else {
        console.log('✅ getProjects() would return:');
        console.log(JSON.stringify(projectData, null, 2));
      }
      
      // Step 4: Check what getCaseStudy would return
      console.log('\n\n🔄 STEP 4: Simulating getCaseStudy() API Call');
      console.log('-'.repeat(80));
      
      const { data: fullCaseStudy, error: fullError } = await supabase
        .from('case_studies')
        .select(`
          *,
          case_study_sections (*)
        `)
        .eq('case_study_id', cs.case_study_id)
        .single();
      
      if (fullError) {
        console.error('❌ Error simulating getCaseStudy:', fullError);
      } else {
        console.log('✅ getCaseStudy() would return:');
        console.log(`   - Case Study ID: ${fullCaseStudy.case_study_id}`);
        console.log(`   - Title: ${fullCaseStudy.title}`);
        console.log(`   - Template: ${fullCaseStudy.template}`);
        console.log(`   - Published: ${fullCaseStudy.is_published}`);
        console.log(`   - Sections: ${fullCaseStudy.case_study_sections?.length || 0}`);
        
        console.log('\n   Section Types:');
        const sectionTypes = fullCaseStudy.case_study_sections?.map(s => s.section_type) || [];
        sectionTypes.forEach(type => {
          console.log(`     - ${type}`);
        });
        
        // Check if target sections are present
        console.log('\n   Target Sections Present:');
        targetSections.forEach(type => {
          const present = sectionTypes.includes(type);
          console.log(`     ${present ? '✅' : '❌'} ${type}`);
        });
      }
    }
    
    // Step 5: Analysis Summary
    console.log('\n\n📊 ANALYSIS SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n🔍 Key Findings:');
    console.log('1. Check if sections are being saved to the database');
    console.log('2. Check if sections have enabled: true');
    console.log('3. Check if sections have actual content (URLs, items, etc.)');
    console.log('4. Check if getCaseStudy() returns all sections');
    console.log('5. Check if CaseStudyPage.tsx renders these sections');
    
    console.log('\n💡 Common Issues:');
    console.log('❌ Sections not saved: Check AdminPage save logic');
    console.log('❌ Sections disabled: Check if enabled flag is set to true');
    console.log('❌ Empty content: Check if user actually filled in the fields');
    console.log('❌ Not rendered: Check CaseStudyPage.tsx rendering logic');
    console.log('❌ Wrong template: Ghibli/Modern templates use static HTML');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  }
}

analyzeDataFlow();
