// Test the exact API methods that should populate youremailgf's sections
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing API Methods for "youremailgf"');
console.log('='.repeat(45));

async function testYouremailgfAPIMethods() {
    const orgId = 'default-org'; // youremailgf's org
    
    console.log('\n1️⃣  Testing getPublicProjects (Magical Projects)...');
    
    // This should return empty array (we know there are no case studies)
    const { data: projects, error: projectsError } = await supabase
        .from('case_studies')
        .select(`
            case_study_id,
            title,
            slug,
            hero_image_asset_id,
            is_published,
            status,
            created_at,
            updated_at
        `)
        .eq('org_id', orgId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
    
    if (projectsError) {
        console.log('❌ Projects query failed:', projectsError.message);
    } else {
        console.log(`✅ Projects query succeeded: ${projects.length} projects`);
        console.log('   Expected: 0 projects (explains blank Magical Projects)');
    }
    
    console.log('\n2️⃣  Testing getPublicMyJourney (My Journey)...');
    
    // This should return the most recent timeline with milestones
    const { data: journey, error: journeyError } = await supabase
        .from('journey_timelines')
        .select(`
            timeline_id,
            title,
            subtitle,
            journey_milestones (
                milestone_id,
                title,
                company,
                period,
                description,
                is_active,
                order_key
            )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (journeyError) {
        console.log('❌ Journey query failed:', journeyError.message);
        console.log('   This explains why My Journey is blank!');
    } else if (!journey) {
        console.log('❌ No journey data returned');
    } else {
        console.log(`✅ Journey query succeeded: "${journey.title}"`);
        console.log(`   Subtitle: ${journey.subtitle}`);
        console.log(`   Milestones: ${journey.journey_milestones?.length || 0}`);
        
        if (journey.journey_milestones && journey.journey_milestones.length > 0) {
            console.log('   Milestone details:');
            journey.journey_milestones.forEach((milestone, index) => {
                console.log(`     ${index + 1}. "${milestone.title}" at ${milestone.company}`);
                console.log(`        - Active: ${milestone.is_active}`);
                console.log(`        - Period: ${milestone.period}`);
            });
            console.log('   ✅ This data should show in My Journey section!');
        } else {
            console.log('   ⚠️  No milestones in this timeline');
        }
    }
    
    console.log('\n3️⃣  Testing getPublicMyStory (My Story)...');
    
    // This should return the story section
    const { data: story, error: storyError } = await supabase
        .from('story_sections')
        .select(`
            story_id,
            title,
            subtitle,
            image_asset_id,
            image_alt,
            story_paragraphs (
                paragraph_id,
                content,
                order_key
            )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (storyError) {
        console.log('❌ Story query failed:', storyError.message);
    } else if (!story) {
        console.log('❌ No story data returned');
    } else {
        console.log(`✅ Story query succeeded: "${story.title}"`);
        console.log(`   Subtitle: ${story.subtitle}`);
        console.log(`   Paragraphs: ${story.story_paragraphs?.length || 0}`);
        console.log(`   Image: ${story.image_asset_id || 'None'}`);
        
        if (story.story_paragraphs && story.story_paragraphs.length > 0) {
            console.log('   ✅ This data should show in My Story section!');
        }
    }
    
    console.log('\n4️⃣  Simulating complete getPublicPortfolioByUsername call...');
    
    try {
        // Get profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('username', 'youremailgf')
            .eq('is_portfolio_public', true)
            .single();
        
        if (!profile) {
            console.log('❌ Profile not found');
            return;
        }
        
        console.log(`✅ Profile: ${profile.name} (${profile.org_id})`);
        
        // Simulate the parallel API calls that getPublicPortfolioByUsername makes
        const [projectsResult, storyResult, journeyResult] = await Promise.all([
            supabase
                .from('case_studies')
                .select('case_study_id, title, slug, hero_image_asset_id, is_published, status, created_at, updated_at')
                .eq('org_id', profile.org_id)
                .eq('is_published', true)
                .order('created_at', { ascending: false }),
            
            supabase
                .from('story_sections')
                .select(`
                    story_id, title, subtitle, image_asset_id, image_alt,
                    story_paragraphs (paragraph_id, content, order_key)
                `)
                .eq('org_id', profile.org_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),
            
            supabase
                .from('journey_timelines')
                .select(`
                    timeline_id, title, subtitle,
                    journey_milestones (milestone_id, title, company, period, description, is_active, order_key)
                `)
                .eq('org_id', profile.org_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
        ]);
        
        console.log('\n📊 Parallel API Results:');
        console.log(`   Projects: ${projectsResult.data?.length || 0} (${projectsResult.error ? 'ERROR: ' + projectsResult.error.message : 'OK'})`);
        console.log(`   Story: ${storyResult.data ? 'Found' : 'Not found'} (${storyResult.error ? 'ERROR: ' + storyResult.error.message : 'OK'})`);
        console.log(`   Journey: ${journeyResult.data ? 'Found' : 'Not found'} (${journeyResult.error ? 'ERROR: ' + journeyResult.error.message : 'OK'})`);
        
        // Check what the transformed data would look like
        const transformedData = {
            profile: profile,
            projects: projectsResult.data || [],
            story: storyResult.data,
            journey: journeyResult.data
        };
        
        console.log('\n📋 Transformed Data Summary:');
        console.log(`   Profile: ${transformedData.profile.name}`);
        console.log(`   Projects: ${transformedData.projects.length} (should show in Magical Projects)`);
        console.log(`   Story: ${transformedData.story ? 'Available' : 'Missing'} (should show in My Story)`);
        console.log(`   Journey: ${transformedData.journey ? 'Available' : 'Missing'} (should show in My Journey)`);
        
        if (transformedData.journey) {
            console.log(`   Journey milestones: ${transformedData.journey.journey_milestones?.length || 0}`);
        }
        
    } catch (error) {
        console.log('❌ Complete API simulation failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(45));
    console.log('🎯 CONCLUSION');
    console.log('='.repeat(45));
    
    console.log('\n✅ WHAT SHOULD WORK:');
    console.log('   - My Story section (has data)');
    console.log('   - My Journey section (has data)');
    
    console.log('\n❌ WHAT WILL NOT WORK:');
    console.log('   - Magical Projects section (no case studies)');
    
    console.log('\n🔍 IF SECTIONS ARE STILL BLANK:');
    console.log('   The issue is in frontend rendering, not backend data');
    console.log('   Check browser console for JavaScript errors');
    console.log('   Check if React components are handling the data correctly');
}

testYouremailgfAPIMethods().catch(console.error);