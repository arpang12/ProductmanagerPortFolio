// Test the public URL flow (/u/username)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing Public URL Flow (/u/username)\n');
console.log('='.repeat(80));

async function testPublicURLFlow() {
    const username = 'admin'; // Test with your username
    
    console.log(`\n1️⃣  Simulating visit to /u/${username}...\n`);
    
    // Step 1: PublicPortfolioPage loads
    console.log('Step 1: PublicPortfolioPage.tsx loads');
    console.log('   - Sets loading = true');
    console.log('   - Calls api.getPublicPortfolioByUsername()');
    
    // Step 2: Fetch public portfolio
    console.log('\nStep 2: Fetching public portfolio data...');
    const startTime = Date.now();
    
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .eq('is_portfolio_public', true)
        .single();
    
    if (profileError || !profile) {
        console.log('   ❌ ERROR: Profile not found or not public');
        console.log(`      ${profileError?.message || 'No profile'}`);
        return;
    }
    
    console.log(`   ✅ Profile found: ${profile.username}`);
    console.log(`   📍 Org ID: ${profile.org_id}`);
    
    // Fetch all sections in parallel (like getPublicPortfolioByUsername does)
    console.log('\nStep 3: Fetching all sections in parallel...');
    
    const fetchStart = Date.now();
    
    const [
        projectsResult,
        storyResult,
        toolboxResult,
        journeyResult,
        contactResult,
        cvResult
    ] = await Promise.all([
        supabase.from('case_studies').select('*').eq('org_id', profile.org_id).eq('is_published', true),
        supabase.from('story_sections').select('*').eq('org_id', profile.org_id).single(),
        supabase.from('skill_categories').select('*, skills(*)').eq('org_id', profile.org_id),
        supabase.from('journey_timelines').select('*, journey_milestones(*)').eq('org_id', profile.org_id).single(),
        supabase.from('contact_sections').select('*, social_links(*)').eq('org_id', profile.org_id).single(),
        supabase.from('cv_sections').select('*, cv_versions(*)').eq('org_id', profile.org_id).single()
    ]);
    
    const fetchTime = Date.now() - fetchStart;
    
    console.log(`   ⏱️  Fetch time: ${fetchTime}ms`);
    
    // Check results
    const results = {
        projects: projectsResult.data?.length || 0,
        story: storyResult.data ? 1 : 0,
        toolbox: toolboxResult.data?.length || 0,
        journey: journeyResult.data ? 1 : 0,
        contact: contactResult.data ? 1 : 0,
        cv: cvResult.data ? 1 : 0
    };
    
    console.log('\n   Results:');
    console.log(`      Projects: ${results.projects > 0 ? '✅' : '❌'} (${results.projects})`);
    console.log(`      Story: ${results.story > 0 ? '✅' : '❌'}`);
    console.log(`      Toolbox: ${results.toolbox > 0 ? '✅' : '❌'} (${results.toolbox} categories)`);
    console.log(`      Journey: ${results.journey > 0 ? '✅' : '❌'}`);
    console.log(`      Contact: ${results.contact > 0 ? '✅' : '❌'}`);
    console.log(`      CV: ${results.cv > 0 ? '✅' : '❌'}`);
    
    const totalTime = Date.now() - startTime;
    
    console.log('\nStep 4: Data ready, render HomePage');
    console.log('   - publicPortfolioData is set');
    console.log('   - loading = false');
    console.log('   - HomePage renders with data');
    console.log('   - Dispatch "publicPortfolioDataLoaded" event');
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 PERFORMANCE METRICS\n');
    console.log(`   Total load time: ${totalTime}ms`);
    console.log(`   Data fetch time: ${fetchTime}ms`);
    console.log(`   Overhead: ${totalTime - fetchTime}ms`);
    
    if (totalTime < 500) {
        console.log('\n   ✅ EXCELLENT: Load time under 500ms');
    } else if (totalTime < 1000) {
        console.log('\n   ✅ GOOD: Load time under 1 second');
    } else if (totalTime < 2000) {
        console.log('\n   ⚠️  ACCEPTABLE: Load time under 2 seconds');
    } else {
        console.log('\n   ❌ SLOW: Load time over 2 seconds');
        console.log('      Consider optimizing queries or adding caching');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 FLOW ANALYSIS\n');
    
    const allSectionsLoaded = Object.values(results).every(v => v > 0);
    
    if (allSectionsLoaded) {
        console.log('✅ SYMMETRIC FLOW: All sections loaded successfully');
        console.log('\n   Flow:');
        console.log('   1. User visits /u/username');
        console.log('   2. PublicPortfolioPage shows loading spinner');
        console.log('   3. Fetch all data in parallel');
        console.log('   4. Store in publicPortfolioData');
        console.log('   5. Set loading = false');
        console.log('   6. HomePage renders with complete data');
        console.log('   7. No "loading..." spinners in sections');
    } else {
        console.log('⚠️  ASYMMETRIC FLOW: Some sections missing data');
        console.log('\n   Missing sections will show "loading..." spinners');
        console.log('   This is expected if those sections are empty in database');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETE\n');
    
    if (allSectionsLoaded && totalTime < 1000) {
        console.log('🎉 PUBLIC URL FLOW IS OPTIMAL!');
        console.log('   - All data loads');
        console.log('   - Fast performance');
        console.log('   - Symmetric flow');
    } else if (allSectionsLoaded) {
        console.log('✅ PUBLIC URL FLOW WORKS');
        console.log('   - All data loads');
        console.log('   - Performance could be improved');
    } else {
        console.log('⚠️  SOME SECTIONS MISSING DATA');
        console.log('   - Add content via admin panel');
    }
}

testPublicURLFlow().catch(console.error);
