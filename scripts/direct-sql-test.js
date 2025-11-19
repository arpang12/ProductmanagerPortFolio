// Test direct SQL to see if we can update is_published
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 Direct SQL Test for is_published');
console.log('='.repeat(40));

async function directSQLTest() {
    // Get case study info
    const { data: caseStudy } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, status')
        .limit(1)
        .single();
    
    if (!caseStudy) {
        console.log('❌ No case study found');
        return;
    }
    
    console.log(`\n📄 Case Study: "${caseStudy.title}"`);
    console.log(`   ID: ${caseStudy.case_study_id}`);
    console.log(`   Current is_published: ${caseStudy.is_published}`);
    console.log(`   Current status: ${caseStudy.status}`);
    
    // Test 1: Try to set is_published to false using raw SQL
    console.log('\n🔧 Test 1: Raw SQL UPDATE to false...');
    
    const { data: sqlResult1, error: sqlError1 } = await supabase
        .rpc('execute_sql', {
            query: `UPDATE case_studies SET is_published = false WHERE case_study_id = $1 RETURNING is_published`,
            params: [caseStudy.case_study_id]
        });
    
    if (sqlError1) {
        console.log('❌ Raw SQL failed:', sqlError1.message);
    } else {
        console.log('✅ Raw SQL succeeded:', sqlResult1);
    }
    
    // Test 2: Check current value after raw SQL
    const { data: afterSQL } = await supabase
        .from('case_studies')
        .select('is_published')
        .eq('case_study_id', caseStudy.case_study_id)
        .single();
    
    console.log(`   After raw SQL: is_published = ${afterSQL.is_published}`);
    
    // Test 3: Try using different approach - set to NULL first, then false
    console.log('\n🔧 Test 2: Set to NULL first...');
    
    const { error: nullError } = await supabase
        .from('case_studies')
        .update({ is_published: null })
        .eq('case_study_id', caseStudy.case_study_id);
    
    if (nullError) {
        console.log('❌ Set to NULL failed:', nullError.message);
    } else {
        console.log('✅ Set to NULL succeeded');
        
        const { data: afterNull } = await supabase
            .from('case_studies')
            .select('is_published')
            .eq('case_study_id', caseStudy.case_study_id)
            .single();
        
        console.log(`   After NULL: is_published = ${afterNull.is_published}`);
        
        // Now try to set to false
        const { error: falseError } = await supabase
            .from('case_studies')
            .update({ is_published: false })
            .eq('case_study_id', caseStudy.case_study_id);
        
        if (falseError) {
            console.log('❌ Set to false after NULL failed:', falseError.message);
        } else {
            console.log('✅ Set to false after NULL succeeded');
            
            const { data: afterFalse } = await supabase
                .from('case_studies')
                .select('is_published')
                .eq('case_study_id', caseStudy.case_study_id)
                .single();
            
            console.log(`   Final result: is_published = ${afterFalse.is_published}`);
        }
    }
    
    // Test 4: Check if there are any triggers
    console.log('\n🔧 Test 3: Check for database triggers...');
    
    const { data: triggers, error: triggerError } = await supabase
        .rpc('get_table_triggers', { table_name: 'case_studies' });
    
    if (triggerError) {
        console.log('❌ Could not check triggers:', triggerError.message);
    } else {
        console.log('✅ Triggers check:', triggers);
    }
}

directSQLTest().catch(console.error);