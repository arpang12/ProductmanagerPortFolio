// Test the architecture fixes
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing Architecture Fixes');
console.log('='.repeat(50));

async function testArchitectureFixes() {
    console.log('\n1️⃣  Testing RLS Policy Fix...');
    
    // Test case studies with is_published = true
    const { data: caseStudies, error: csError } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, org_id')
        .eq('is_published', true);
    
    if (csError) {
        console.log('❌ Case studies query failed:', csError.message);
        console.log('   RLS policy fix may not have been applied');
    } else {
        console.log(`✅ Case studies query succeeded: ${caseStudies.length} published case studies`);
        caseStudies.forEach((cs, index) => {
            console.log(`   ${index + 1}. "${cs.title}" (${cs.org_id})`);
        });
    }
    
    console.log('\n2️⃣  Testing Public Portfolio API Method...');
    
    // Test the getPublicPortfolioByUsername equivalent
    const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'admin')
        .eq('is_portfolio_public', true)
        .single();
    
    if (profileError) {
        console.log('❌ Profile query failed:', profileError.message);
    } else {
        console.log(`✅ Profile query succeeded: ${profiles.name} (${profiles.org_id})`);
        
        // Test fetching data for this org
        const orgId = profiles.org_id;
        
        const [projectsResult, journeyResult, storyResult] = await Promise.all([
            supabase
                .from('case_studies')
                .select('case_study_id, title, is_published')
                .eq('org_id', orgId)
                .eq('is_published', true),
            
            supabase
                .from('journey_timelines')
                .select(`
                    timeline_id, title, subtitle,
                    journey_milestones (milestone_id, title, company, is_active)
                `)
                .eq('org_id', orgId)
                .limit(1)
                .single(),
            
            supabase
                .from('story_sections')
                .select(`
                    story_id, title, subtitle,
                    story_paragraphs (paragraph_id, content)
                `)
                .eq('org_id', orgId)
                .limit(1)
                .single()
        ]);
        
        console.log('\n📊 Parallel Data Fetch Results:');
        console.log(`   Projects: ${projectsResult.data?.length || 0} (${projectsResult.error ? 'ERROR: ' + projectsResult.error.message : 'OK'})`);
        console.log(`   Journey: ${journeyResult.data ? 'Found' : 'Not found'} (${journeyResult.error ? 'ERROR: ' + journeyResult.error.message : 'OK'})`);
        console.log(`   Story: ${storyResult.data ? 'Found' : 'Not found'} (${storyResult.error ? 'ERROR: ' + storyResult.error.message : 'OK'})`);
        
        if (journeyResult.data) {
            console.log(`   Journey milestones: ${journeyResult.data.journey_milestones?.length || 0}`);
        }
        
        if (storyResult.data) {
            console.log(`   Story paragraphs: ${storyResult.data.story_paragraphs?.length || 0}`);
        }
    }
    
    console.log('\n3️⃣  Testing Different Usernames...');
    
    const testUsernames = ['admin', 'youremailgf', 'youremail'];
    
    for (const username of testUsernames) {
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('username, name, org_id, is_portfolio_public')
            .eq('username', username)
            .eq('is_portfolio_public', true)
            .single();
        
        if (error) {
            console.log(`   ❌ ${username}: Not found or not public`);
        } else {
            console.log(`   ✅ ${username}: ${profile.name} (${profile.org_id})`);
            
            // Quick test of case studies for this user
            const { data: userProjects } = await supabase
                .from('case_studies')
                .select('title, is_published')
                .eq('org_id', profile.org_id)
                .eq('is_published', true);
            
            console.log(`      Projects: ${userProjects?.length || 0}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 ARCHITECTURE FIX RESULTS');
    console.log('='.repeat(50));
    
    if (!csError && caseStudies.length > 0) {
        console.log('\n✅ RLS POLICY FIX: SUCCESS');
        console.log('   - Case studies are now accessible with is_published = true');
        console.log('   - Public portfolio queries should work');
    } else {
        console.log('\n❌ RLS POLICY FIX: FAILED');
        console.log('   - Run the FIX_RLS_POLICY_NOW.sql script in Supabase');
    }
    
    if (!profileError && profiles) {
        console.log('\n✅ PUBLIC PORTFOLIO API: SUCCESS');
        console.log('   - Profile lookup works');
        console.log('   - Data fetching works');
    } else {
        console.log('\n❌ PUBLIC PORTFOLIO API: FAILED');
        console.log('   - Check user profiles and is_portfolio_public settings');
    }
    
    console.log('\n🌐 TEST THESE URLS:');
    console.log('   http://localhost:3002/u/admin');
    console.log('   http://localhost:3002/u/youremailgf');
    console.log('   http://localhost:3002/u/youremail');
    
    console.log('\n💡 EXPECTED BEHAVIOR:');
    console.log('   - Pages should load without authentication');
    console.log('   - Published case studies should appear');
    console.log('   - Journey timeline should show milestones');
    console.log('   - My Story should show content');
    console.log('   - No global variable dependencies');
}

testArchitectureFixes().catch(console.error);