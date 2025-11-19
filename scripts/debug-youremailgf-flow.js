// Debug the exact flow for youremailgf username
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const username = 'youremailgf';

console.log(`🔍 Debugging Flow for: ${username}\n`);
console.log('='.repeat(80));

async function debugFlow() {
    console.log('\n1️⃣  Step 1: getPublicPortfolioByUsername()...\n');
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .eq('is_portfolio_public', true)
        .single();
    
    if (profileError || !profile) {
        console.log('❌ Profile not found or not public');
        return;
    }
    
    console.log(`✅ Profile: ${profile.username}`);
    console.log(`   Org ID: ${profile.org_id}`);
    console.log(`   Public: ${profile.is_portfolio_public}`);
    
    const orgId = profile.org_id;
    
    console.log('\n2️⃣  Step 2: Fetching all sections in parallel...\n');
    
    // Test each public method individually
    console.log('Testing getPublicMyStory()...');
    const { data: storyData, error: storyError } = await supabase
        .from('story_sections')
        .select('story_id, title, subtitle, image_alt, asset_id')
        .eq('org_id', orgId)
        .limit(1)
        .single();
    
    if (storyError) {
        console.log(`   ❌ Story ERROR: ${storyError.message}`);
    } else if (!storyData) {
        console.log(`   ⚠️  Story: No data`);
    } else {
        console.log(`   ✅ Story: ${storyData.title}`);
        
        // Test paragraphs
        const { data: paragraphs } = await supabase
            .from('story_paragraphs')
            .select('paragraph_id, content, display_order')
            .eq('story_id', storyData.story_id)
            .order('display_order');
        
        console.log(`      Paragraphs: ${paragraphs?.length || 0}`);
    }
    
    console.log('\nTesting getPublicMagicToolbox()...');
    const { data: categoriesData, error: categoriesError } = await supabase
        .from('skill_categories')
        .select(`
            category_id,
            title,
            icon,
            icon_url,
            color,
            display_order,
            skills (
                skill_id,
                name,
                level
            )
        `)
        .eq('org_id', orgId)
        .order('display_order');
    
    if (categoriesError) {
        console.log(`   ❌ Toolbox ERROR: ${categoriesError.message}`);
    } else if (!categoriesData || categoriesData.length === 0) {
        console.log(`   ⚠️  Toolbox: No data`);
    } else {
        console.log(`   ✅ Toolbox: ${categoriesData.length} categories`);
        categoriesData.forEach(cat => {
            console.log(`      - ${cat.title}: ${cat.skills?.length || 0} skills`);
        });
    }
    
    console.log('\nTesting getPublicMyJourney()...');
    const { data: journeyData, error: journeyError } = await supabase
        .from('journey_timelines')
        .select(`
            *,
            journey_milestones (
                milestone_id,
                title,
                company,
                period,
                description,
                is_active,
                display_order
            )
        `)
        .eq('org_id', orgId)
        .limit(1)
        .single();
    
    if (journeyError) {
        console.log(`   ❌ Journey ERROR: ${journeyError.message}`);
    } else if (!journeyData) {
        console.log(`   ⚠️  Journey: No data`);
    } else {
        console.log(`   ✅ Journey: ${journeyData.title}`);
        console.log(`      Milestones: ${journeyData.journey_milestones?.length || 0}`);
    }
    
    console.log('\nTesting getPublicContactSection()...');
    const { data: contactData, error: contactError } = await supabase
        .from('contact_sections')
        .select(`
            *,
            social_links (
                link_id,
                name,
                url,
                icon,
                color,
                display_order
            )
        `)
        .eq('org_id', orgId)
        .limit(1)
        .single();
    
    if (contactError) {
        console.log(`   ❌ Contact ERROR: ${contactError.message}`);
    } else if (!contactData) {
        console.log(`   ⚠️  Contact: No data`);
    } else {
        console.log(`   ✅ Contact: ${contactData.title}`);
        console.log(`      Social links: ${contactData.social_links?.length || 0}`);
    }
    
    console.log('\nTesting getPublicCVSection()...');
    const { data: cvData, error: cvError } = await supabase
        .from('cv_sections')
        .select(`
            *,
            cv_versions (
                cv_version_id,
                name,
                type,
                is_active,
                display_order
            )
        `)
        .eq('org_id', orgId)
        .limit(1)
        .single();
    
    if (cvError) {
        console.log(`   ❌ CV ERROR: ${cvError.message}`);
    } else if (!cvData) {
        console.log(`   ⚠️  CV: No data`);
    } else {
        console.log(`   ✅ CV: ${cvData.title}`);
        console.log(`      Versions: ${cvData.cv_versions?.length || 0}`);
    }
    
    console.log('\nTesting getPublicProjects()...');
    const { data: projectsData, error: projectsError } = await supabase
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
        .eq('org_id', orgId)
        .eq('is_published', true);
    
    if (projectsError) {
        console.log(`   ❌ Projects ERROR: ${projectsError.message}`);
    } else if (!projectsData || projectsData.length === 0) {
        console.log(`   ⚠️  Projects: No data`);
    } else {
        console.log(`   ✅ Projects: ${projectsData.length} case studies`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY\n');
    
    const results = {
        story: !storyError && storyData,
        toolbox: !categoriesError && categoriesData && categoriesData.length > 0,
        journey: !journeyError && journeyData,
        contact: !contactError && contactData,
        cv: !cvError && cvData,
        projects: !projectsError && projectsData && projectsData.length > 0
    };
    
    console.log('Data availability:');
    Object.entries(results).forEach(([section, hasData]) => {
        console.log(`   ${hasData ? '✅' : '❌'} ${section}`);
    });
    
    const workingSections = Object.values(results).filter(Boolean).length;
    const totalSections = Object.keys(results).length;
    
    console.log(`\n📈 Success rate: ${workingSections}/${totalSections} sections`);
    
    if (workingSections === totalSections) {
        console.log('\n🎉 ALL SECTIONS SHOULD WORK!');
        console.log('   If still showing "Loading...", check:');
        console.log('   1. Browser console for errors');
        console.log('   2. Network tab for failed requests');
        console.log('   3. Clear browser cache');
    } else {
        console.log('\n⚠️  SOME SECTIONS MISSING DATA');
        console.log('   These will show "Loading..." spinners');
        console.log('   Add content via admin panel for missing sections');
    }
}

debugFlow().catch(console.error);