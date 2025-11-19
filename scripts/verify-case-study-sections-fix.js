// Verify that case study sections fix worked
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Verifying Case Study Sections Fix\n');
console.log('='.repeat(60));

async function verifyFix() {
    console.log('\n1️⃣  Checking if org_id column exists...\n');
    
    const { data, error } = await supabase
        .from('case_study_sections')
        .select('*')
        .limit(1);
    
    if (error) {
        console.log('❌ Error accessing case_study_sections:', error.message);
        return;
    }
    
    if (!data || data.length === 0) {
        console.log('⚠️  No case study sections found to verify');
        return;
    }
    
    const sample = data[0];
    const columns = Object.keys(sample);
    
    console.log('📋 Current columns:');
    columns.forEach(col => {
        console.log(`   - ${col}`);
    });
    
    if (columns.includes('org_id')) {
        console.log('\n✅ org_id column EXISTS!');
        console.log(`   Sample org_id: ${sample.org_id}`);
        
        if (sample.org_id) {
            console.log('✅ org_id is populated (not NULL)');
        } else {
            console.log('❌ org_id is NULL - needs population');
        }
    } else {
        console.log('\n❌ org_id column MISSING!');
        console.log('   The migration has not been applied yet');
        return;
    }
    
    console.log('\n2️⃣  Testing RLS policies...\n');
    
    // Test if we can read sections (should work with public RLS)
    const { data: allSections, error: readError } = await supabase
        .from('case_study_sections')
        .select('section_id, case_study_id, org_id, section_type')
        .limit(5);
    
    if (readError) {
        console.log('❌ RLS still blocking read access:', readError.message);
    } else {
        console.log(`✅ Can read case study sections: ${allSections?.length || 0} found`);
        
        if (allSections && allSections.length > 0) {
            console.log('\n   Sample sections:');
            allSections.forEach(section => {
                console.log(`   - ${section.section_type} (org_id: ${section.org_id})`);
            });
        }
    }
    
    console.log('\n3️⃣  Checking org_id consistency...\n');
    
    // Check if all sections have org_id
    const { data: sectionsWithOrgId, error: countError } = await supabase
        .from('case_study_sections')
        .select('org_id')
        .not('org_id', 'is', null);
    
    const { data: allSectionsCount, error: totalError } = await supabase
        .from('case_study_sections')
        .select('section_id');
    
    if (countError || totalError) {
        console.log('⚠️  Could not check org_id consistency');
    } else {
        const withOrgId = sectionsWithOrgId?.length || 0;
        const total = allSectionsCount?.length || 0;
        
        console.log(`📊 Sections with org_id: ${withOrgId}/${total}`);
        
        if (withOrgId === total && total > 0) {
            console.log('✅ All sections have org_id populated');
        } else if (withOrgId < total) {
            console.log('❌ Some sections missing org_id');
        } else {
            console.log('⚠️  No sections found to check');
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY\n');
    
    const hasOrgIdColumn = columns.includes('org_id');
    const orgIdPopulated = sample.org_id !== null;
    const canReadSections = !readError;
    
    if (hasOrgIdColumn && orgIdPopulated && canReadSections) {
        console.log('🎉 SUCCESS! Case study sections fix is working');
        console.log('✅ org_id column exists');
        console.log('✅ org_id is populated');
        console.log('✅ RLS policies allow access');
        console.log('\n💡 You should now be able to edit case study sections');
        console.log('   Try creating or editing a case study in the admin panel');
    } else {
        console.log('❌ ISSUES DETECTED:');
        if (!hasOrgIdColumn) {
            console.log('   - org_id column missing');
        }
        if (!orgIdPopulated) {
            console.log('   - org_id not populated');
        }
        if (!canReadSections) {
            console.log('   - RLS policies blocking access');
        }
        console.log('\n🔧 SOLUTION: Run FINAL_CASE_STUDY_SECTIONS_FIX.sql');
    }
}

verifyFix().catch(console.error);