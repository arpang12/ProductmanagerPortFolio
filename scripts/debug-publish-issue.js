// Debug why the publish status isn't changing
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debugging Publish Issue');
console.log('='.repeat(40));

async function debugPublishIssue() {
    // Get case study details
    const { data: caseStudies, error: fetchError } = await supabase
        .from('case_studies')
        .select('*')
        .limit(1);
    
    if (fetchError || !caseStudies || caseStudies.length === 0) {
        console.log('❌ No case studies found');
        return;
    }
    
    const testCS = caseStudies[0];
    console.log(`\n📄 Case Study: "${testCS.title}"`);
    console.log(`   ID: ${testCS.case_study_id}`);
    console.log(`   Current is_published: ${testCS.is_published}`);
    console.log(`   Current published_at: ${testCS.published_at}`);
    console.log(`   Org ID: ${testCS.org_id}`);
    
    // Test UPDATE with explicit values
    console.log('\n🔄 Testing UPDATE with explicit false...');
    
    const { data: updateResult, error: updateError } = await supabase
        .from('case_studies')
        .update({
            is_published: false,
            published_at: null,
            updated_at: new Date().toISOString()
        })
        .eq('case_study_id', testCS.case_study_id);
    
    console.log('Update result:', updateResult);
    console.log('Update error:', updateError);
    
    // Check if it actually changed
    const { data: afterUpdate, error: selectError } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, published_at, updated_at')
        .eq('case_study_id', testCS.case_study_id)
        .single();
    
    console.log('\n📊 After UPDATE:');
    console.log(`   is_published: ${afterUpdate.is_published}`);
    console.log(`   published_at: ${afterUpdate.published_at}`);
    console.log(`   updated_at: ${afterUpdate.updated_at}`);
    
    // Test with true
    console.log('\n🔄 Testing UPDATE with explicit true...');
    
    const { error: updateError2 } = await supabase
        .from('case_studies')
        .update({
            is_published: true,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('case_study_id', testCS.case_study_id);
    
    console.log('Update error 2:', updateError2);
    
    const { data: afterUpdate2, error: selectError2 } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, published_at, updated_at')
        .eq('case_study_id', testCS.case_study_id)
        .single();
    
    console.log('\n📊 After second UPDATE:');
    console.log(`   is_published: ${afterUpdate2.is_published}`);
    console.log(`   published_at: ${afterUpdate2.published_at}`);
    console.log(`   updated_at: ${afterUpdate2.updated_at}`);
    
    // Check RLS policies
    console.log('\n🔒 Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
        .rpc('get_policies', { table_name: 'case_studies' })
        .single();
    
    if (policyError) {
        console.log('Could not fetch policies:', policyError.message);
    } else {
        console.log('RLS policies exist for case_studies table');
    }
}

debugPublishIssue().catch(console.error);