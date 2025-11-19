// Check RLS policies on case_studies table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔒 Checking RLS Policies on case_studies');
console.log('='.repeat(45));

async function checkRLSPolicies() {
    // Query the pg_policies view to see RLS policies
    const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'case_studies');
    
    if (policyError) {
        console.log('❌ Error fetching policies:', policyError.message);
        
        // Try alternative approach - check if RLS is enabled
        const { data: tables, error: tableError } = await supabase
            .rpc('check_rls_status');
        
        if (tableError) {
            console.log('❌ Could not check RLS status:', tableError.message);
        }
        return;
    }
    
    console.log(`\n📋 Found ${policies.length} RLS policies:\n`);
    
    policies.forEach((policy, index) => {
        console.log(`${index + 1}. Policy: ${policy.policyname}`);
        console.log(`   Command: ${policy.cmd}`);
        console.log(`   Permissive: ${policy.permissive}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log(`   Qual: ${policy.qual}`);
        console.log(`   With Check: ${policy.with_check}`);
        console.log('');
    });
    
    // Test if we can update other fields
    console.log('🧪 Testing UPDATE on other fields...');
    
    const { data: testCS } = await supabase
        .from('case_studies')
        .select('case_study_id, title, updated_at')
        .limit(1)
        .single();
    
    if (testCS) {
        const { error: titleUpdateError } = await supabase
            .from('case_studies')
            .update({
                updated_at: new Date().toISOString()
            })
            .eq('case_study_id', testCS.case_study_id);
        
        if (titleUpdateError) {
            console.log('❌ Cannot update updated_at:', titleUpdateError.message);
        } else {
            console.log('✅ Can update updated_at field');
        }
        
        // Test updating is_published specifically
        const { error: publishUpdateError } = await supabase
            .from('case_studies')
            .update({
                is_published: false
            })
            .eq('case_study_id', testCS.case_study_id);
        
        if (publishUpdateError) {
            console.log('❌ Cannot update is_published:', publishUpdateError.message);
        } else {
            console.log('✅ Can update is_published field (but value might not change)');
        }
    }
}

checkRLSPolicies().catch(console.error);