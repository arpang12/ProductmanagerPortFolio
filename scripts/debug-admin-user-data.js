// Debug why admin user's case study isn't showing in Magical Projects
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debugging Admin User Data for Magical Projects');
console.log('='.repeat(60));

async function debugAdminUserData() {
    console.log('\n1️⃣  Getting admin profile...');
    
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'admin')
        .eq('is_portfolio_public', true)
        .single();
    
    if (profileError || !profile) {
        console.log('❌ Admin profile not found:', profileError?.message);
        return;
    }
    
    console.log('✅ Admin profile found:');
    console.log(`   Name: ${profile.name}`);
    console.log(`   Org ID: ${profile.org_id}`);
    console.log(`   Public: ${profile.is_portfolio_public}`);
    
    const orgId = profile.org_id;
    
    console.log('\n2️⃣  Checking ALL case studies for admin org...');
    
    const { data: allCaseStudies, error: allCsError } = await supabase
        .from('case_studies')
        .select('*')
        .eq('org_id', orgId);
    
    if (allCsError) {
        console.log('❌ Error fetching case studies:', allCsError.message);
    } else {
        console.log(`✅ Found ${allCaseStudies.length} total case studies for admin org`);
        
        allCaseStudies.forEach((cs, index) => {
            console.log(`   ${index + 1}. "${cs.title}"`);
            console.log(`      - ID: ${cs.case_study_id}`);
            console.log(`      - Published: ${cs.is_published}`);
            console.log(`      - Status: ${cs.status}`);
            console.log(`      - Hero Image: ${cs.hero_image_asset_id || 'None'}`);
            console.log(`      - Created: ${cs.created_at}`);
        });
    }
    
    console.log('\n3️⃣  Testing the EXACT query used by getPublicProjects...');
    
    // This is the exact query from getPublicProjects method
    const { data: publicProjects, error: publicError } = await supabase
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
    
    if (publicError) {
        console.log('❌ Public projects query failed:', publicError.message);
        console.log('   This is why Magical Projects is empty!');
    } else {
        console.log(`✅ Public projects query succeeded: ${publicProjects.length} projects`);
        
        if (publicProjects.length === 0) {
            console.log('   🚨 NO PUBLISHED PROJECTS RETURNED!');
            console.log('   This explains why Magical Projects section is empty');
        } else {
            publicProjects.forEach((project, index) => {
                console.log(`   ${index + 1}. "${project.title}"`);
                console.log(`      - ID: ${project.case_study_id}`);
                console.log(`      - Published: ${project.is_published}`);
                console.log(`      - Status: ${project.status}`);
                console.log(`      - Hero Image: ${project.hero_image_asset_id}`);
            });
        }
    }
    
    console.log('\n4️⃣  Testing case study transformation...');
    
    if (publicProjects && publicProjects.length > 0) {
        const project = publicProjects[0];
        
        // Check if hero image asset exists
        if (project.hero_image_asset_id) {
            const { data: asset, error: assetError } = await supabase
                .from('assets')
                .select('cloudinary_url, cloudinary_public_id, status')
                .eq('asset_id', project.hero_image_asset_id)
                .single();
            
            if (assetError) {
                console.log('   ❌ Hero image asset not found:', assetError.message);
            } else {
                console.log('   ✅ Hero image asset found:');
                console.log(`      - URL: ${asset.cloudinary_url}`);
                console.log(`      - Status: ${asset.status}`);
            }
        }
        
        // Transform to Project format (like the API does)
        const transformedProject = {
            id: project.case_study_id,
            title: project.title,
            description: 'Generated description', // This might be missing
            imageUrl: project.hero_image_asset_id ? 'https://res.cloudinary.com/...' : null,
            tags: [], // This might be missing
            slug: project.slug
        };
        
        console.log('   Transformed project:');
        console.log(`      - ID: ${transformedProject.id}`);
        console.log(`      - Title: ${transformedProject.title}`);
        console.log(`      - Description: ${transformedProject.description}`);
        console.log(`      - Image URL: ${transformedProject.imageUrl ? 'Has URL' : 'No URL'}`);
        console.log(`      - Tags: ${transformedProject.tags.length} tags`);
        console.log(`      - Slug: ${transformedProject.slug}`);
    }
    
    console.log('\n5️⃣  Testing complete getPublicPortfolioByUsername simulation...');
    
    try {
        // Simulate the complete API call
        const [projectsResult, storyResult, journeyResult] = await Promise.all([
            supabase
                .from('case_studies')
                .select('case_study_id, title, slug, hero_image_asset_id, is_published, status, created_at, updated_at')
                .eq('org_id', orgId)
                .eq('is_published', true)
                .order('created_at', { ascending: false }),
            
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
        
        console.log('✅ Complete API simulation results:');
        console.log(`   Projects: ${projectsResult.data?.length || 0} (${projectsResult.error ? 'ERROR: ' + projectsResult.error.message : 'OK'})`);
        console.log(`   Story: ${storyResult.data ? 'Found' : 'Not found'} (${storyResult.error ? 'ERROR: ' + storyResult.error.message : 'OK'})`);
        console.log(`   Journey: ${journeyResult.data ? 'Found' : 'Not found'} (${journeyResult.error ? 'ERROR: ' + journeyResult.error.message : 'OK'})`);
        
        if (projectsResult.data && projectsResult.data.length > 0) {
            console.log('   ✅ Projects should show in Magical Projects section!');
        } else {
            console.log('   ❌ No projects - explains empty Magical Projects section');
        }
        
    } catch (error) {
        console.log('❌ Complete API simulation failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS FOR ADMIN USER');
    console.log('='.repeat(60));
    
    if (publicProjects && publicProjects.length === 0) {
        console.log('\n🚨 ISSUE FOUND: NO PUBLISHED PROJECTS RETURNED');
        console.log('   The query for published case studies returns empty results');
        console.log('   This explains why Magical Projects section is blank');
        console.log('');
        console.log('💡 POSSIBLE CAUSES:');
        console.log('   1. Case study is not actually published (is_published = false)');
        console.log('   2. RLS policy is blocking the query');
        console.log('   3. Org ID mismatch between profile and case study');
        console.log('   4. Case study was deleted or moved');
    } else if (publicProjects && publicProjects.length > 0) {
        console.log('\n✅ PROJECTS DATA IS AVAILABLE');
        console.log('   The backend query returns projects correctly');
        console.log('   The issue must be in frontend rendering');
        console.log('');
        console.log('💡 CHECK:');
        console.log('   1. Browser console for JavaScript errors');
        console.log('   2. React component state management');
        console.log('   3. Data transformation in frontend');
    }
}

debugAdminUserData().catch(console.error);