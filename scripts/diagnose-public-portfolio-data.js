// Diagnose why public portfolio data isn't loading
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Diagnosing Public Portfolio Data Flow');
console.log('='.repeat(50));

async function diagnosePublicPortfolio() {
    console.log('\n1️⃣  Testing Supabase Connection...');
    
    // Test basic connection
    const { data: testConnection, error: connectionError } = await supabase
        .from('organizations')
        .select('org_id, name')
        .limit(1);
    
    if (connectionError) {
        console.log('❌ Supabase connection failed:', connectionError.message);
        return;
    } else {
        console.log('✅ Supabase connection working');
        console.log(`   Found ${testConnection.length} organizations`);
    }
    
    console.log('\n2️⃣  Checking Case Studies (Magical Projects)...');
    
    // Test case studies access (anonymous)
    const { data: caseStudies, error: csError } = await supabase
        .from('case_studies')
        .select(`
            case_study_id,
            title,
            slug,
            is_published,
            status,
            org_id,
            hero_image_asset_id,
            created_at
        `)
        .order('created_at', { ascending: false });
    
    if (csError) {
        console.log('❌ Cannot read case studies:', csError.message);
        console.log('   This explains why Magical Projects is blank!');
    } else {
        console.log(`✅ Can read ${caseStudies.length} case studies`);
        
        caseStudies.forEach((cs, index) => {
            console.log(`   ${index + 1}. "${cs.title}"`);
            console.log(`      - Published: ${cs.is_published}`);
            console.log(`      - Status: ${cs.status}`);
            console.log(`      - Org: ${cs.org_id}`);
            console.log(`      - Hero Image: ${cs.hero_image_asset_id || 'None'}`);
        });
        
        const publishedCount = caseStudies.filter(cs => cs.is_published).length;
        console.log(`   📊 Published: ${publishedCount}/${caseStudies.length}`);
        
        if (publishedCount === 0) {
            console.log('   ⚠️  No published case studies - this is why Magical Projects is blank!');
        }
    }
    
    console.log('\n3️⃣  Checking Journey Timeline (My Journey)...');
    
    // Test journey timeline access
    const { data: timelines, error: timelineError } = await supabase
        .from('journey_timelines')
        .select(`
            timeline_id,
            title,
            subtitle,
            org_id,
            created_at
        `);
    
    if (timelineError) {
        console.log('❌ Cannot read journey timelines:', timelineError.message);
        console.log('   This explains why My Journey is blank!');
    } else {
        console.log(`✅ Can read ${timelines.length} journey timelines`);
        
        if (timelines.length === 0) {
            console.log('   ⚠️  No journey timelines found');
        } else {
            // Check milestones
            const { data: milestones, error: milestoneError } = await supabase
                .from('journey_milestones')
                .select(`
                    milestone_id,
                    title,
                    company,
                    timeline_id,
                    is_active,
                    order_key
                `)
                .order('order_key');
            
            if (milestoneError) {
                console.log('❌ Cannot read journey milestones:', milestoneError.message);
            } else {
                console.log(`✅ Can read ${milestones.length} journey milestones`);
                
                milestones.forEach((milestone, index) => {
                    console.log(`   ${index + 1}. "${milestone.title}" at ${milestone.company}`);
                    console.log(`      - Active: ${milestone.is_active}`);
                    console.log(`      - Timeline: ${milestone.timeline_id}`);
                });
                
                if (milestones.length === 0) {
                    console.log('   ⚠️  No journey milestones - this is why My Journey is blank!');
                }
            }
        }
    }
    
    console.log('\n4️⃣  Checking User Profiles (for public access)...');
    
    // Check user profiles
    const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
            user_id,
            org_id,
            email,
            name,
            is_portfolio_public
        `);
    
    if (profileError) {
        console.log('❌ Cannot read user profiles:', profileError.message);
    } else {
        console.log(`✅ Can read ${profiles.length} user profiles`);
        
        profiles.forEach((profile, index) => {
            console.log(`   ${index + 1}. ${profile.name} (${profile.email})`);
            console.log(`      - Org: ${profile.org_id}`);
            console.log(`      - Public Portfolio: ${profile.is_portfolio_public || 'undefined'}`);
        });
        
        const publicProfiles = profiles.filter(p => p.is_portfolio_public === true);
        console.log(`   📊 Public Portfolios: ${publicProfiles.length}/${profiles.length}`);
        
        if (publicProfiles.length === 0) {
            console.log('   ⚠️  No public portfolios enabled!');
        }
    }
    
    console.log('\n5️⃣  Testing Story Section (My Story)...');
    
    // Test story sections
    const { data: stories, error: storyError } = await supabase
        .from('story_sections')
        .select(`
            story_id,
            title,
            subtitle,
            org_id,
            image_asset_id
        `);
    
    if (storyError) {
        console.log('❌ Cannot read story sections:', storyError.message);
    } else {
        console.log(`✅ Can read ${stories.length} story sections`);
        
        if (stories.length === 0) {
            console.log('   ⚠️  No story sections found');
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('='.repeat(50));
    
    // Provide diagnosis
    if (csError) {
        console.log('\n🚨 CASE STUDIES ISSUE:');
        console.log('   RLS policy is blocking anonymous access to case_studies table');
        console.log('   This is why "Magical Projects" section is blank');
    } else if (caseStudies && caseStudies.filter(cs => cs.is_published).length === 0) {
        console.log('\n🚨 PUBLISHING ISSUE:');
        console.log('   Case studies exist but none are published');
        console.log('   This is why "Magical Projects" section is blank');
    }
    
    if (timelineError) {
        console.log('\n🚨 JOURNEY TIMELINE ISSUE:');
        console.log('   RLS policy is blocking anonymous access to journey_timelines table');
        console.log('   This is why "My Journey" section is blank');
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Fix RLS policies for public access');
    console.log('2. Ensure case studies are published');
    console.log('3. Verify user profiles have is_portfolio_public = true');
}

diagnosePublicPortfolio().catch(console.error);