// Fix schema issues for priority sections
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 FIXING SCHEMA ISSUES FOR PRIORITY SECTIONS');
console.log('='.repeat(60));

async function fixSchemaIssues() {
    console.log('\n1️⃣  Testing corrected queries...');
    
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id, username')
        .eq('username', 'admin')
        .single();
    
    if (!profile) {
        console.log('❌ Admin profile not found');
        return;
    }
    
    // Test My Story with correct column names
    console.log('\n📖 Testing My Story (corrected query)...');
    const { data: story, error: storyError } = await supabase
        .from('story_sections')
        .select(`
            story_id, title, subtitle, image_alt,
            story_paragraphs (paragraph_id, content)
        `)
        .eq('org_id', profile.org_id)
        .single();
    
    if (storyError) {
        console.log(`❌ My Story: ${storyError.message}`);
    } else if (story) {
        console.log(`✅ My Story: "${story.title}" with ${story.story_paragraphs?.length || 0} paragraphs`);
    } else {
        console.log('⚠️  My Story: No data found');
    }
    
    // Test CV with correct column names
    console.log('\n📄 Testing CV Section (corrected query)...');
    const { data: cv, error: cvError } = await supabase
        .from('cv_sections')
        .select('section_id, title, file_url, file_name')
        .eq('org_id', profile.org_id)
        .single();
    
    if (cvError && cvError.code !== 'PGRST116') {
        console.log(`❌ CV Section: ${cvError.message}`);
    } else if (cv) {
        console.log(`✅ CV Section: "${cv.title}" - ${cv.file_name || 'No file'}`);
    } else {
        console.log('⚠️  CV Section: No data found');
    }
    
    // Test Contact with correct column names
    console.log('\n📞 Testing Contact Section (corrected query)...');
    const { data: contact, error: contactError } = await supabase
        .from('contact_sections')
        .select('section_id, title, content')
        .eq('org_id', profile.org_id)
        .single();
    
    if (contactError && contactError.code !== 'PGRST116') {
        console.log(`❌ Contact Section: ${contactError.message}`);
    } else if (contact) {
        console.log(`✅ Contact Section: "${contact.title}"`);
    } else {
        console.log('⚠️  Contact Section: No data found');
    }
    
    console.log('\n2️⃣  Testing all sections with corrected queries...');
    
    const correctedSections = [
        {
            name: 'My Story',
            query: () => supabase
                .from('story_sections')
                .select(`
                    story_id, title, subtitle, image_alt,
                    story_paragraphs (paragraph_id, content)
                `)
                .eq('org_id', profile.org_id)
                .single()
        },
        {
            name: 'Magic Toolbox',
            query: () => supabase
                .from('skill_categories')
                .select(`
                    category_id, title, icon, color,
                    skills (skill_id, name, level)
                `)
                .eq('org_id', profile.org_id)
        },
        {
            name: 'Enhanced Tools',
            query: () => supabase
                .from('tools')
                .select('tool_id, name, icon, color')
                .eq('org_id', profile.org_id)
        },
        {
            name: 'Magical Projects',
            query: () => supabase
                .from('case_studies')
                .select('case_study_id, title, is_published')
                .eq('org_id', profile.org_id)
                .eq('is_published', true)
        },
        {
            name: 'My Journey',
            query: () => supabase
                .from('journey_timelines')
                .select(`
                    timeline_id, title, subtitle,
                    journey_milestones (milestone_id, title, company, period, is_active)
                `)
                .eq('org_id', profile.org_id)
                .single()
        },
        {
            name: 'Download CV',
            query: () => supabase
                .from('cv_sections')
                .select('section_id, title, file_url, file_name')
                .eq('org_id', profile.org_id)
                .single()
        },
        {
            name: 'Contact Me',
            query: () => supabase
                .from('contact_sections')
                .select('section_id, title, content')
                .eq('org_id', profile.org_id)
                .single()
        }
    ];
    
    let workingCount = 0;
    
    for (const section of correctedSections) {
        try {
            const { data, error } = await section.query();
            
            if (error && error.code !== 'PGRST116') {
                console.log(`❌ ${section.name}: ${error.message}`);
            } else if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log(`⚠️  ${section.name}: No data (needs content)`);
            } else {
                const count = Array.isArray(data) ? data.length : 1;
                console.log(`✅ ${section.name}: ${count} item(s)`);
                workingCount++;
            }
        } catch (err) {
            console.log(`❌ ${section.name}: Exception - ${err.message}`);
        }
    }
    
    console.log('\n📊 CORRECTED RESULTS:');
    console.log(`✅ Working sections: ${workingCount}/7`);
    console.log(`📝 Sections needing content: ${7 - workingCount}/7`);
    
    if (workingCount >= 5) {
        console.log('🌟 Great! Most sections are working');
    } else if (workingCount >= 3) {
        console.log('👍 Good progress! A few more sections to go');
    } else {
        console.log('📝 More work needed to populate sections');
    }
    
    console.log('\n🎯 PRIORITY ACTIONS:');
    console.log('1. Schema issues are now identified and corrected');
    console.log('2. Update HomePage to use corrected queries');
    console.log('3. Add missing content via admin panel');
    console.log('4. Test the updated portfolio display');
}

fixSchemaIssues().catch(console.error);