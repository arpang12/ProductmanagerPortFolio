// Diagnose why admin dashboard data doesn't flow to public portfolio
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Diagnosing Data Flow Inconsistency');
console.log('Admin Dashboard → Public Portfolio Data Flow');
console.log('='.repeat(60));

async function diagnoseDataFlowInconsistency() {
    console.log('\n1️⃣  Checking youremailgf profile and org mapping...');
    
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'youremailgf')
        .single();
    
    if (profileError || !profile) {
        console.log('❌ Profile not found:', profileError?.message);
        return;
    }
    
    console.log('✅ Profile found:');
    console.log(`   Username: ${profile.username}`);
    console.log(`   Name: ${profile.name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Org ID: ${profile.org_id}`);
    console.log(`   Public Portfolio: ${profile.is_portfolio_public}`);
    
    const orgId = profile.org_id;
    
    console.log('\n2️⃣  Testing AUTHENTICATED vs ANONYMOUS data access...');
    
    // Test 1: Case Studies
    console.log('\n📁 CASE STUDIES:');
    
    const { data: allCaseStudies, error: allCsError } = await supabase
        .from('case_studies')
        .select('*')
        .eq('org_id', orgId);
    
    console.log(`   Total case studies in org "${orgId}": ${allCaseStudies?.length || 0}`);
    
    if (allCaseStudies && allCaseStudies.length > 0) {
        allCaseStudies.forEach((cs, index) => {
            console.log(`   ${index + 1}. "${cs.title}"`);
            console.log(`      - Published: ${cs.is_published}`);
            console.log(`      - Status: ${cs.status}`);
            console.log(`      - Created: ${cs.created_at}`);
        });
        
        const publishedCount = allCaseStudies.filter(cs => cs.is_published).length;
        console.log(`   📊 Published: ${publishedCount}/${allCaseStudies.length}`);
        
        if (publishedCount === 0) {
            console.log('   🚨 NO PUBLISHED CASE STUDIES - Admin needs to publish them!');
        }
    } else {
        console.log('   🚨 NO CASE STUDIES FOUND - Admin needs to create them!');
    }
    
    // Test 2: Journey Timeline
    console.log('\n🛤️  JOURNEY TIMELINE:');
    
    const { data: journeyTimelines, error: journeyError } = await supabase
        .from('journey_timelines')
        .select(`
            timeline_id,
            title,
            subtitle,
            created_at,
            journey_milestones (
                milestone_id,
                title,
                company,
                period,
                is_active,
                order_key
            )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
    
    console.log(`   Total journey timelines in org "${orgId}": ${journeyTimelines?.length || 0}`);
    
    if (journeyTimelines && journeyTimelines.length > 0) {
        journeyTimelines.forEach((timeline, index) => {
            console.log(`   ${index + 1}. "${timeline.title}"`);
            console.log(`      - Subtitle: ${timeline.subtitle || 'None'}`);
            console.log(`      - Milestones: ${timeline.journey_milestones?.length || 0}`);
            console.log(`      - Created: ${timeline.created_at}`);
            
            if (timeline.journey_milestones && timeline.journey_milestones.length > 0) {
                timeline.journey_milestones.forEach((milestone, mIndex) => {
                    console.log(`        ${mIndex + 1}. "${milestone.title}" at ${milestone.company}`);
                    console.log(`           - Active: ${milestone.is_active}`);
                });
            }
        });
        
        // Test which timeline would be selected by getPublicMyJourney
        const latestTimeline = journeyTimelines[0]; // Most recent
        console.log(`   📌 Latest timeline (used by public): "${latestTimeline.title}"`);
        console.log(`      - Milestones: ${latestTimeline.journey_milestones?.length || 0}`);
        
        if (!latestTimeline.journey_milestones || latestTimeline.journey_milestones.length === 0) {
            console.log('   🚨 LATEST TIMELINE HAS NO MILESTONES - This explains blank My Journey!');
        }
    } else {
        console.log('   🚨 NO JOURNEY TIMELINES FOUND - Admin needs to create them!');
    }
    
    // Test 3: Story Section
    console.log('\n📖 MY STORY:');
    
    const { data: storySection, error: storyError } = await supabase
        .from('story_sections')
        .select(`
            story_id,
            title,
            subtitle,
            created_at,
            story_paragraphs (
                paragraph_id,
                content,
                order_key
            )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
    
    console.log(`   Total story sections in org "${orgId}": ${storySection?.length || 0}`);
    
    if (storySection && storySection.length > 0) {
        const latestStory = storySection[0];
        console.log(`   📌 Latest story (used by public): "${latestStory.title}"`);
        console.log(`      - Subtitle: ${latestStory.subtitle || 'None'}`);
        console.log(`      - Paragraphs: ${latestStory.story_paragraphs?.length || 0}`);
        console.log(`      - Created: ${latestStory.created_at}`);
        
        if (!latestStory.story_paragraphs || latestStory.story_paragraphs.length === 0) {
            console.log('   🚨 LATEST STORY HAS NO PARAGRAPHS - This explains blank My Story!');
        }
    } else {
        console.log('   🚨 NO STORY SECTIONS FOUND - Admin needs to create them!');
    }
    
    // Test 4: Magic Toolbox
    console.log('\n🧰 MAGIC TOOLBOX:');
    
    const { data: skillCategories, error: skillError } = await supabase
        .from('skill_categories')
        .select(`
            category_id,
            title,
            icon,
            color,
            skills (
                skill_id,
                name,
                level
            )
        `)
        .eq('org_id', orgId);
    
    const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .eq('org_id', orgId);
    
    console.log(`   Skill categories: ${skillCategories?.length || 0}`);
    console.log(`   Tools: ${tools?.length || 0}`);
    
    if (skillCategories && skillCategories.length > 0) {
        skillCategories.forEach((category, index) => {
            console.log(`   ${index + 1}. "${category.title}"`);
            console.log(`      - Skills: ${category.skills?.length || 0}`);
        });
    }
    
    console.log('\n3️⃣  Testing the complete getPublicPortfolioByUsername flow...');
    
    try {
        // Simulate the exact API call that PublicPortfolioPage makes
        const [projectsResult, storyResult, journeyResult, toolboxCategoriesResult, toolboxToolsResult] = await Promise.all([
            // Projects
            supabase
                .from('case_studies')
                .select('case_study_id, title, slug, hero_image_asset_id, is_published, status, created_at, updated_at')
                .eq('org_id', orgId)
                .eq('is_published', true)
                .order('created_at', { ascending: false }),
            
            // Story
            supabase
                .from('story_sections')
                .select(`
                    story_id, title, subtitle, image_asset_id, image_alt,
                    story_paragraphs (paragraph_id, content, order_key)
                `)
                .eq('org_id', orgId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),
            
            // Journey
            supabase
                .from('journey_timelines')
                .select(`
                    timeline_id, title, subtitle,
                    journey_milestones (milestone_id, title, company, period, description, is_active, order_key)
                `)
                .eq('org_id', orgId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),
            
            // Toolbox Categories
            supabase
                .from('skill_categories')
                .select(`
                    category_id, title, icon, color, order_key,
                    skills (skill_id, name, level, order_key)
                `)
                .eq('org_id', orgId)
                .order('order_key'),
            
            // Toolbox Tools
            supabase
                .from('tools')
                .select('tool_id, name, icon, color, order_key')
                .eq('org_id', orgId)
                .order('order_key')
        ]);
        
        console.log('\n📊 Complete API Results:');
        console.log(`   Projects: ${projectsResult.data?.length || 0} (${projectsResult.error ? 'ERROR: ' + projectsResult.error.message : 'OK'})`);
        console.log(`   Story: ${storyResult.data ? 'Found' : 'Not found'} (${storyResult.error ? 'ERROR: ' + storyResult.error.message : 'OK'})`);
        console.log(`   Journey: ${journeyResult.data ? 'Found' : 'Not found'} (${journeyResult.error ? 'ERROR: ' + journeyResult.error.message : 'OK'})`);
        console.log(`   Skill Categories: ${toolboxCategoriesResult.data?.length || 0} (${toolboxCategoriesResult.error ? 'ERROR: ' + toolboxCategoriesResult.error.message : 'OK'})`);
        console.log(`   Tools: ${toolboxToolsResult.data?.length || 0} (${toolboxToolsResult.error ? 'ERROR: ' + toolboxToolsResult.error.message : 'OK'})`);
        
        // Check what would actually be returned to the frontend
        const publicPortfolioData = {
            profile: profile,
            projects: projectsResult.data || [],
            story: storyResult.data,
            journey: journeyResult.data,
            toolbox: {
                categories: toolboxCategoriesResult.data || [],
                tools: toolboxToolsResult.data || []
            }
        };
        
        console.log('\n📋 Data that would be sent to HomePage:');
        console.log(`   Profile: ${publicPortfolioData.profile.name}`);
        console.log(`   Projects: ${publicPortfolioData.projects.length} items`);
        console.log(`   Story: ${publicPortfolioData.story ? 'Available' : 'Missing'}`);
        console.log(`   Journey: ${publicPortfolioData.journey ? 'Available' : 'Missing'}`);
        console.log(`   Toolbox Categories: ${publicPortfolioData.toolbox.categories.length} items`);
        console.log(`   Toolbox Tools: ${publicPortfolioData.toolbox.tools.length} items`);
        
    } catch (error) {
        console.log('❌ Complete API simulation failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DATA FLOW DIAGNOSIS');
    console.log('='.repeat(60));
    
    console.log('\n🔍 ROOT CAUSE ANALYSIS:');
    
    if (!allCaseStudies || allCaseStudies.length === 0) {
        console.log('❌ NO CASE STUDIES: Admin dashboard has no case studies for this org');
        console.log('   → Solution: Create case studies in admin dashboard');
    } else if (allCaseStudies.filter(cs => cs.is_published).length === 0) {
        console.log('❌ NO PUBLISHED CASE STUDIES: Case studies exist but none are published');
        console.log('   → Solution: Publish case studies in admin dashboard');
    }
    
    if (!journeyTimelines || journeyTimelines.length === 0) {
        console.log('❌ NO JOURNEY TIMELINES: Admin dashboard has no journey data for this org');
        console.log('   → Solution: Create journey timeline in admin dashboard');
    } else if (journeyTimelines[0] && (!journeyTimelines[0].journey_milestones || journeyTimelines[0].journey_milestones.length === 0)) {
        console.log('❌ NO JOURNEY MILESTONES: Latest timeline has no milestones');
        console.log('   → Solution: Add milestones to journey timeline in admin dashboard');
    }
    
    if (!storySection || storySection.length === 0) {
        console.log('❌ NO STORY SECTIONS: Admin dashboard has no story data for this org');
        console.log('   → Solution: Create story section in admin dashboard');
    } else if (storySection[0] && (!storySection[0].story_paragraphs || storySection[0].story_paragraphs.length === 0)) {
        console.log('❌ NO STORY PARAGRAPHS: Latest story has no content');
        console.log('   → Solution: Add content to story section in admin dashboard');
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Login to admin dashboard');
    console.log('2. Create/publish content for the youremailgf user');
    console.log('3. Ensure data is saved to the correct org_id');
    console.log('4. Test public portfolio again');
    
    console.log('\n🌐 WORKING ALTERNATIVE:');
    console.log('   Try: http://localhost:3002/u/admin (has published data)');
    console.log('   Current: http://localhost:3002/u/youremailgf (missing data)');
}

diagnoseDataFlowInconsistency().catch(console.error);