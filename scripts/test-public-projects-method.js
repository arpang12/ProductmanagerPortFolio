// Test the getPublicProjects method
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPublicProjects() {
    console.log('🔍 Testing getPublicProjects Method\n');
    console.log('='.repeat(70));
    
    // First get the org_id
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id, username')
        .eq('is_portfolio_public', true)
        .limit(1)
        .single();
    
    if (!profile) {
        console.log('❌ No public profile found');
        return;
    }
    
    console.log(`\n✅ Found public profile: ${profile.username}`);
    console.log(`   Org ID: ${profile.org_id}`);
    
    // Test the exact query from getPublicProjects
    console.log('\n1️⃣  Testing getPublicProjects query...\n');
    
    const { data, error } = await supabase
        .from('case_studies')
        .select(`
            *,
            case_study_sections!inner (
                section_id,
                section_type,
                enabled,
                content
            )
        `)
        .eq('org_id', profile.org_id)
        .eq('is_published', true);
    
    if (error) {
        console.log('❌ ERROR:', error.message);
        console.log('   Details:', error);
        return;
    }
    
    if (!data || data.length === 0) {
        console.log('⚠️  No data returned');
        
        // Check if case studies exist
        const { data: allCS } = await supabase
            .from('case_studies')
            .select('case_study_id, title, is_published, org_id')
            .eq('org_id', profile.org_id);
        
        console.log(`\nFound ${allCS?.length || 0} case studies for this org:`);
        allCS?.forEach(cs => {
            console.log(`  - ${cs.title} (${cs.is_published ? 'Published' : 'Draft'})`);
        });
        
        return;
    }
    
    console.log(`✅ Found ${data.length} case study(ies):\n`);
    
    data.forEach(cs => {
        console.log(`📄 ${cs.title}`);
        console.log(`   ID: ${cs.case_study_id}`);
        console.log(`   Published: ${cs.is_published}`);
        console.log(`   Sections: ${cs.case_study_sections?.length || 0}`);
        
        if (cs.case_study_sections && cs.case_study_sections.length > 0) {
            console.log('   Section types:');
            cs.case_study_sections.forEach(section => {
                console.log(`     - ${section.section_type} (enabled: ${section.enabled})`);
            });
        }
        console.log('');
    });
    
    console.log('='.repeat(70));
    console.log('✅ getPublicProjects query works correctly!');
    console.log('\n💡 If projects still not showing on homepage:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Clear browser cache and reload');
    console.log('   3. Check if you\'re logged in (might be using authenticated method)');
}

testPublicProjects().catch(console.error);
