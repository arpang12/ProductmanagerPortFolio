// Quick verification that the publish/unpublish fix is working
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Verifying Publish/Unpublish Fix');
console.log('='.repeat(50));

async function verifyFix() {
    // Get a case study to test with
    const { data: caseStudies, error: fetchError } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published')
        .limit(1);
    
    if (fetchError || !caseStudies || caseStudies.length === 0) {
        console.log('❌ No case studies found');
        return;
    }
    
    const testCS = caseStudies[0];
    console.log(`\n📄 Testing with: "${testCS.title}"`);
    console.log(`   Current status: ${testCS.is_published ? 'Published' : 'Draft'}`);
    
    // Test the fixed approach
    const newStatus = !testCS.is_published;
    console.log(`\n🔄 ${newStatus ? 'Publishing' : 'Unpublishing'}...`);
    
    // Step 1: UPDATE (the fixed way)
    const { error: updateError } = await supabase
        .from('case_studies')
        .update({
            is_published: newStatus,
            published_at: newStatus ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        })
        .eq('case_study_id', testCS.case_study_id);
    
    if (updateError) {
        console.log('❌ UPDATE failed:', updateError.message);
        return;
    }
    
    console.log('✅ UPDATE succeeded');
    
    // Step 2: SELECT (separate query)
    const { data: updatedCS, error: selectError } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, published_at')
        .eq('case_study_id', testCS.case_study_id)
        .single();
    
    if (selectError) {
        console.log('❌ SELECT failed:', selectError.message);
        return;
    }
    
    console.log('✅ SELECT succeeded');
    console.log(`   New status: ${updatedCS.is_published ? 'Published' : 'Draft'}`);
    console.log(`   Published at: ${updatedCS.published_at || 'null'}`);
    
    // Verify the change worked
    if (updatedCS.is_published === newStatus) {
        console.log('\n🎉 SUCCESS: Publish/Unpublish fix is working!');
        console.log('\n📋 Manual Testing Steps:');
        console.log('1. Go to http://localhost:3002/admin');
        console.log('2. Click "Case Studies" section');
        console.log('3. Open a case study editor');
        console.log('4. Look for publish/unpublish button');
        console.log('5. Click it and verify it toggles correctly');
        console.log('6. Check public portfolio to see changes');
        
        // Restore original state
        console.log('\n🔄 Restoring original state...');
        await supabase
            .from('case_studies')
            .update({
                is_published: testCS.is_published,
                published_at: testCS.is_published ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            })
            .eq('case_study_id', testCS.case_study_id);
        console.log('✅ Original state restored');
        
    } else {
        console.log('❌ Status change failed');
    }
}

verifyFix().catch(console.error);