// Publish the jtk case study
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    console.log('💡 Using anon key instead (may have permission issues)');
}

const supabase = createClient(
    supabaseUrl, 
    supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY
);

async function publishCaseStudy() {
    console.log('🚀 Publishing jtk case study...\n');
    
    // Update the case study to published
    const { data, error } = await supabase
        .from('case_studies')
        .update({ is_published: true })
        .eq('title', 'jtk')
        .select();
    
    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }
    
    if (!data || data.length === 0) {
        console.log('⚠️  No case study found with title "jtk"');
        console.log('\n📋 Checking all case studies...');
        
        const { data: allCaseStudies } = await supabase
            .from('case_studies')
            .select('case_study_id, title, is_published');
        
        console.log('\nFound case studies:');
        allCaseStudies?.forEach(cs => {
            console.log(`  - ${cs.title} (${cs.is_published ? 'Published' : 'Draft'})`);
        });
        
        return;
    }
    
    console.log('✅ Successfully published!');
    console.log(`   Title: ${data[0].title}`);
    console.log(`   ID: ${data[0].case_study_id}`);
    console.log(`   Status: ${data[0].is_published ? 'Published ✅' : 'Draft'}`);
    console.log('\n🎉 Your case study is now visible on the public homepage!');
    console.log('   Refresh http://localhost:3002/ to see it');
}

publishCaseStudy().catch(console.error);
