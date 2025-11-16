/**
 * Diagnose Section Consistency Issues
 * 
 * Check why sections appear in preview but disappear in published version
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Diagnosing Section Consistency Issues\n');
console.log('='.repeat(80));

async function diagnose() {
  try {
    // Get all case studies
    const { data: caseStudies, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (!caseStudies || caseStudies.length === 0) {
      console.log('⚠️  No case studies found.');
      return;
    }
    
    console.log(`\n📊 Found ${caseStudies.length} case study(ies)\n`);
    
    for (const cs of caseStudies) {
      console.log('─'.repeat(80));
      console.log(`\n📝 Case Study: "${cs.title}"`);
      console.log(`   ID: ${cs.case_study_id}`);
      console.log(`   Template: ${cs.template}`);
      console.log(`   Published: ${cs.is_published ? '✅ YES' : '❌ NO'}`);
      console.log(`   Last Updated: ${new Date(cs.updated_at).toLocaleString()}`);
      
      // Get all sections
      const { data: sections, error: sectError } = await supabase
        .from('case_study_sections')
        .select('*')
        .eq('case_study_id', cs.case_study_id)
        .order('section_type');
      
      if (sectError) {
        console.log(`   ❌ Error fetching sections: ${sectError.message}`);
        continue;
      }
      
      console.log(`\n   📋 Total Sections in Database: ${sections?.length || 0}`);
      
      // Target sections we're checking
      const targetSections = ['gallery', 'document', 'video', 'figma', 'miro', 'links'];
      
      console.log('\n   🎯 Target Sections Status:');
      console.log('   ' + '─'.repeat(76));
      
      for (const sectionType of targetSections) {
        const section = sections?.find(s => s.section_type === sectionType);
        
        if (!section) {
          console.log(`   ❌ ${sectionType.toUpperCase().padEnd(10)} - NOT IN DATABASE`);
          continue;
        }
        
        try {
          const content = typeof section.content === 'string' 
            ? JSON.parse(section.content) 
            : section.content;
          
          const enabled = content.enabled;
          const hasContent = checkHasContent(sectionType, content);
          
          const status = enabled && hasContent ? '✅' : '⚠️';
          console.log(`   ${status} ${sectionType.toUpperCase().padEnd(10)} - Enabled: ${enabled}, Has Content: ${hasContent}`);
          
          // Show details
          if (sectionType === 'gallery') {
            console.log(`      └─ Images: ${content.images?.length || 0}`);
            if (content.images && content.images.length > 0) {
              content.images.forEach((img, i) => {
                console.log(`         ${i + 1}. ${img.substring(0, 60)}...`);
              });
            }
          } else if (sectionType === 'links') {
            const linkCount = content.items ? content.items.split('\n').filter(l => l.trim()).length : 0;
            console.log(`      └─ Links: ${linkCount}`);
            if (content.items) {
              content.items.split('\n').filter(l => l.trim()).forEach((link, i) => {
                console.log(`         ${i + 1}. ${link}`);
              });
            }
          } else if (['video', 'figma', 'miro', 'document'].includes(sectionType)) {
            console.log(`      └─ URL: ${content.url || 'NOT SET'}`);
            if (content.caption) {
              console.log(`      └─ Caption: ${content.caption}`);
            }
          }
          
          // Check for issues
          if (enabled && !hasContent) {
            console.log(`      ⚠️  WARNING: Section is enabled but has no content!`);
          }
          
        } catch (e) {
          console.log(`   ❌ ${sectionType.toUpperCase().padEnd(10)} - Error parsing: ${e.message}`);
        }
      }
      
      // Check if template is ghibli or modern (uses static HTML)
      if (cs.template === 'ghibli' || cs.template === 'modern') {
        console.log('\n   ⚠️  IMPORTANT: This case study uses static HTML template!');
        console.log(`      Template: ${cs.template}`);
        console.log(`      Static HTML exists: ${cs.content_html ? 'YES' : 'NO'}`);
        
        if (cs.content_html) {
          // Check if sections are in the HTML
          console.log('\n      Checking if sections are in static HTML:');
          const html = cs.content_html;
          
          targetSections.forEach(sectionType => {
            const inHtml = html.toLowerCase().includes(sectionType);
            console.log(`      ${inHtml ? '✅' : '❌'} ${sectionType} ${inHtml ? 'found' : 'NOT found'} in HTML`);
          });
          
          console.log('\n      💡 NOTE: For ghibli/modern templates, sections must be');
          console.log('         regenerated when you click "Save Changes"!');
        } else {
          console.log('      ❌ No static HTML generated yet!');
          console.log('      💡 Click "Save Changes" to generate HTML');
        }
      }
      
      console.log('\n');
    }
    
    console.log('='.repeat(80));
    console.log('\n🔍 CONSISTENCY CHECK SUMMARY\n');
    
    console.log('Common Issues:');
    console.log('1. ❌ Section enabled but no content → Won\'t render');
    console.log('2. ❌ Section not in database → Not saved properly');
    console.log('3. ❌ Ghibli/Modern template HTML not regenerated → Old version showing');
    console.log('4. ❌ Content exists but enabled=false → Won\'t render');
    
    console.log('\n💡 Solutions:');
    console.log('1. Make sure to fill in content for each section');
    console.log('2. Click "Save Changes" after editing');
    console.log('3. For ghibli/modern templates, "Save Changes" regenerates HTML');
    console.log('4. Check the "Enable" checkbox for each section');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  }
}

function checkHasContent(sectionType, content) {
  switch (sectionType) {
    case 'gallery':
      return content.images && content.images.length > 0;
    case 'links':
      return content.items && content.items.trim().length > 0;
    case 'video':
    case 'figma':
    case 'miro':
    case 'document':
      return content.url && content.url.trim().length > 0;
    default:
      return false;
  }
}

diagnose();
