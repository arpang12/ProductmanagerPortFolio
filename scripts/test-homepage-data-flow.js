// Test what HomePage actually receives
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing HomePage Data Flow (Unauthenticated)\n');
console.log('='.repeat(80));

async function testHomePageFlow() {
    console.log('\n1️⃣  Simulating HomePage.tsx data fetch (no auth)...\n');
    
    // Simulate what HomePage does
    console.log('Step 1: Check getPublicPortfolioData()');
    const publicData = null; // This is null when visiting / directly
    console.log(`   Result: ${publicData ? 'Has data' : 'null'}`);
    
    if (!publicData) {
        console.log('\nStep 2: Try authenticated methods (will work with public RLS)...\n');
        
        // Test getProjects()
        console.log('   Testing api.getProjects()...');
        const { data: projects, error: projError } = await supabase
            .from('case_studies')
            .select(`
                case_study_id,
                title,
                hero_image_asset_id,
                is_published,
                assets!case_studies_hero_image_asset_id_fkey (cloudinary_url),
                case_study_sections!inner (content)
            `)
            .eq('is_published', true)
            .eq('case_study_sections.section_type', 'hero');
        
        if (projError) {
            console.log(`   ❌ ERROR: ${projError.message}`);
        } else if (!projects || projects.length === 0) {
            console.log(`   ⚠️  NO PROJECTS (empty array returned)`);
        } else {
            console.log(`   ✅ SUCCESS: ${projects.length} project(s)`);
            projects.forEach(p => console.log(`      - ${p.title}`));
        }
        
        // Test getMyStory()
        console.log('\n   Testing api.getMyStory()...');
        // This requires getUserOrgId() which needs auth
        const { data: { user } } = await supabase.auth.getUser();
        console.log(`   User authenticated: ${user ? 'Yes' : 'No'}`);
        
        if (!user) {
            console.log(`   ⚠️  Not authenticated - getUserOrgId() will return null`);
            console.log(`   ⚠️  All authenticated methods will fail`);
            console.log(`\nStep 3: Fallback to getFirstPublicPortfolio()...\n`);
            
            // Test getFirstPublicPortfolio
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('is_portfolio_public', true)
                .limit(1)
                .single();
            
            if (!profile) {
                console.log('   ❌ No public profile found');
                return;
            }
            
            console.log(`   ✅ Found public profile: ${profile.username}`);
            console.log(`   📍 Org ID: ${profile.org_id}`);
            
            // Test getPublicProjects
            console.log('\n   Testing getPublicProjects()...');
            const { data: publicProjects, error: pubProjError } = await supabase
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
            
            if (pubProjError) {
                console.log(`   ❌ ERROR: ${pubProjError.message}`);
            } else if (!publicProjects || publicProjects.length === 0) {
                console.log(`   ⚠️  NO PROJECTS`);
                
                // Debug
                const { data: allCS } = await supabase
                    .from('case_studies')
                    .select('case_study_id, title, org_id, is_published');
                
                console.log(`\n   🔍 Debug: All case studies:`);
                allCS?.forEach(cs => {
                    console.log(`      - ${cs.title}`);
                    console.log(`        org_id: ${cs.org_id} (need: ${profile.org_id})`);
                    console.log(`        published: ${cs.is_published}`);
                    console.log(`        Match: ${cs.org_id === profile.org_id && cs.is_published ? '✅' : '❌'}`);
                });
            } else {
                console.log(`   ✅ SUCCESS: ${publicProjects.length} project(s)`);
                publicProjects.forEach(p => console.log(`      - ${p.title}`));
            }
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 DIAGNOSIS:\n');
    
    if (!user) {
        console.log('When visiting homepage WITHOUT login:');
        console.log('  1. getPublicPortfolioData() returns null ✅');
        console.log('  2. Tries authenticated methods (getProjects, getMyStory, etc.)');
        console.log('  3. getProjects() works (no auth needed) ✅');
        console.log('  4. getMyStory() fails (needs auth) ❌');
        console.log('  5. Falls back to getFirstPublicPortfolio() ✅');
        console.log('\n💡 The logic should work IF:');
        console.log('  - Case study has correct org_id');
        console.log('  - Case study is published');
        console.log('  - Profile is public');
        console.log('\n🔧 Check if case study org_id matches profile org_id!');
    }
}

testHomePageFlow().catch(console.error);
