import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupCVDuplicates() {
  console.log('🧹 CLEANING UP CV DUPLICATES\n');
  console.log('='.repeat(60));

  try {
    // Count total CV versions
    const { count: totalCount } = await supabase
      .from('cv_versions')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total CV versions in database: ${totalCount}`);

    // Count CV sections
    const { count: sectionCount } = await supabase
      .from('cv_sections')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total CV sections: ${sectionCount}`);
    console.log(`📊 Expected CV versions: ${sectionCount * 3} (3 per section)`);
    console.log(`📊 Extra versions: ${totalCount - (sectionCount * 3)}`);

    if (totalCount > sectionCount * 3) {
      console.log('\n⚠️  Found duplicate CV versions!');
      console.log('This is causing the "123 rows" error.');
    }

    // Show versions per section
    console.log('\n📋 CV VERSIONS PER SECTION:');
    console.log('-'.repeat(60));

    const { data: sections } = await supabase
      .from('cv_sections')
      .select('cv_section_id, org_id');

    for (const section of sections || []) {
      const { count } = await supabase
        .from('cv_versions')
        .select('*', { count: 'exact', head: true })
        .eq('cv_section_id', section.cv_section_id);

      console.log(`Section ${section.cv_section_id}: ${count} versions`);
      
      if (count > 3) {
        console.log(`  ⚠️  This section has ${count - 3} extra versions!`);
      }
    }

    // Option to clean up
    console.log('\n💡 TO FIX THIS:');
    console.log('Run this SQL in Supabase Dashboard:');
    console.log('-'.repeat(60));
    console.log(`
-- Keep only the 3 most recent versions per CV section
WITH ranked_versions AS (
  SELECT 
    cv_version_id,
    cv_section_id,
    ROW_NUMBER() OVER (
      PARTITION BY cv_section_id 
      ORDER BY created_at DESC
    ) as rn
  FROM cv_versions
)
DELETE FROM cv_versions
WHERE cv_version_id IN (
  SELECT cv_version_id 
  FROM ranked_versions 
  WHERE rn > 3
);
    `);

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
  }
}

cleanupCVDuplicates();
