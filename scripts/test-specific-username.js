// Test specific username access
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUsername = process.argv[2] || 'admin';

console.log(`🧪 Testing Public Access for Username: ${testUsername}\n`);
console.log('='.repeat(70));

async function testUsernameAccess() {
    // Step 1: Find profile by username
    console.log('\n1️⃣  Looking up profile...');
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', testUsername)
        .eq('is_portfolio_public', true)
        .single();
    
    if (profileError) {
        console.log('❌ Profile not found or not public');
        console.log('   Error:', profileError.message);
        console.log('\n🔧 Possible fixes:');
        console.log('   1. Check username is correct');
        console.log('   2. Run: UPDATE user_profiles SET is_portfolio_public = true WHERE username = \'' + testUsername + '\';');
        return;
    }
    
    console.log('✅ Profile found');
    console.log(`   Name: ${profile.name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Org ID: ${profile.org_id}`);
    console.log(`   Public: ${profile.is_portfolio_public}`);
    
    const orgId = profile.org_id;
    
    // Step 2: Test each section
    const sections = [
        { table: 'story_sections', name: 'My Story', query: '*' },
        { table: 'skill_categories', name: 'Magic Toolbox', query: '*, skills(*)' },
        { table: 'tools', name: 'Enhanced Tools', query: '*' },
        { table: 'journey_timelines', name: 'My Journey', query: '*, journey_milestones(*)' },
        { table: 'cv_sections', name: 'Download CV', query: '*, cv_versions(*)' },
        { table: 'contact_sections', name: 'Contact Me', query: '*, social_links(*)' },
        { table: 'carousels', name: 'Carousel', query: '*, carousel_slides(*)' },
        { table: 'case_studies', name: 'Projects', query: '*', extraFilter: { is_published: true } }
    ];
    
    console.log('\n2️⃣  Testing section access...\n');
    
    for (const section of sections) {
        process.stdout.write(`   ${section.name}... `);
        
        try {
            let query = supabase
                .from(section.table)
                .select(section.query)
                .eq('org_id', orgId);
            
            if (section.extraFilter) {
                Object.entries(section.extraFilter).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }
            
            const { data, error } = await query.limit(1);
            
            if (error) {
                console.log(`❌ RLS BLOCKED`);
                console.log(`      Error: ${error.message}`);
            } else if (!data || data.length === 0) {
                console.log(`⚠️  EMPTY (no data)`);
            } else {
                console.log(`✅ WORKS`);
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
        }
    }
    
    // Step 3: Test the actual API call that frontend uses
    console.log('\n3️⃣  Testing full portfolio fetch (as frontend does)...\n');
    
    try {
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('username', testUsername)
            .eq('is_portfolio_public', true)
            .single();
        
        if (!profileData) {
            console.log('❌ Cannot fetch profile');
            return;
        }
        
        console.log('   Fetching all sections in parallel...');
        
        const results = await Promise.allSettled([
            supabase.from('story_sections').select('*').eq('org_id', profileData.org_id).limit(1),
            supabase.from('skill_categories').select('*, skills(*)').eq('org_id', profileData.org_id),
            supabase.from('tools').select('*').eq('org_id', profileData.org_id),
            supabase.from('journey_timelines').select('*, journey_milestones(*)').eq('org_id', profileData.org_id).limit(1),
            supabase.from('cv_sections').select('*, cv_versions(*)').eq('org_id', profileData.org_id).limit(1),
            supabase.from('contact_sections').select('*, social_links(*)').eq('org_id', profileData.org_id).limit(1),
            supabase.from('carousels').select('*, carousel_slides(*)').eq('org_id', profileData.org_id).limit(1),
            supabase.from('case_studies').select('*').eq('org_id', profileData.org_id).eq('is_published', true)
        ]);
        
        const sectionNames = ['Story', 'Toolbox', 'Tools', 'Journey', 'CV', 'Contact', 'Carousel', 'Projects'];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const data = result.value.data;
                const error = result.value.error;
                
                if (error) {
                    console.log(`   ❌ ${sectionNames[index]}: ${error.message}`);
                } else if (!data || data.length === 0) {
                    console.log(`   ⚠️  ${sectionNames[index]}: No data`);
                } else {
                    console.log(`   ✅ ${sectionNames[index]}: ${data.length} record(s)`);
                }
            } else {
                console.log(`   ❌ ${sectionNames[index]}: ${result.reason}`);
            }
        });
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📋 DIAGNOSIS SUMMARY\n');
    console.log('If sections show "RLS BLOCKED":');
    console.log('  → You MUST run FIX_PUBLIC_PORTFOLIO_RLS.sql in Supabase\n');
    console.log('If sections show "No data":');
    console.log('  → Add content via admin panel\n');
    console.log('If all sections show ✅:');
    console.log('  → Backend is working! Check browser console for frontend errors\n');
    console.log('='.repeat(70));
}

diagnose().catch(console.error);
