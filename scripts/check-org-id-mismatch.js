// Check org_id mismatch between profile and case studies
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrgIdMismatch() {
    console.log('🔍 Checking Org ID Mismatch\n');
    console.log('='.repeat(70));
    
    // Get profile org_id
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id, username, email')
        .eq('is_portfolio_public', true)
        .limit(1)
        .single();
    
    console.log('\n📋 Public Profile:');
    console.log(`   Username: ${profile?.username}`);
    console.log(`   Email: ${profile?.email}`);
    console.log(`   Org ID: ${profile?.org_id}`);
    
    // Get all case studies
    const { data: allCS } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, org_id');
    
    console.log(`\n📚 All Case Studies (${allCS?.length || 0}):`);
    allCS?.forEach(cs => {
        const matches = cs.org_id === profile?.org_id;
        console.log(`\n   ${cs.title}`);
        console.log(`     Org ID: ${cs.org_id}`);
        console.log(`     Published: ${cs.is_published}`);
        console.log(`     Matches profile: ${matches ? '✅' : '❌'}`);
    });
    
    const mismatchedCS = allCS?.filter(cs => cs.org_id !== profile?.org_id);
    
    if (mismatchedCS && mismatchedCS.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('❌ PROBLEM FOUND: Org ID Mismatch!');
        console.log('='.repeat(70));
        console.log(`\n${mismatchedCS.length} case study(ies) have wrong org_id:`);
        mismatchedCS.forEach(cs => {
            console.log(`  - ${cs.title}: "${cs.org_id}" (should be "${profile?.org_id}")`);
        });
        
        console.log('\n🔧 SOLUTION:');
        console.log('   Run this SQL in Supabase SQL Editor:\n');
        console.log('   UPDATE case_studies');
        console.log(`   SET org_id = '${profile?.org_id}'`);
        console.log(`   WHERE org_id != '${profile?.org_id}';`);
        console.log('\n   This will fix the org_id for all case studies.');
    } else {
        console.log('\n✅ All case studies have correct org_id!');
    }
}

checkOrgIdMismatch().catch(console.error);
