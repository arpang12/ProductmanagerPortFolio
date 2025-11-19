// Test the specific public methods that should populate the sections
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing Public Methods for "admin" Username');
console.log('='.repeat(55));

// Simulate the exact API methods used by getPublicPortfolioByUsername
async function testPublicMethods() {
    console.log('\n1️⃣  Getting profile for username "admin"...');
    
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'admin')
        .eq('is_portfolio_public', true)
        .limit(1)
        .single();
    
    if (profileError || !profile) {
        console.log('❌ Profile not found:', profileError?.message);
        return;
    }
    
    console.log('✅ Profile found:', profile.name);
    console.log(`   Org ID: ${profile.org_id}`);
    
    const orgId = profile.org_id;
    
    console.log('\n2️⃣  Testing getPublicProjects...');
    
    // Test case studies (Magical Projects)
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
        console.log('❌ Projects error:', projectsError.message);
    } else {
        console.log(`✅ Found ${projects.length} published projects`);
        projects.forEach((project, index) => {
            console.log(`   ${index + 1}. "${project.title}"`);
            console.log(`      - Published: ${project.is_published}`);
            console.log(`      - Status: ${project.status}`);
            console.log(`      - Hero Image: ${project.hero_image_asset_id || 'None'}`);
        });
        
        if (projects.length === 0) {
            console.log('   ⚠️  No published projects - this explains blank Magical Projects!');
        }
    }
    
    console.log('\n3️⃣  Testing getPublicMyJourney...');
    
    // Test journey timeline (My Journey)
    const { data: timeline, error: timelineError } = await supabase
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
    
    if (timelineError) {
        console.log('❌ Timeline error:', timelineError.message);
    } else if (!timeline) {
        console.log('❌ No timeline found');
    } else {
        console.log(`✅ Found timeline: "${timeline.title}"`);
        console.log(`   Subtitle: ${timeline.subtitle || 'None'}`);
        
        const milestones = timeline.journey_milestones || [];
        console.log(`   Milestones: ${milestones.length}`);
        
        milestones.forEach((milestone, index) => {
            console.log(`   ${index + 1}. "${milestone.title}" at ${milestone.company}`);
            console.log(`      - Active: ${milestone.is_active}`);
            console.log(`      - Period: ${milestone.period || 'Not set'}`);
        });
        
        if (milestones.length === 0) {
            console.log('   ⚠️  No milestones - this explains blank My Journey!');
        }
    }
    
    console.log('\n4️⃣  Testing getPublicMyStory...');
    
    // Test story section (My Story)
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
        console.log('❌ Story error:', storyError.message);
    } else if (!story) {
        console.log('❌ No story found');
    } else {
        console.log(`✅ Found story: "${story.title}"`);
        console.log(`   Subtitle: ${story.subtitle || 'None'}`);
        console.log(`   Image: ${story.image_asset_id || 'None'}`);
        
        const paragraphs = story.story_paragraphs || [];
        console.log(`   Paragraphs: ${paragraphs.length}`);
        
        if (paragraphs.length === 0) {
            console.log('   ⚠️  No paragraphs - story section might appear empty!');
        }
    }
    
    console.log('\n5️⃣  Testing complete API call simulation...');
    
    // Simulate the complete getPublicPortfolioByUsername call
    try {
        const [projectsData, storyData, timelineData] = await Promise.all([
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
                .single()
        ]);
        
        console.log('✅ Parallel API calls completed');
        console.log(`   Projects: ${projectsData.data?.length || 0} found`);
        console.log(`   Story: ${storyData.data ? 'Found' : 'Not found'}`);
        console.log(`   Timeline: ${timelineData.data ? 'Found' : 'Not found'}`);
        
        // Check for errors
        if (projectsData.error) console.log('   Projects error:', projectsData.error.message);
        if (storyData.error) console.log('   Story error:', storyData.error.message);
        if (timelineData.error) console.log('   Timeline error:', timelineData.error.message);
        
    } catch (error) {
        console.log('❌ Parallel API calls failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(55));
    console.log('📊 SUMMARY');
    console.log('='.repeat(55));
    
    console.log('\n🌐 Test these URLs in incognito mode:');
    console.log('   http://localhost:3002/u/admin');
    console.log('   http://localhost:3002/u/youremail');
    console.log('   http://localhost:3002/u/youremailgf');
    
    console.log('\n💡 If sections are still blank, the issue is likely:');
    console.log('   1. Frontend component not rendering the data correctly');
    console.log('   2. Data transformation issues in the API methods');
    console.log('   3. React state management problems');
    console.log('   4. CSS/styling hiding the content');
}

testPublicMethods().catch(console.error);