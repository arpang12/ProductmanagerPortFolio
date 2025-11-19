// Debug the specific "youremailgf" username that's not showing data
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debugging "youremailgf" Username Specifically');
console.log('='.repeat(55));

async function debugYouremailgf() {
    console.log('\n1️⃣  Getting profile for "youremailgf"...');
    
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'youremailgf')
        .eq('is_portfolio_public', true)
        .single();
    
    if (profileError || !profile) {
        console.log('❌ Profile not found:', profileError?.message);
        return;
    }
    
    console.log('✅ Profile found:');
    console.log(`   Name: ${profile.name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Org ID: ${profile.org_id}`);
    console.log(`   Username: ${profile.username}`);
    console.log(`   Public: ${profile.is_portfolio_public}`);
    
    const orgId = profile.org_id;
    
    console.log('\n2️⃣  Checking case studies for this org...');
    
    const { data: allCaseStudies, error: allCsError } = await supabase
        .from('case_studies')
        .select('*')
        .eq('org_id', orgId);
    
    if (allCsError) {
        console.log('❌ Error fetching case studies:', allCsError.message);
    } else {
        console.log(`✅ Found ${allCaseStudies.length} total case studies for org "${orgId}"`);
        
        allCaseStudies.forEach((cs, index) => {
            console.log(`   ${index + 1}. "${cs.title}"`);
            console.log(`      - Published: ${cs.is_published}`);
            console.log(`      - Status: ${cs.status}`);
            console.log(`      - Created: ${cs.created_at}`);
        });
        
        const publishedCaseStudies = allCaseStudies.filter(cs => cs.is_published);
        console.log(`   📊 Published: ${publishedCaseStudies.length}/${allCaseStudies.length}`);
        
        if (publishedCaseStudies.length === 0) {
            console.log('   🚨 NO PUBLISHED CASE STUDIES - This is why Magical Projects is blank!');
        }
    }
    
    console.log('\n3️⃣  Checking journey timeline for this org...');
    
    const { data: timelines, error: timelineError } = await supabase
        .from('journey_timelines')
        .select(`
            timeline_id,
            title,
            subtitle,
            org_id,
            created_at,
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
        .eq('org_id', orgId);
    
    if (timelineError) {
        console.log('❌ Error fetching timelines:', timelineError.message);
    } else {
        console.log(`✅ Found ${timelines.length} timelines for org "${orgId}"`);
        
        if (timelines.length === 0) {
            console.log('   🚨 NO JOURNEY TIMELINES - This is why My Journey is blank!');
        } else {
            timelines.forEach((timeline, index) => {
                console.log(`   ${index + 1}. "${timeline.title}"`);
                console.log(`      - Subtitle: ${timeline.subtitle || 'None'}`);
                console.log(`      - Milestones: ${timeline.journey_milestones?.length || 0}`);
                console.log(`      - Created: ${timeline.created_at}`);
                
                if (timeline.journey_milestones && timeline.journey_milestones.length > 0) {
                    timeline.journey_milestones.forEach((milestone, mIndex) => {
                        console.log(`        ${mIndex + 1}. "${milestone.title}" at ${milestone.company}`);
                        console.log(`           - Active: ${milestone.is_active}`);
                        console.log(`           - Period: ${milestone.period || 'Not set'}`);
                    });
                }
            });
        }
    }
    
    console.log('\n4️⃣  Checking story sections for this org...');
    
    const { data: stories, error: storyError } = await supabase
        .from('story_sections')
        .select(`
            story_id,
            title,
            subtitle,
            org_id,
            image_asset_id,
            created_at,
            story_paragraphs (
                paragraph_id,
                content,
                order_key
            )
        `)
        .eq('org_id', orgId);
    
    if (storyError) {
        console.log('❌ Error fetching stories:', storyError.message);
    } else {
        console.log(`✅ Found ${stories.length} story sections for org "${orgId}"`);
        
        if (stories.length === 0) {
            console.log('   ⚠️  No story sections found');
        } else {
            stories.forEach((story, index) => {
                console.log(`   ${index + 1}. "${story.title}"`);
                console.log(`      - Subtitle: ${story.subtitle || 'None'}`);
                console.log(`      - Paragraphs: ${story.story_paragraphs?.length || 0}`);
                console.log(`      - Image: ${story.image_asset_id || 'None'}`);
                console.log(`      - Created: ${story.created_at}`);
            });
        }
    }
    
    console.log('\n5️⃣  Comparing with "admin" user data...');
    
    // Get admin user data for comparison
    const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'admin')
        .single();
    
    if (adminProfile) {
        console.log(`✅ Admin user org: ${adminProfile.org_id}`);
        
        // Check admin's case studies
        const { data: adminCaseStudies } = await supabase
            .from('case_studies')
            .select('case_study_id, title, is_published, org_id')
            .eq('org_id', adminProfile.org_id);
        
        console.log(`   Admin has ${adminCaseStudies?.length || 0} case studies`);
        const adminPublished = adminCaseStudies?.filter(cs => cs.is_published).length || 0;
        console.log(`   Admin has ${adminPublished} published case studies`);
        
        // Check admin's journey
        const { data: adminTimelines } = await supabase
            .from('journey_timelines')
            .select('timeline_id, title, org_id')
            .eq('org_id', adminProfile.org_id);
        
        console.log(`   Admin has ${adminTimelines?.length || 0} journey timelines`);
    }
    
    console.log('\n' + '='.repeat(55));
    console.log('📊 DIAGNOSIS FOR "youremailgf"');
    console.log('='.repeat(55));
    
    if (allCaseStudies && allCaseStudies.length === 0) {
        console.log('\n🚨 ROOT CAUSE: NO CASE STUDIES');
        console.log('   The "youremailgf" user has no case studies at all');
        console.log('   This explains why Magical Projects is blank');
        console.log('');
        console.log('💡 SOLUTION:');
        console.log('   1. Create case studies for this user in admin panel');
        console.log('   2. Or use a different username that has data (like "admin")');
    } else if (allCaseStudies && allCaseStudies.filter(cs => cs.is_published).length === 0) {
        console.log('\n🚨 ROOT CAUSE: NO PUBLISHED CASE STUDIES');
        console.log('   The "youremailgf" user has case studies but none are published');
        console.log('   This explains why Magical Projects is blank');
        console.log('');
        console.log('💡 SOLUTION:');
        console.log('   1. Publish the case studies for this user');
        console.log('   2. Or use a different username that has published data');
    }
    
    if (timelines && timelines.length === 0) {
        console.log('\n🚨 ROOT CAUSE: NO JOURNEY TIMELINES');
        console.log('   The "youremailgf" user has no journey timeline data');
        console.log('   This explains why My Journey is blank');
        console.log('');
        console.log('💡 SOLUTION:');
        console.log('   1. Create journey timeline for this user in admin panel');
        console.log('   2. Or use a different username that has journey data');
    }
    
    console.log('\n🌐 WORKING ALTERNATIVES:');
    console.log('   Try: http://localhost:3002/u/admin (has published case study + journey)');
    console.log('   Current: http://localhost:3002/u/youremailgf (missing data)');
}

debugYouremailgf().catch(console.error);