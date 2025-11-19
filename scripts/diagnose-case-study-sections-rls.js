// Diagnose case_study_sections RLS policy issue
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Use service key if available, otherwise anon key
const supabase = createClient(
    supabaseUrl, 
    supabaseServiceKey || supabaseAnonKey
);

console.log('🔍 Diagnosing case_study_sections RLS Issue\n');
console.log('='.repeat(70));

async function diagnoseRLS() {
    console.log('\n1️⃣  Checking current user and profile...\n');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        console.log('❌ No authenticated user found');
        console.log('   Make sure you are logged in to the admin panel');
        return;
    }
    
    console.log(`✅ User: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
    
    if (profileError || !profile) {
        console.log('❌ No profile found for user');
        console.log('   Error:', profileError?.message);
        return;
    }
    
    console.log(`✅ Profile: ${profile.username || 'No username'}`);
    console.log(`   Org ID: ${profile.org_id}`);
    
    console.log('\n2️⃣  Checking case_study_sections RLS policies...\n');
    
    // Check if we can read existing case_study_sections
    const { data: existingSections, error: readError } = await supabase
        .from('case_study_sections')
        .select('*')
        .limit(5);
    
    if (readError) {
        console.log('❌ Cannot read case_study_sections');
        console.log(`   Error: ${readError.message}`);
    } else {
        console.log(`✅ Can read case_study_sections: ${existingSections?.length || 0} found`);
        if (existingSections && existingSections.length > 0) {
            console.log('   Sample section:');
            const sample = existingSections[0];
            console.log(`     - Section ID: ${sample.section_id}`);
            console.log(`     - Case Study ID: ${sample.case_study_id}`);
            console.log(`     - Org ID: ${sample.org_id || 'NULL'}`);
            console.log(`     - Section Type: ${sample.section_type}`);
        }
    }
    
    console.log('\n3️⃣  Testing case_study_sections INSERT...\n');
    
    // First, check if we have any case studies to work with
    const { data: caseStudies, error: csError } = await supabase
        .from('case_studies')
        .select('case_study_id, title, org_id')
        .eq('org_id', profile.org_id)
        .limit(1);
    
    if (csError) {
        console.log('❌ Cannot read case_studies');
        console.log(`   Error: ${csError.message}`);
        return;
    }
    
    if (!caseStudies || caseStudies.length === 0) {
        console.log('⚠️  No case studies found for your org_id');
        console.log('   You need to create a case study first before adding sections');
        
        // Try to create a test case study
        console.log('\n   Creating test case study...');
        const { data: newCS, error: createCSError } = await supabase
            .from('case_studies')
            .insert({
                title: 'Test Case Study',
                org_id: profile.org_id,
                is_published: false
            })
            .select()
            .single();
        
        if (createCSError) {
            console.log('❌ Cannot create case study');
            console.log(`   Error: ${createCSError.message}`);
            return;
        }
        
        console.log('✅ Created test case study');
        caseStudies.push(newCS);
    }
    
    const testCaseStudy = caseStudies[0];
    console.log(`✅ Using case study: ${testCaseStudy.title}`);
    console.log(`   Case Study ID: ${testCaseStudy.case_study_id}`);
    console.log(`   Org ID: ${testCaseStudy.org_id}`);
    
    // Try to insert a test section
    console.log('\n   Attempting to insert test section...');
    
    const testSection = {
        case_study_id: testCaseStudy.case_study_id,
        section_type: 'hero',
        enabled: true,
        content: { title: 'Test Section', description: 'Test content' },
        org_id: profile.org_id  // Make sure org_id is included
    };
    
    console.log('   Test data:', JSON.stringify(testSection, null, 2));
    
    const { data: insertedSection, error: insertError } = await supabase
        .from('case_study_sections')
        .insert(testSection)
        .select()
        .single();
    
    if (insertError) {
        console.log('❌ INSERT FAILED');
        console.log(`   Error: ${insertError.message}`);
        console.log(`   Code: ${insertError.code}`);
        console.log(`   Details: ${insertError.details}`);
        console.log(`   Hint: ${insertError.hint}`);
        
        console.log('\n4️⃣  Analyzing RLS policy issue...\n');
        
        if (insertError.message.includes('row-level security policy')) {
            console.log('🔍 RLS Policy Analysis:');
            console.log('   The INSERT is being blocked by RLS policy');
            console.log('   Possible causes:');
            console.log('   1. Missing INSERT policy for authenticated users');
            console.log('   2. Policy condition not matching your data');
            console.log('   3. Missing org_id in the insert data');
            console.log('   4. org_id mismatch between user and case study');
            
            // Check org_id match
            if (testCaseStudy.org_id !== profile.org_id) {
                console.log('\n❌ ORG_ID MISMATCH DETECTED!');
                console.log(`   Your profile org_id: ${profile.org_id}`);
                console.log(`   Case study org_id: ${testCaseStudy.org_id}`);
                console.log('   This is likely the root cause!');
            } else {
                console.log('\n✅ Org IDs match - policy issue is elsewhere');
            }
        }
        
    } else {
        console.log('✅ INSERT SUCCESSFUL');
        console.log(`   Created section: ${insertedSection.section_id}`);
        
        // Clean up test section
        await supabase
            .from('case_study_sections')
            .delete()
            .eq('section_id', insertedSection.section_id);
        
        console.log('   (Test section cleaned up)');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 DIAGNOSIS COMPLETE\n');
}

diagnoseRLS().catch(console.error);