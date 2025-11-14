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

async function testContactResume() {
  console.log('🧪 TESTING CONTACT SECTION RESUME PERSISTENCE\n');
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

    // Fetch contact section
    console.log('\n📋 FETCHING CONTACT SECTION');
    console.log('-'.repeat(60));
    
    const { data: contactData, error: contactError } = await supabase
      .from('contact_sections')
      .select(`
        *,
        social_links (*),
        assets (*)
      `)
      .eq('org_id', profile.org_id)
      .single();

    if (contactError) {
      console.log('⚠️  No contact section found:', contactError.message);
      console.log('💡 Create one in the admin panel first');
      return;
    }

    console.log('✅ Contact section found');
    console.log('   Contact ID:', contactData.contact_id);
    console.log('   Title:', contactData.title);
    console.log('   Email:', contactData.email);
    console.log('   Location:', contactData.location);

    // Check resume
    console.log('\n📄 RESUME STATUS');
    console.log('-'.repeat(60));
    
    if (contactData.resume_asset_id) {
      console.log('✅ Resume asset ID:', contactData.resume_asset_id);
      
      if (contactData.assets) {
        console.log('✅ Resume URL:', contactData.assets.cloudinary_url);
        console.log('   File name:', contactData.assets.original_filename);
        console.log('   File size:', contactData.assets.file_size, 'bytes');
        console.log('   Upload date:', contactData.assets.created_at);
      } else {
        console.log('⚠️  Asset ID exists but asset not found');
      }
    } else {
      console.log('⚠️  No resume uploaded yet');
      console.log('💡 Upload a resume in Contact Management');
    }

    // Check social links
    console.log('\n🔗 SOCIAL LINKS');
    console.log('-'.repeat(60));
    
    if (contactData.social_links && contactData.social_links.length > 0) {
      console.log(`✅ Found ${contactData.social_links.length} social links`);
      contactData.social_links.forEach((link, i) => {
        console.log(`   ${i + 1}. ${link.icon} ${link.name}: ${link.url}`);
      });
    } else {
      console.log('⚠️  No social links added yet');
    }

    // Test resume persistence
    console.log('\n🔍 TESTING PERSISTENCE');
    console.log('-'.repeat(60));
    
    if (contactData.resume_asset_id) {
      // Verify the asset exists in assets table
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .select('*')
        .eq('asset_id', contactData.resume_asset_id)
        .single();

      if (assetError) {
        console.error('❌ Asset not found in assets table');
        console.log('   This means the resume link is broken');
      } else {
        console.log('✅ Asset verified in database');
        console.log('   Asset type:', asset.asset_type);
        console.log('   Cloudinary URL:', asset.cloudinary_url);
        console.log('   Status: PERSISTENT ✅');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    const checks = [
      { name: 'Contact section exists', status: !!contactData },
      { name: 'Resume uploaded', status: !!contactData.resume_asset_id },
      { name: 'Resume URL accessible', status: !!contactData.assets?.cloudinary_url },
      { name: 'Social links added', status: contactData.social_links?.length > 0 }
    ];

    checks.forEach(check => {
      const icon = check.status ? '✅' : '⚠️ ';
      console.log(`${icon} ${check.name}`);
    });

    if (contactData.resume_asset_id && contactData.assets) {
      console.log('\n✅ RESUME IS PERSISTENT!');
      console.log('   The resume will remain after page reload');
    } else if (contactData.resume_asset_id && !contactData.assets) {
      console.log('\n⚠️  RESUME LINK IS BROKEN!');
      console.log('   The asset_id exists but the asset is missing');
      console.log('   Please re-upload the resume');
    } else {
      console.log('\n⚠️  NO RESUME UPLOADED YET');
      console.log('   Upload a resume in Contact Management to test persistence');
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Go to Admin Panel → Contact Management');
    console.log('   2. Upload a resume file');
    console.log('   3. Click "Save Changes"');
    console.log('   4. Refresh the page');
    console.log('   5. Run this script again to verify persistence');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testContactResume();
