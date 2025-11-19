// Fix org_id mismatch for case studies
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    console.log('💡 Using anon key (may have permission issues)');
}

const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY
);

async function fixOrgId() {
    console.log('🔧 Fixing Case Study Org ID\n');
    console.log('='.repeat(70));
    
    // Get the correct org_id from public profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id, username')
        .eq('is_portfolio_public', true)
        .limit(1)
        .single();
    
    if (!profile) {
        console.log('❌ No public profile found');
        return;
    }
    
    const correctOrgId = profile.org_id;
    console.log(`✅ Target org_id: ${correctOrgId} (from user: ${profile.username})\n`);
    
    // Update case studies
    console.log('1️⃣  Updating case_studies table...');
    const { data: updatedCS, error: csError } = await supabase
        .from('case_studies')
        .update({ org_id: correctOrgId })
        .neq('org_id', correctOrgId)
        .select('case_study_id, title');
    
    if (csError) {
        console.log('❌ Error:', csError.message);
    } else {
        console.log(`   ✅ Updated ${updatedCS?.length || 0} case study(ies)`);
        updatedCS?.forEach(cs => {
            console.log(`      - ${cs.title}`);
        });
    }
    
    // Update case_study_sections
    console.log('\n2️⃣  Updating case_study_sections table...');
    const { data: updatedSections, error: sectionsError } = await supabase
        .from('case_study_sections')
        .update({ org_id: correctOrgId })
        .neq('org_id', correctOrgId)
        .select('section_id');
    
    if (sectionsError) {
        console.log('❌ Error:', sectionsError.message);
    } else {
        console.log(`   ✅ Updated ${updatedSections?.length || 0} section(s)`);
    }
    
    // Verify
    console.log('\n3️⃣  Verifying fix...');
    const { data: allCS } = await supabase
        .from('case_studies')
        .select('case_study_id, title, org_id, is_published');
    
    const correctCS = allCS?.filter(cs => cs.org_id === correctOrgId);
    const wrongCS = allCS?.filter(cs => cs.org_id !== correctOrgId);
    
    console.log(`   ✅ Correct org_id: ${correctCS?.length || 0} case study(ies)`);
    if (wrongCS && wrongCS.length > 0) {
        console.log(`   ❌ Wrong org_id: ${wrongCS.length} case study(ies)`);
        wrongCS.forEach(cs => {
            console.log(`      - ${cs.title}: ${cs.org_id}`);
        });
    }
    
    console.log('\n' + '='.repeat(70));
    if (!wrongCS || wrongCS.length === 0) {
        console.log('✅ SUCCESS! All case studies now have correct org_id');
        console.log('🎉 Your case studies will now appear on the public homepage');
        console.log('🔄 Refresh http://localhost:3002/ to see them');
    } else {
        console.log('⚠️  Some case studies still have wrong org_id');
        console.log('💡 You may need to run FIX_CASE_STUDY_ORG_ID.sql manually');
    }
}

fixOrgId().catch(console.error);
