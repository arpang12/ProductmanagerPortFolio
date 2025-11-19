// Check which tables exist in the database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkExistingTables() {
  console.log('🔍 Checking existing tables in database...\n');
  
  const tablesToCheck = [
    'user_profiles',
    'case_studies', 
    'case_study_sections',
    'story_sections',
    'story_paragraphs',
    'journeys',
    'journey_items',
    'magic_toolboxes',
    'skill_categories',
    'tools',
    'contact_sections',
    'social_links',
    'carousel_slides',
    'carousels',
    'assets',
    'portfolio_snapshots'
  ];

  const existingTables = [];
  const missingTables = [];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        missingTables.push(table);
      } else {
        console.log(`✅ ${table}: exists`);
        existingTables.push(table);
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
      missingTables.push(table);
    }
  }

  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`✅ Existing tables (${existingTables.length}):`);
  existingTables.forEach(table => console.log(`   - ${table}`));
  
  console.log(`\n❌ Missing tables (${missingTables.length}):`);
  missingTables.forEach(table => console.log(`   - ${table}`));

  console.log('\n🔧 Next Steps:');
  console.log('1. I\'ll create a corrected RLS policy file with only existing tables');
  console.log('2. Run the corrected SQL file in Supabase');
  console.log('3. The public-first data flow will work with available tables');

  return { existingTables, missingTables };
}

checkExistingTables();