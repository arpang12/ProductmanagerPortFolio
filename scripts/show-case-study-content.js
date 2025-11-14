import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function showCaseStudyContent() {
  console.log('🔍 Showing Case Study Content\n');
  console.log('='.repeat(70));

  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      *,
      case_study_sections (*)
    `)
    .eq('title', 'ffs')
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log(`\n📄 Case Study: ${data.title}`);
  console.log(`   ID: ${data.case_study_id}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Template: ${data.template}`);
  console.log('\n' + '='.repeat(70));

  if (data.case_study_sections) {
    data.case_study_sections.forEach((section) => {
      if (section.enabled) {
        console.log(`\n📋 Section: ${section.section_type.toUpperCase()}`);
        console.log(`   Enabled: ${section.enabled}`);
        console.log(`   Content:`);
        
        try {
          const content = typeof section.content === 'string' 
            ? JSON.parse(section.content) 
            : section.content;
          
          console.log(JSON.stringify(content, null, 2));
        } catch (e) {
          console.log(section.content);
        }
        console.log('');
      }
    });
  }

  console.log('='.repeat(70));
  console.log('\n💡 Analysis:\n');
  console.log('If you see placeholder text like:');
  console.log('  - "New Case Study"');
  console.log('  - "An amazing new project"');
  console.log('  - "This is the introduction..."');
  console.log('');
  console.log('This means the case study was created but not edited yet.');
  console.log('');
  console.log('📋 To fix:');
  console.log('  1. Go to Admin → Case Studies');
  console.log('  2. Click on "ffs"');
  console.log('  3. Edit each section with your actual content');
  console.log('  4. Save');
  console.log('  5. Refresh homepage - your content will appear!');
}

showCaseStudyContent().catch(console.error);
