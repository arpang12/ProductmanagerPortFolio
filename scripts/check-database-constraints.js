// Check for database constraints or triggers that might prevent is_published updates
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking Database Constraints and Schema');
console.log('='.repeat(50));

async function checkDatabaseConstraints() {
    // Check column definition
    console.log('\n1️⃣  Checking column definition...');
    
    const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'case_studies')
        .eq('column_name', 'is_published');
    
    if (colError) {
        console.log('❌ Could not check column:', colError.message);
    } else {
        console.log('✅ Column definition:', columns);
    }
    
    // Check constraints
    console.log('\n2️⃣  Checking table constraints...');
    
    const { data: constraints, error: constError } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name, constraint_type')
        .eq('table_name', 'case_studies');
    
    if (constError) {
        console.log('❌ Could not check constraints:', constError.message);
    } else {
        console.log('✅ Table constraints:', constraints);
    }
    
    // Try a different approach - create a test case study
    console.log('\n3️⃣  Creating test case study...');
    
    const testId = 'test-publish-' + Date.now();
    
    const { data: newCS, error: createError } = await supabase
        .from('case_studies')
        .insert({
            case_study_id: testId,
            org_id: 'arpan-portfolio',
            title: 'Test Publish Case Study',
            slug: 'test-publish-' + Date.now(),
            is_published: false,
            status: 'draft'
        })
        .select()
        .single();
    
    if (createError) {
        console.log('❌ Could not create test case study:', createError.message);
        return;
    }
    
    console.log('✅ Created test case study');
    console.log(`   Initial is_published: ${newCS.is_published}`);
    
    // Try to update the test case study
    console.log('\n4️⃣  Testing update on new case study...');
    
    const { error: updateError } = await supabase
        .from('case_studies')
        .update({ is_published: true })
        .eq('case_study_id', testId);
    
    if (updateError) {
        console.log('❌ Update failed:', updateError.message);
    } else {
        console.log('✅ Update succeeded');
        
        const { data: updatedCS } = await supabase
            .from('case_studies')
            .select('is_published')
            .eq('case_study_id', testId)
            .single();
        
        console.log(`   After update: is_published = ${updatedCS.is_published}`);
        
        // Try to set it back to false
        const { error: falseError } = await supabase
            .from('case_studies')
            .update({ is_published: false })
            .eq('case_study_id', testId);
        
        if (falseError) {
            console.log('❌ Set to false failed:', falseError.message);
        } else {
            console.log('✅ Set to false succeeded');
            
            const { data: finalCS } = await supabase
                .from('case_studies')
                .select('is_published')
                .eq('case_study_id', testId)
                .single();
            
            console.log(`   Final value: is_published = ${finalCS.is_published}`);
        }
    }
    
    // Clean up test case study
    console.log('\n5️⃣  Cleaning up test case study...');
    
    const { error: deleteError } = await supabase
        .from('case_studies')
        .delete()
        .eq('case_study_id', testId);
    
    if (deleteError) {
        console.log('❌ Could not delete test case study:', deleteError.message);
    } else {
        console.log('✅ Test case study deleted');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('='.repeat(50));
    
    if (newCS && newCS.is_published === false) {
        console.log('✅ New case studies can be created with is_published = false');
    } else {
        console.log('❌ New case studies are forced to is_published = true');
    }
}

checkDatabaseConstraints().catch(console.error);