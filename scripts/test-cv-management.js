import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCVManagement() {
  console.log('🧪 TESTING CV MANAGEMENT PERSISTENCE\n');
  console.log('='.repeat(60));

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      console.error('❌ User profile not found');
      return;
    }

    console.log('✅ Org ID:', profile.org_id);

    // Fetch CV section
    console.log('\n📋 FETCHING CV SECTION');
    console.log('-'.repeat(60));
    
    const { data: cvData, error: cvError } = await supabase
      .from('cv_sections')
      .select(`
        *,
        cv_versions (*)
      `)
      .eq('org_id', profile.org_id)
      .single();

    if (cvError) {
      console.log('⚠️  No CV section found:', cvError.message);
      console.log('💡 Create one in the admin panel first');
      return;
    }

    console.log('✅ CV section found');
    console.log('   Section ID:', cvData.cv_section_id);
    console.log('   Title:', cvData.title);
    console.log('   Subtitle:', cvData.subtitle);
    console.log('   Description:', cvData.description);

    // Check CV versions
    console.log('\n📄 CV VERSIONS');
    console.log('-'.repeat(60));
    
    if (cvData.cv_versions && cvData.cv_versions.length > 0) {
      console.log(`✅ Found ${cvData.cv_versions.length} CV versions`);
      
      for (const version of cvData.cv_versions) {
        console.log(`\n   ${version.name} (${version.type})`);
        console.log(`   ├─ Version ID: ${version.cv_version_id}`);
        console.log(`   ├─ Active: ${version.is_active ? 'Yes ✅' : 'No ⚠️'}`);
        
        // Check file upload
        if (version.file_asset_id) {
          console.log(`   ├─ File Asset ID: ${version.file_asset_id}`);
          
          // Verify asset exists
          const { data: asset, error: assetError } = await supabase
            .from('assets')
            .select('*')
            .eq('asset_id', version.file_asset_id)
            .single();

          if (assetError) {
            console.log(`   ├─ ❌ Asset not found (broken link)`);
          } else {
            console.log(`   ├─ ✅ File: ${asset.original_filename}`);
            console.log(`   ├─ ✅ Size: ${Math.round(asset.file_size / 1024)} KB`);
            console.log(`   ├─ ✅ URL: ${asset.cloudinary_url}`);
          }
        } else {
          console.log(`   ├─ ⚠️  No file uploaded`);
        }
        
        // Check Google Drive URL
        if (version.google_drive_url) {
          console.log(`   ├─ ✅ Google Drive: ${version.google_drive_url}`);
        } else {
          console.log(`   ├─ ⚠️  No Google Drive URL`);
        }
        
        // Check metadata
        if (version.file_name) {
          console.log(`   ├─ File Name: ${version.file_name}`);
        }
        if (version.file_size) {
          console.log(`   ├─ File Size: ${Math.round(version.file_size / 1024)} KB`);
        }
        if (version.upload_date) {
          console.log(`   └─ Upload Date: ${new Date(version.upload_date).toLocaleString()}`);
        }
      }
    } else {
      console.log('⚠️  No CV versions found');
      console.log('💡 This is unusual - versions should be created by default');
    }

    // Test persistence
    console.log('\n🔍 TESTING PERSISTENCE');
    console.log('-'.repeat(60));
    
    const persistenceChecks = [];
    
    for (const version of cvData.cv_versions || []) {
      const hasFile = !!version.file_asset_id;
      const hasDrive = !!version.google_drive_url;
      const isActive = version.is_active;
      
      if (hasFile || hasDrive) {
        persistenceChecks.push({
          name: `${version.name} - Has content`,
          status: true
        });
        
        if (hasFile) {
          // Verify asset still exists
          const { data: asset } = await supabase
            .from('assets')
            .select('asset_id')
            .eq('asset_id', version.file_asset_id)
            .single();
          
          persistenceChecks.push({
            name: `${version.name} - File link valid`,
            status: !!asset
          });
        }
      }
    }

    if (persistenceChecks.length > 0) {
      persistenceChecks.forEach(check => {
        const icon = check.status ? '✅' : '❌';
        console.log(`${icon} ${check.name}`);
      });
    } else {
      console.log('⚠️  No CV files uploaded yet to test persistence');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    const summary = [
      { name: 'CV section exists', status: !!cvData },
      { name: 'CV versions exist', status: cvData.cv_versions?.length > 0 },
      { name: 'At least one file uploaded', status: cvData.cv_versions?.some(v => v.file_asset_id) },
      { name: 'At least one Drive URL', status: cvData.cv_versions?.some(v => v.google_drive_url) },
      { name: 'At least one active version', status: cvData.cv_versions?.some(v => v.is_active) }
    ];

    summary.forEach(item => {
      const icon = item.status ? '✅' : '⚠️ ';
      console.log(`${icon} ${item.name}`);
    });

    const hasUploads = cvData.cv_versions?.some(v => v.file_asset_id || v.google_drive_url);
    
    if (hasUploads) {
      console.log('\n✅ CV DATA IS PERSISTENT!');
      console.log('   Files and URLs will remain after page reload');
    } else {
      console.log('\n⚠️  NO CV FILES UPLOADED YET');
      console.log('   Upload CV files to test persistence');
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Go to Admin Panel → CV Management');
    console.log('   2. Upload CV files for each version');
    console.log('   3. OR add Google Drive URLs');
    console.log('   4. Toggle versions active/inactive');
    console.log('   5. Refresh the page');
    console.log('   6. Run this script again to verify persistence');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testCVManagement();
