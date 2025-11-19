// Test the non-authenticated homepage data loading
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing Non-Authenticated Homepage');
console.log('='.repeat(50));

// Simulate getProjects() call (now requires authentication)
async function testGetProjects() {
    console.log('\n1️⃣  Testing getProjects() without authentication...');
    
    // This should fail because user is not authenticated
    try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('User authentication status:', user ? 'Authenticated' : 'Not authenticated');
        
        if (!user) {
            console.log('❌ getProjects() will return empty array (user not authenticated)');
            return [];
        }
    } catch (error) {
        console.log('❌ Authentication check failed:', error.message);
        return [];
    }
}

// Simulate getFirstPublicPortfolio() call
async function testGetFirstPublicPortfolio() {
    console.log('\n2️⃣  Testing getFirstPublicPortfolio()...');
    
    try {
        // Get first public profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('is_portfolio_public', true)
            .limit(1)
            .single();

        if (profileError || !profile) {
            console.log('❌ No public portfolios found:', profileError?.message);
            return null;
        }

        console.log('✅ Found public profile:', {
            username: profile.username,
            name: profile.name,
            org_id: profile.org_id
        });

        const orgId = profile.org_id;

        // Test fetching public data
        const [projects, story, journey, toolbox] = await Promise.all([
            supabase
                .from('case_studies')
                .select('case_study_id, title, is_published')
                .eq('org_id', orgId)
                .eq('is_published', true),
            
            supabase
                .from('story_sections')
                .select('story_id, title, subtitle')
                .eq('org_id', orgId)
                .limit(1)
                .single(),
            
            supabase
                .from('journey_timelines')
                .select('timeline_id, title, subtitle')
                .eq('org_id', orgId)
                .limit(1)
                .single(),
            
            supabase
                .from('skill_categories')
                .select('category_id, title')
                .eq('org_id', orgId)
        ]);

        console.log('📊 Public portfolio data:');
        console.log(`   Projects: ${projects.data?.length || 0} ${projects.error ? '(ERROR: ' + projects.error.message + ')' : ''}`);
        console.log(`   Story: ${story.data ? 'Found' : 'Not found'} ${story.error && story.error.code !== 'PGRST116' ? '(ERROR: ' + story.error.message + ')' : ''}`);
        console.log(`   Journey: ${journey.data ? 'Found' : 'Not found'} ${journey.error && journey.error.code !== 'PGRST116' ? '(ERROR: ' + journey.error.message + ')' : ''}`);
        console.log(`   Toolbox: ${toolbox.data?.length || 0} categories ${toolbox.error ? '(ERROR: ' + toolbox.error.message + ')' : ''}`);

        return {
            profile,
            projects: projects.data || [],
            story: story.data,
            journey: journey.data,
            toolbox: toolbox.data || []
        };
    } catch (error) {
        console.error('❌ Error in getFirstPublicPortfolio:', error);
        return null;
    }
}

async function testNonAuthenticatedHomepage() {
    const authProjects = await testGetProjects();
    const publicPortfolio = await testGetFirstPublicPortfolio();
    
    console.log('\n3️⃣  Homepage Data Flow Analysis...');
    
    if (authProjects.length === 0 && !publicPortfolio) {
        console.log('❌ ISSUE: Both authenticated and public data sources failed');
        console.log('   - getProjects() returns empty (no auth)');
        console.log('   - getFirstPublicPortfolio() returns null');
        console.log('   - Result: Empty homepage for non-authenticated users');
    } else if (authProjects.length === 0 && publicPortfolio) {
        console.log('✅ WORKING: Fallback to public portfolio successful');
        console.log('   - getProjects() returns empty (expected - no auth)');
        console.log('   - getFirstPublicPortfolio() returns data');
        console.log(`   - Result: Homepage shows ${publicPortfolio.projects.length} projects`);
    } else {
        console.log('⚠️  UNEXPECTED: Authentication detected in anonymous test');
    }
    
    console.log('\n4️⃣  Expected Homepage Behavior...');
    
    if (publicPortfolio) {
        console.log('✅ Non-authenticated users should see:');
        console.log(`   - ${publicPortfolio.projects.length} projects in "Magical Projects"`);
        console.log(`   - ${publicPortfolio.story ? 'Story content' : 'No story'} in "My Story"`);
        console.log(`   - ${publicPortfolio.journey ? 'Journey timeline' : 'No journey'} in "My Journey"`);
        console.log(`   - ${publicPortfolio.toolbox.length} skill categories in "Magic Toolbox"`);
    } else {
        console.log('❌ Non-authenticated users will see:');
        console.log('   - Empty homepage with no content');
        console.log('   - Need to fix getFirstPublicPortfolio() method');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 DIAGNOSIS RESULTS');
    console.log('='.repeat(50));
    
    if (!publicPortfolio) {
        console.log('\n❌ NON-AUTHENTICATED HOMEPAGE BROKEN');
        console.log('   - getFirstPublicPortfolio() is not working');
        console.log('   - Check if any profiles have is_portfolio_public = true');
        console.log('   - Check RLS policies for public access');
    } else {
        console.log('\n✅ NON-AUTHENTICATED HOMEPAGE SHOULD WORK');
        console.log('   - getFirstPublicPortfolio() returns data');
        console.log('   - Fallback mechanism is functional');
    }
}

testNonAuthenticatedHomepage().catch(console.error);