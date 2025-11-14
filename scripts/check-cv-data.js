import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkCVData() {
  console.log('🔍 Checking CV Section Data\n');
  console.log('='.repeat(70));

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('\n⚠️  Not authenticated in this context');
    console.log('   (This is normal - the web app uses a different session)');
  }

  // Try to fetch CV sections
  const { data: cvSections, error } = await supabase
    .from('cv_sections')
    .select(`
      *,
      cv_versions (*)
    `);

  if (error) {
    console.log('\n❌ Error fetching CV sections:', error.message);
    console.log('\n💡 This is expected if:');
    console.log('   1. No CV sections exist yet (will use demo data)');
    console.log('   2. User profile not set up (RLS blocking access)');
    return;
  }

  if (!cvSections || cvSections.length === 0) {
    console.log('\n⚠️  No CV sections found in database');
    console.log('\n💡 This means:');
    console.log('   - Homepage will show demo CV data');
    console.log('   - All versions will show "Coming Soon"');
    console.log('   - This is normal before uploading files');
    return;
  }

  console.log(`\n✅ Found ${cvSections.length} CV section(s)\n`);

  cvSections.forEach((section, index) => {
    console.log(`CV Section ${index + 1}:`);
    console.log(`  Title: ${section.title}`);
    console.log(`  Subtitle: ${section.subtitle}`);
    console.log(`  Versions: ${section.cv_versions?.length || 0}`);
    console.log('');

    if (section.cv_versions && section.cv_versions.length > 0) {
      section.cv_versions.forEach((version) => {
        console.log(`  📄 ${version.name} (${version.type})`);
        console.log(`     Active: ${version.is_active ? 'Yes' : 'No'}`);
        console.log(`     File URL: ${version.file_url || 'Not uploaded'}`);
        console.log(`     Google Drive: ${version.google_drive_url || 'Not set'}`);
        console.log(`     Status: ${version.file_url || version.google_drive_url ? '✅ Available' : '⚠️  Coming Soon'}`);
        console.log('');
      });
    }
  });

  console.log('='.repeat(70));
  console.log('\n📊 Summary:');
  console.log('   - CV section exists in database: ✅');
  console.log('   - Versions configured: ✅');
  console.log('   - Files uploaded: Check status above');
  console.log('\n💡 To make files available on homepage:');
  console.log('   1. Set up your user profile (see SETUP_YOUR_PROFILE.md)');
  console.log('   2. Go to Admin → CV Management');
  console.log('   3. Upload CV files or add Google Drive links');
  console.log('   4. Refresh homepage - download buttons will appear!');
}

checkCVData().catch(console.error);
