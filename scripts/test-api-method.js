// Test the actual API method used by the frontend
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing Actual API Method');
console.log('='.repeat(35));

// Simulate the updateCaseStudy method from services/api.ts
async function updateCaseStudy(caseStudy) {
    console.log(`\n📝 Updating case study: ${caseStudy.title}`);
    console.log(`   Setting is_published to: ${caseStudy.is_published}`);
    
    // This is the exact code from our fixed services/api.ts
    const { error: updateError } = await supabase
        .from('case_studies')
        .update({
            title: caseStudy.title,
            slug: caseStudy.slug,
            template: caseStudy.template,
            status: caseStudy.status,
            content_html: caseStudy.content,
            hero_image_asset_id: caseStudy.hero_image_asset_id,
            is_published: caseStudy.is_published ?? false,
            published_at: caseStudy.published_at,
            metadata: caseStudy.metadata,
            updated_at: new Date().toISOString()
        })
        .eq('case_study_id', caseStudy.id);
    
    if (updateError) {
        console.error('❌ Error updating case study:', updateError);
        throw updateError;
    }
    
    console.log('✅ UPDATE completed without error');
    
    // Fetch the updated case study separately
    const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('case_study_id', caseStudy.id)
        .single();
    
    if (error) {
        console.error('❌ Error fetching updated case study:', error);
        throw error;
    }
    
    console.log('✅ SELECT completed without error');
    console.log(`   Result is_published: ${data.is_published}`);
    console.log(`   Result published_at: ${data.published_at}`);
    
    return data;
}

async function testAPIMethod() {
    // Get a case study to test with
    const { data: caseStudies, error: fetchError } = await supabase
        .from('case_studies')
        .select('*')
        .limit(1);
    
    if (fetchError || !caseStudies || caseStudies.length === 0) {
        console.log('❌ No case studies found');
        return;
    }
    
    const originalCS = caseStudies[0];
    console.log(`\n📄 Original case study: "${originalCS.title}"`);
    console.log(`   Original is_published: ${originalCS.is_published}`);
    
    // Test 1: Try to unpublish
    console.log('\n🔄 Test 1: Attempting to UNPUBLISH...');
    const unpublishCS = {
        ...originalCS,
        id: originalCS.case_study_id,
        content: originalCS.content_html,
        is_published: false,
        published_at: null
    };
    
    try {
        const result1 = await updateCaseStudy(unpublishCS);
        console.log(`✅ Unpublish result: is_published = ${result1.is_published}`);
        
        if (result1.is_published === false) {
            console.log('🎉 UNPUBLISH worked!');
        } else {
            console.log('❌ UNPUBLISH failed - value did not change');
        }
    } catch (error) {
        console.log('❌ UNPUBLISH threw error:', error.message);
    }
    
    // Test 2: Try to publish
    console.log('\n🔄 Test 2: Attempting to PUBLISH...');
    const publishCS = {
        ...originalCS,
        id: originalCS.case_study_id,
        content: originalCS.content_html,
        is_published: true,
        published_at: new Date().toISOString()
    };
    
    try {
        const result2 = await updateCaseStudy(publishCS);
        console.log(`✅ Publish result: is_published = ${result2.is_published}`);
        
        if (result2.is_published === true) {
            console.log('🎉 PUBLISH worked!');
        } else {
            console.log('❌ PUBLISH failed - value did not change');
        }
    } catch (error) {
        console.log('❌ PUBLISH threw error:', error.message);
    }
    
    // Test 3: Try minimal update with just is_published
    console.log('\n🔄 Test 3: Minimal update (is_published only)...');
    
    const { error: minimalError } = await supabase
        .from('case_studies')
        .update({ is_published: false })
        .eq('case_study_id', originalCS.case_study_id);
    
    if (minimalError) {
        console.log('❌ Minimal update error:', minimalError.message);
    } else {
        console.log('✅ Minimal update succeeded');
        
        const { data: checkResult } = await supabase
            .from('case_studies')
            .select('is_published')
            .eq('case_study_id', originalCS.case_study_id)
            .single();
        
        console.log(`   Result: is_published = ${checkResult.is_published}`);
    }
}

testAPIMethod().catch(console.error);