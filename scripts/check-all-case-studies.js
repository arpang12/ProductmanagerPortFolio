/**
 * Check ALL case studies (published and unpublished)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Checking ALL Case Studies\n');

async function checkAll() {
  try {
    // Get all case studies
    const { data: allCaseStudies, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`📊 Total case studies: ${allCaseStudies?.length || 0}\n`);
    
    if (!allCaseStudies || allCaseStudies.length === 0) {
      console.log('⚠️  No case studies found in database.');
      return;
    }
    
    for (const cs of allCaseStudies) {
      console.log('─'.repeat(80));
      console.log(`📝 ${cs.title}`);
      console.log(`   ID: ${cs.case_study_id}`);
      console.log(`   Template: ${cs.template}`);
      console.log(`   Published: ${cs.is_published ? '✅ YES' : '❌ NO'}`);
      console.log(`   Created: ${new Date(cs.created_at).toLocaleString()}`);
      
      // Get sections for this case study
      const { data: sections, error: sectError } = await supabase
        .from('case_study_sections')
        .select('section_type, content')
        .eq('case_study_id', cs.case_study_id)
        .order('section_type');
      
      if (sectError) {
        console.log(`   ❌ Error fetching sections: ${sectError.message}`);
      } else {
        console.log(`   Sections: ${sections?.length || 0}`);
        
        const targetSections = ['gallery', 'document', 'video', 'figma', 'miro', 'links'];
        const sectionTypes = sections?.map(s => s.section_type) || [];
        
        console.log('\n   Target Sections:');
        targetSections.forEach(type => {
          const section = sections?.find(s => s.section_type === type);
          if (section) {
            try {
              const content = typeof section.content === 'string' 
                ? JSON.parse(section.content) 
                : section.content;
              
              const enabled = content.enabled ? '✅' : '❌';
              console.log(`   ${enabled} ${type.padEnd(10)} - Enabled: ${content.enabled}`);
              
              // Show key info
              if (type === 'gallery' && content.images) {
                console.log(`      └─ Images: ${content.images.length}`);
              } else if (type === 'links' && content.items) {
                const linkCount = content.items.split('\n').filter(l => l.trim()).length;
                console.log(`      └─ Links: ${linkCount}`);
              } else if (['video', 'figma', 'miro', 'document'].includes(type) && content.url) {
                console.log(`      └─ URL: ${content.url.substring(0, 50)}...`);
              }
            } catch (e) {
              console.log(`   ⚠️  ${type.padEnd(10)} - Error parsing: ${e.message}`);
            }
          } else {
            console.log(`   ⚠️  ${type.padEnd(10)} - NOT FOUND`);
          }
        });
      }
      
      console.log('');
    }
    
    console.log('─'.repeat(80));
    console.log('\n💡 Next Steps:');
    console.log('1. If case studies exist but are not published, publish them');
    console.log('2. If sections are disabled, enable them in the editor');
    console.log('3. If sections are missing, add content in the editor');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

checkAll();
