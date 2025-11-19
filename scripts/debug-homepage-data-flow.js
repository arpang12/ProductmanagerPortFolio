// Debug the exact data flow that HomePage uses
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debugging HomePage Data Flow for Public Portfolio');
console.log('='.repeat(60));

// Simulate the exact API methods used by HomePage
async function debugHomePageFlow() {
    console.log('\n1️⃣  Simulating getPublicPortfolioByUsername("admin")...');
    
    // Step 1: Get profile (same as getPublicPortfolioByUsername)
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'admin')
        .eq('is_portfolio_public', true)
        .limit(1)
        .single();
    
    if (profileError || !profile) {
        console.log('❌ Profile lookup failed:', profileError?.message);
        return;
    }
    
    console.log('✅ Profile found:', profile.name);
    const orgId = profile.org_id;
    
    console.log('\n2️⃣  Testing getPublicProjects (Magical Projects)...');
    
    // Simulate getPublicProjects method
    const { data: projectsData, error: projectsError } = await supabase
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
        console.log(`✅ Projects query succeeded: ${projectsData.length} projects`);
        
        // Transform to Project format (like the API does)
        const transformedProjects = projectsData.map(cs => ({
            id: cs.case_study_id,
            title: cs.title,
            description: 'Case study description', // This might be missing
            imageUrl: cs.hero_image_asset_id ? `https://res.cloudinary.com/your-cloud/image/upload/${cs.hero_image_asset_id}` : null,
            tags: [], // This might be missing
            slug: cs.slug
        }));
        
        console.log('   Transformed projects:');
        transformedProjects.forEach((project, index) => {
            console.log(`   ${index + 1}. "${project.title}"`);
            console.log(`      - ID: ${project.id}`);
            console.log(`      - Image: ${project.imageUrl ? 'Has image' : 'No image'}`);
            console.log(`      - Tags: ${project.tags.length} tags`);
            console.log(`      - Description: ${project.description}`);
        });
    }
    
    console.log('\n3️⃣  Testing getPublicMyJourney (My Journey)...');
    
    // Simulate getPublicMyJourney method
    const { data: journeyData, error: journeyError } = await supabase
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
    } else if (!journeyData) {
        console.log('❌ No journey data found');
    } else {
        console.log(`✅ Journey query succeeded: "${journeyData.title}"`);
        
        const milestones = journeyData.journey_milestones || [];
        console.log(`   Milestones: ${milestones.length}`);
        
        // Transform to MyJourney format
        const transformedJourney = {
            id: journeyData.timeline_id,
            title: journeyData.title,
            subtitle: journeyData.subtitle,
            milestones: milestones
                .sort((a, b) => a.order_key.localeCompare(b.order_key))
                .map(m => ({
                    id: m.milestone_id,
                    title: m.title,
                    company: m.company,
                    period: m.period,
                    description: m.description,
                    isActive: m.is_active
                }))
        };
        
        console.log('   Transformed journey:');
        console.log(`   - Title: ${transformedJourney.title}`);
        console.log(`   - Subtitle: ${transformedJourney.subtitle}`);
        console.log(`   - Milestones: ${transformedJourney.milestones.length}`);
        
        transformedJourney.milestones.forEach((milestone, index) => {
            console.log(`     ${index + 1}. "${milestone.title}" at ${milestone.company}`);
            console.log(`        - Active: ${milestone.isActive}`);
            console.log(`        - Period: ${milestone.period || 'Not set'}`);
        });
    }
    
    console.log('\n4️⃣  Testing getFirstPublicPortfolio fallback...');
    
    // Test the fallback method that HomePage uses
    const { data: firstProfile, error: firstProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_portfolio_public', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (firstProfileError) {
        console.log('❌ First public portfolio failed:', firstProfileError.message);
    } else {
        console.log(`✅ First public portfolio: ${firstProfile.name}`);
        console.log(`   Org ID: ${firstProfile.org_id}`);
        console.log(`   Username: ${firstProfile.username}`);
    }
    
    console.log('\n5️⃣  Checking data transformation issues...');
    
    // Check if the issue is in data transformation
    if (projectsData && projectsData.length > 0) {
        const project = projectsData[0];
        console.log('   Sample project data:');
        console.log(`   - case_study_id: ${project.case_study_id}`);
        console.log(`   - title: ${project.title}`);
        console.log(`   - hero_image_asset_id: ${project.hero_image_asset_id}`);
        console.log(`   - is_published: ${project.is_published}`);
        console.log(`   - status: ${project.status}`);
        
        // Check if hero image asset exists
        if (project.hero_image_asset_id) {
            const { data: asset, error: assetError } = await supabase
                .from('assets')
                .select('cloudinary_url, cloudinary_public_id')
                .eq('asset_id', project.hero_image_asset_id)
                .single();
            
            if (assetError) {
                console.log('   ❌ Hero image asset not found:', assetError.message);
            } else {
                console.log('   ✅ Hero image asset found:', asset.cloudinary_url);
            }
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSIS');
    console.log('='.repeat(60));
    
    console.log('\n🔍 Possible Issues:');
    console.log('1. Data transformation - API returns data but frontend expects different format');
    console.log('2. Missing fields - Projects might be missing description, tags, or images');
    console.log('3. React rendering - Components might not be handling null/empty data correctly');
    console.log('4. CSS/styling - Content might be rendered but hidden');
    console.log('5. Event timing - PublicPortfolioPage might not be triggering data reload correctly');
    
    console.log('\n🧪 Next Steps:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Inspect HTML elements to see if data is rendered but hidden');
    console.log('3. Add console.log statements to HomePage component');
    console.log('4. Test with browser dev tools Network tab');
}

debugHomePageFlow().catch(console.error);