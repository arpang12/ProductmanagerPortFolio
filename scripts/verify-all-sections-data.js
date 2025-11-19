// Verify all priority sections have data
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 VERIFYING ALL PRIORITY SECTIONS DATA');
console.log('='.repeat(60));

async function verifyAllSectionsData() {
    // Get admin user data
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id, username, name')
        .eq('username', 'admin')
        .single();
    
    if (!profile) {
        console.log('❌ Admin profile not found');
        return;
    }
    
    console.log(`✅ Testing sections for: ${profile.name} (@${profile.username})`);
    console.log(`   Org ID: ${profile.org_id}`);
    
    const sections = [
        {
            name: '1. My Story',
            table: 'story_sections',
            query: () => supabase
                .from('story_sections')
                .select(`
                    story_id, title, subtitle, image_alt,
                    story_paragraphs (paragraph_id, content, order_index)
                `)
                .eq('org_id', profile.org_id)
                .single()
        },
        {
            name: '2. Magic Toolbox (Skills)',
            table: 'skill_categories',
            query: () => supabase
                .from('skill_categories')
                .select(`
                    category_id, title, icon, color,
                    skills (skill_id, name, level)
                `)
                .eq('org_id', profile.org_id)
        },
        {
            name: '3. Enhanced Tools I Wield (Tools)',
            table: 'tools',
            query: () => supabase
                .from('tools')
                .select('tool_id, name, icon, color')
                .eq('org_id', profile.org_id)
        },
        {
            name: '4. Magical Projects',
            table: 'case_studies',
            query: () => supabase
                .from('case_studies')
                .select('case_study_id, title, is_published, created_at')
                .eq('org_id', profile.org_id)
                .eq('is_published', true)
        },
        {
            name: '5. My Journey',
            table: 'journey_timelines',
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
            name: '6. Download CV',
            table: 'cv_sections',
            query: () => supabase
                .from('cv_sections')
                .select('cv_id, title, file_url, file_name')
                .eq('org_id', profile.org_id)
                .single()
        },
        {
            name: '7. Contact Me',
            table: 'contact_sections',
            query: () => supabase
                .from('contact_sections')
                .select('contact_id, title, email, phone, location')
                .eq('org_id', profile.org_id)
                .single()
        }
    ];
    
    console.log('\n📊 SECTION DATA VERIFICATION:');
    console.log('-'.repeat(60));
    
    const results = [];
    
    for (const section of sections) {
        try {
            const { data, error } = await section.query();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                console.log(`❌ ${section.name}: ERROR - ${error.message}`);
                results.push({ ...section, status: 'error', error: error.message });
            } else if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log(`⚠️  ${section.name}: NO DATA`);
                results.push({ ...section, status: 'empty', data: null });
            } else {
                const count = Array.isArray(data) ? data.length : 1;
                console.log(`✅ ${section.name}: ${count} item(s)`);
                
                // Show sample data
                if (Array.isArray(data)) {
                    data.slice(0, 2).forEach((item, index) => {
                        const title = item.title || item.name || item.company || 'Item';
                        console.log(`   ${index + 1}. ${title}`);
                    });
                } else {
                    const title = data.title || data.name || 'Found';
                    console.log(`   - ${title}`);
                }
                
                results.push({ ...section, status: 'success', data, count });
            }
        } catch (err) {
            console.log(`❌ ${section.name}: EXCEPTION - ${err.message}`);
            results.push({ ...section, status: 'exception', error: err.message });
        }
    }
    
    console.log('\n📈 SUMMARY REPORT:');
    console.log('-'.repeat(60));
    
    const successful = results.filter(r => r.status === 'success');
    const empty = results.filter(r => r.status === 'empty');
    const errors = results.filter(r => r.status === 'error' || r.status === 'exception');
    
    console.log(`✅ Sections with data: ${successful.length}/7`);
    console.log(`⚠️  Empty sections: ${empty.length}/7`);
    console.log(`❌ Error sections: ${errors.length}/7`);
    
    if (empty.length > 0) {
        console.log('\n⚠️  EMPTY SECTIONS NEED ATTENTION:');
        empty.forEach(section => {
            console.log(`   - ${section.name}: Add data in admin panel`);
        });
    }
    
    if (errors.length > 0) {
        console.log('\n❌ ERROR SECTIONS NEED FIXING:');
        errors.forEach(section => {
            console.log(`   - ${section.name}: ${section.error}`);
        });
    }
    
    console.log('\n🎯 PORTFOLIO COMPLETENESS:');
    const completeness = Math.round((successful.length / 7) * 100);
    console.log(`   ${completeness}% complete (${successful.length}/7 sections)`);
    
    if (completeness >= 80) {
        console.log('   🌟 Excellent! Portfolio is well-populated');
    } else if (completeness >= 60) {
        console.log('   👍 Good! Add a few more sections for completeness');
    } else {
        console.log('   📝 Needs work! Add more content to showcase your portfolio');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Fix any error sections above');
    console.log('2. Add content to empty sections via admin panel');
    console.log('3. Test public portfolio: http://localhost:3002/u/admin');
    console.log('4. Verify all sections display correctly');
}

verifyAllSectionsData().catch(console.error);