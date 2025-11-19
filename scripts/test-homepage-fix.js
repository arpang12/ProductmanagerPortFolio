// Test the homepage fix for non-authenticated users
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 Testing Homepage Fix for Non-Authenticated Users');
console.log('='.repeat(60));

async function testHomePageLogic() {
    console.log('\n1️⃣  Simulating HomePage data loading logic...');
    
    // Step 1: Check authentication (like the fixed HomePage does)
    const { data: { user } } = await supabase.auth.getUser();
    const isUserAuthenticated = !!user;
    console.log(`Authentication status: ${isUserAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    
    // Step 2: Simulate API calls (like HomePage does)
    console.log('\n2️⃣  Simulating API calls...');
    
    // These will all return null/empty for non-authenticated users
    const fetchedProjects = []; // getProjects() returns empty
    const fetchedStory = null;   // getMyStory() returns null
    const fetchedToolbox = null; // getMagicToolbox() returns null
    const fetchedJourney = null; // getMyJourney() returns null
    
    console.log('Simulated API results:');
    console.log(`  - fetchedProjects: ${fetchedProjects.length} items`);
    console.log(`  - fetchedStory: ${fetchedStory ? 'Found' : 'null'}`);
    console.log(`  - fetchedToolbox: ${fetchedToolbox ? 'Found' : 'null'}`);
    console.log(`  - fetchedJourney: ${fetchedJourney ? 'Found' : 'null'}`);
    
    // Step 3: Check authentication logic (like the fixed HomePage does)
    const hasAuthenticatedData = fetchedStory && fetchedToolbox && fetchedJourney;
    
    console.log('\n3️⃣  Authentication logic check...');
    console.log(`isUserAuthenticated: ${isUserAuthenticated}`);
    console.log(`hasAuthenticatedData: ${hasAuthenticatedData}`);
    
    if (isUserAuthenticated && hasAuthenticatedData) {
        console.log('✅ Would use authenticated data');
        return 'authenticated';
    } else if (isUserAuthenticated && !hasAuthenticatedData) {
        console.log('⚠️  User authenticated but no data - falling back to public');
        return 'fallback';
    } else {
        console.log('ℹ️  User not authenticated - falling back to public');
        return 'fallback';
    }
}

async function testPublicFallback() {
    console.log('\n4️⃣  Testing public fallback (getFirstPublicPortfolio)...');
    
    try {
        // Get first public profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('is_portfolio_public', true)
            .limit(1)
            .single();

        if (profileError || !profile) {
            console.log('❌ No public portfolios found');
            return null;
        }

        console.log(`✅ Found public profile: @${profile.username}`);
        
        // Test public data access
        const { data: projects } = await supabase
            .from('case_studies')
            .select('case_study_id, title')
            .eq('org_id', profile.org_id)
            .eq('is_published', true);
        
        console.log(`✅ Public projects available: ${projects?.length || 0}`);
        
        return {
            profile,
            projects: projects || []
        };
    } catch (error) {
        console.error('❌ Error in public fallback:', error);
        return null;
    }
}

async function runTest() {
    const authResult = await testHomePageLogic();
    
    if (authResult === 'fallback') {
        const publicData = await testPublicFallback();
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 HOMEPAGE FIX TEST RESULTS');
        console.log('='.repeat(60));
        
        if (publicData && publicData.projects.length > 0) {
            console.log('\n✅ NON-AUTHENTICATED HOMEPAGE SHOULD WORK');
            console.log('   - Authentication logic correctly detects non-auth user');
            console.log('   - Falls back to getFirstPublicPortfolio()');
            console.log(`   - Public data available: ${publicData.projects.length} projects`);
            console.log('   - Homepage should show content');
        } else {
            console.log('\n❌ NON-AUTHENTICATED HOMEPAGE STILL BROKEN');
            console.log('   - Authentication logic works');
            console.log('   - But public fallback returns no data');
            console.log('   - Check public portfolio settings');
        }
    } else {
        console.log('\n⚠️  Test detected authentication - cannot test non-auth scenario');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Refresh your React app');
    console.log('2. Open in incognito/private window (to ensure no auth)');
    console.log('3. Visit http://localhost:3002/');
    console.log('4. Should see content from first public portfolio');
}

runTest().catch(console.error);