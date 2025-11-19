// Comprehensive RCA: Public Page Data Flow
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Simulate public access (no auth)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 COMPREHENSIVE PUBLIC ACCESS RCA');
console.log('='.repeat(80));
console.log('Testing as: UNAUTHENTICATED USER (simulating incognito mode)\n');

async function testPublicAccess() {
    const results = {
        profile: null,
        sections: {},
        errors: [],
        warnings: []
    };

    // Step 1: Get public profile
    console.log('STEP 1: Fetching Public Profile');
    console.log('-'.repeat(80));
    try {
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('is_portfolio_public', true)
            .limit(1)
            .single();

        if (error) {
            console.log('❌ ERROR:', error.message);
            results.errors.push({ step: 'profile', error: error.message });
            return results;
        }

        if (!profile) {
            console.log('❌ No public profile found');
            results.errors.push({ step: 'profile', error: 'No public profile' });
            return results;
        }

        console.log('✅ Profile found:');
        console.log(`   Username: ${profile.username}`);
        console.log(`   Org ID: ${profile.org_id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Public: ${profile.is_portfolio_public}`);
        results.profile = profile;

    } catch (error) {
        console.log('❌ EXCEPTION:', error.message);
        results.errors.push({ step: 'profile', error: error.message });
        return results;
    }

    const orgId = results.profile.org_id;

    // Step 2: Test each section
    const sections = [
        { name: 'Story', table: 'story_sections', query: { org_id: orgId } },
        { name: 'Story Paragraphs', table: 'story_paragraphs', joinQuery: true },
        { name: 'Skill Categories', table: 'skill_categories', query: { org_id: orgId } },
        { name: 'Skills', table: 'skills', joinQuery: true },
        { name: 'Tools', table: 'tools', query: { org_id: orgId } },
        { name: 'Journey Timelines', table: 'journey_timelines', query: { org_id: orgId } },
        { name: 'Journey Milestones', table: 'journey_milestones', joinQuery: true },
        { name: 'Contact', table: 'contact_sections', query: { org_id: orgId } },
        { name: 'Social Links', table: 'social_links', joinQuery: true },
        { name: 'CV Sections', table: 'cv_sections', query: { org_id: orgId } },
        { name: 'CV Versions', table: 'cv_versions', joinQuery: true },
        { name: 'Carousels', table: 'carousels', query: { org_id: orgId } },
        { name: 'Carousel Slides', table: 'carousel_slides', joinQuery: true },
        { name: 'Case Studies', table: 'case_studies', query: { org_id: orgId, is_published: true } },
        { name: 'Case Study Sections', table: 'case_study_sections', joinQuery: true }
    ];

    console.log('\n\nSTEP 2: Testing Each Section');
    console.log('-'.repeat(80));

    for (const section of sections) {
        console.log(`\n📊 ${section.name} (${section.table})`);
        
        try {
            let query = supabase.from(section.table).select('*');
            
            if (section.joinQuery) {
                // For joined tables, just try to fetch all
                query = query.limit(10);
            } else {
                // Apply filters
                Object.entries(section.query).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            const { data, error } = await query;

            if (error) {
                console.log(`   ❌ RLS BLOCKING: ${error.message}`);
                results.sections[section.name] = { status: 'blocked', error: error.message };
                results.errors.push({ step: section.name, error: error.message });
            } else if (!data || data.length === 0) {
                console.log(`   ⚠️  NO DATA (table empty or no match)`);
                results.sections[section.name] = { status: 'empty', count: 0 };
                results.warnings.push({ step: section.name, warning: 'No data' });
            } else {
                console.log(`   ✅ SUCCESS: ${data.length} record(s)`);
                results.sections[section.name] = { status: 'success', count: data.length };
                
                // Show sample data
                if (data.length > 0) {
                    const sample = data[0];
                    const keys = Object.keys(sample).slice(0, 3);
                    console.log(`      Sample: ${keys.map(k => `${k}=${sample[k]}`).join(', ')}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ EXCEPTION: ${error.message}`);
            results.sections[section.name] = { status: 'error', error: error.message };
            results.errors.push({ step: section.name, error: error.message });
        }
    }

    // Step 3: Test the exact queries used by HomePage
    console.log('\n\nSTEP 3: Testing HomePage Queries');
    console.log('-'.repeat(80));

    // Test getProjects query
    console.log('\n📊 getProjects() Query:');
    try {
        const { data, error } = await supabase
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

        if (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            results.errors.push({ step: 'getProjects', error: error.message });
        } else if (!data || data.length === 0) {
            console.log(`   ⚠️  NO PROJECTS RETURNED`);
            results.warnings.push({ step: 'getProjects', warning: 'No projects' });
        } else {
            console.log(`   ✅ SUCCESS: ${data.length} project(s)`);
            data.forEach(p => console.log(`      - ${p.title}`));
        }
    } catch (error) {
        console.log(`   ❌ EXCEPTION: ${error.message}`);
        results.errors.push({ step: 'getProjects', error: error.message });
    }

    // Test getPublicProjects query
    console.log('\n📊 getPublicProjects() Query:');
    try {
        const { data, error } = await supabase
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
            .eq('org_id', orgId)
            .eq('is_published', true);

        if (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            results.errors.push({ step: 'getPublicProjects', error: error.message });
        } else if (!data || data.length === 0) {
            console.log(`   ⚠️  NO PROJECTS RETURNED`);
            
            // Debug: Check what case studies exist
            const { data: allCS } = await supabase
                .from('case_studies')
                .select('case_study_id, title, org_id, is_published');
            
            console.log(`\n   🔍 Debug: All case studies in database:`);
            if (allCS && allCS.length > 0) {
                allCS.forEach(cs => {
                    const orgMatch = cs.org_id === orgId ? '✅' : '❌';
                    const pubMatch = cs.is_published ? '✅' : '❌';
                    console.log(`      - ${cs.title}`);
                    console.log(`        org_id: ${cs.org_id} ${orgMatch} (need: ${orgId})`);
                    console.log(`        published: ${cs.is_published} ${pubMatch}`);
                });
            } else {
                console.log(`      No case studies found in database`);
            }
            
            results.warnings.push({ step: 'getPublicProjects', warning: 'No projects' });
        } else {
            console.log(`   ✅ SUCCESS: ${data.length} project(s)`);
            data.forEach(p => console.log(`      - ${p.title}`));
        }
    } catch (error) {
        console.log(`   ❌ EXCEPTION: ${error.message}`);
        results.errors.push({ step: 'getPublicProjects', error: error.message });
    }

    return results;
}

async function generateReport() {
    const results = await testPublicAccess();

    console.log('\n\n');
    console.log('='.repeat(80));
    console.log('📋 RCA SUMMARY REPORT');
    console.log('='.repeat(80));

    // Profile Status
    console.log('\n1️⃣  PROFILE STATUS:');
    if (results.profile) {
        console.log(`   ✅ Public profile found: ${results.profile.username}`);
        console.log(`   📍 Org ID: ${results.profile.org_id}`);
    } else {
        console.log(`   ❌ No public profile found`);
    }

    // Section Status
    console.log('\n2️⃣  SECTION STATUS:');
    const successful = Object.entries(results.sections).filter(([_, v]) => v.status === 'success');
    const blocked = Object.entries(results.sections).filter(([_, v]) => v.status === 'blocked');
    const empty = Object.entries(results.sections).filter(([_, v]) => v.status === 'empty');

    console.log(`   ✅ Working: ${successful.length} sections`);
    successful.forEach(([name, data]) => {
        console.log(`      - ${name}: ${data.count} records`);
    });

    if (blocked.length > 0) {
        console.log(`\n   ❌ Blocked by RLS: ${blocked.length} sections`);
        blocked.forEach(([name, data]) => {
            console.log(`      - ${name}: ${data.error}`);
        });
    }

    if (empty.length > 0) {
        console.log(`\n   ⚠️  Empty: ${empty.length} sections`);
        empty.forEach(([name]) => {
            console.log(`      - ${name}`);
        });
    }

    // Critical Errors
    if (results.errors.length > 0) {
        console.log('\n3️⃣  CRITICAL ERRORS:');
        results.errors.forEach(err => {
            console.log(`   ❌ ${err.step}: ${err.error}`);
        });
    }

    // Root Cause Analysis
    console.log('\n4️⃣  ROOT CAUSE ANALYSIS:');
    
    if (blocked.length > 0) {
        console.log('\n   🔴 RLS POLICIES BLOCKING ACCESS');
        console.log('   Cause: Row Level Security policies not configured for public read');
        console.log('   Solution: Run FIX_PUBLIC_PORTFOLIO_RLS.sql');
    }

    if (empty.length > 0 && blocked.length === 0) {
        console.log('\n   🟡 DATA NOT POPULATED');
        console.log('   Cause: Tables exist but no data added');
        console.log('   Solution: Add content via admin panel');
    }

    const caseStudyIssue = results.sections['Case Studies'];
    if (caseStudyIssue && (caseStudyIssue.status === 'empty' || caseStudyIssue.status === 'blocked')) {
        console.log('\n   🔴 CASE STUDIES NOT ACCESSIBLE');
        if (caseStudyIssue.status === 'blocked') {
            console.log('   Cause: RLS policy blocking access');
            console.log('   Solution: Run FIX_PUBLIC_PORTFOLIO_RLS.sql');
        } else {
            console.log('   Cause: org_id mismatch or not published');
            console.log('   Solution: Run RUN_THIS_TO_FIX_CASE_STUDIES.sql');
        }
    }

    // Action Items
    console.log('\n5️⃣  ACTION ITEMS:');
    let actionNumber = 1;
    
    if (blocked.length > 0) {
        console.log(`   ${actionNumber}. Run FIX_PUBLIC_PORTFOLIO_RLS.sql in Supabase SQL Editor`);
        actionNumber++;
    }
    
    if (caseStudyIssue && caseStudyIssue.status === 'empty') {
        console.log(`   ${actionNumber}. Run RUN_THIS_TO_FIX_CASE_STUDIES.sql to fix org_id`);
        actionNumber++;
    }
    
    if (empty.length > 0 && blocked.length === 0) {
        console.log(`   ${actionNumber}. Add content to empty sections via admin panel`);
        actionNumber++;
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ RCA COMPLETE');
    console.log('='.repeat(80));
}

generateReport().catch(console.error);
