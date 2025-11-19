// Test the publish/unpublish functionality specifically
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing Case Study Publish/Unpublish Function\n');
console.log('='.repeat(70));

async function testPublishFunction() {
    console.log('\n1️⃣  Finding a case study to test with...\n');
    
    const { data: caseStudies, error: csError } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, org_id')
        .limit(5);
    
    if (csError) {
        console.log('❌ Error fetching case studies:', csError.message);
        return;
    }
    
    if (!caseStudies || caseStudies.length === 0) {
        console.log('⚠️  No case studies found to test with');
        return;
    }
    
    const testCaseStudy = caseStudies[0];
    console.log(`✅ Testing with: ${testCaseStudy.title}`);
    console.log(`   ID: ${testCaseStudy.case_study_id}`);
    console.log(`   Current status: ${testCaseStudy.is_published ? 'Published' : 'Draft'}`);
    console.log(`   Org ID: ${testCaseStudy.org_id}`);
    
    console.log('\n2️⃣  Testing UPDATE operation on case_studies table...\n');
    
    // Test if we can update the is_published field
    const newPublishedState = !testCaseStudy.is_published;
    const updateData = {
        is_published: newPublishedState,
        published_at: newPublishedState ? new Date().toISOString() : testCaseStudy.published_at,
        updated_at: new Date().toISOString()
    };
    
    console.log(`Attempting to ${newPublishedState ? 'PUBLISH' : 'UNPUBLISH'}...`);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const { data: updateResult, error: updateError } = await supabase
        .from('case_studies')
        .update(updateData)
        .eq('case_study_id', testCaseStudy.case_study_id)
        .select();
    
    if (updateError) {
        console.log('❌ UPDATE FAILED:', updateError.message);
        console.log('   Code:', updateError.code);
        console.log('   Details:', updateError.details);
        console.log('   Hint:', updateError.hint);
        
        if (updateError.message.includes('row-level security')) {
            console.log('\n🔍 RLS POLICY ANALYSIS:');
            console.log('   The UPDATE is being blocked by RLS policy on case_studies table');
            console.log('   Possible causes:');
            console.log('   1. Missing UPDATE policy for authenticated users');
            console.log('   2. Policy condition not matching your data');
            console.log('   3. org_id mismatch between user and case study');
        }
        
        return;
    }
    
    if (!updateResult || updateResult.length === 0) {
        console.log('⚠️  UPDATE succeeded but no data returned');
        return;
    }
    
    console.log('✅ UPDATE SUCCESSFUL!');
    console.log(`   New status: ${updateResult[0].is_published ? 'Published' : 'Draft'}`);
    console.log(`   Published at: ${updateResult[0].published_at}`);
    
    console.log('\n3️⃣  Testing reverse operation...\n');
    
    // Test the reverse operation
    const reverseState = !newPublishedState;
    const reverseData = {
        is_published: reverseState,
        published_at: reverseState ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
    };
    
    console.log(`Attempting to ${reverseState ? 'PUBLISH' : 'UNPUBLISH'} (reverse)...`);
    
    const { data: reverseResult, error: reverseError } = await supabase
        .from('case_studies')
        .update(reverseData)
        .eq('case_study_id', testCaseStudy.case_study_id)
        .select();
    
    if (reverseError) {
        console.log('❌ REVERSE UPDATE FAILED:', reverseError.message);
    } else {
        console.log('✅ REVERSE UPDATE SUCCESSFUL!');
        console.log(`   Final status: ${reverseResult[0].is_published ? 'Published' : 'Draft'}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 PUBLISH/UNPUBLISH TEST SUMMARY\n');
    
    if (!updateError && !reverseError) {
        console.log('🎉 PUBLISH/UNPUBLISH FUNCTIONALITY WORKS!');
        console.log('✅ Can toggle is_published field');
        console.log('✅ Can set published_at timestamp');
        console.log('✅ No RLS blocking UPDATE operations');
        console.log('\n💡 If it\'s not working in the UI:');
        console.log('   1. Check browser console for JavaScript errors');
        console.log('   2. Check network tab for failed requests');
        console.log('   3. Verify the UI is calling the right API method');
    } else {
        console.log('❌ PUBLISH/UNPUBLISH HAS ISSUES');
        if (updateError) {
            console.log(`   - UPDATE blocked: ${updateError.message}`);
        }
        if (reverseError) {
            console.log(`   - REVERSE UPDATE blocked: ${reverseError.message}`);
        }
        console.log('\n🔧 SOLUTION: Fix RLS policies on case_studies table');
    }
}

testPublishFunction().catch(console.error);