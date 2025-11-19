// Test if youremailgf fix works
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing youremailgf Fix\n');
console.log('='.repeat(50));

async function testFix() {
    const username = 'youremailgf';
    
    // Get profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('username', username)
        .single();
    
    if (!profile) {
        console.log('❌ Profile not found');
        return;
    }
    
    const orgId = profile.org_id;
    console.log(`Testing org_id: ${orgId}\n`);
    
    // Test fixed queries
    const tests = [
        {
            name: 'Story',
            query: () => supabase
                .from('story_sections')
                .select('story_id, title, subtitle, image_alt, image_asset_id')
                .eq('org_id', orgId)
                .limit(1)
                .single()
        },
        {
            name: 'Skill Categories',
            query: () => supabase
                .from('skill_categories')
                .select('category_id, title, order_key')
                .eq('org_id', orgId)
                .order('order_key')
        },
        {
            name: 'Journey',
            query: () => supabase
                .from('journey_timelines')
                .select(`
                    timeline_id,
                    title,
                    journey_milestones (
                        milestone_id,
                        title,
                        order_key
                    )
                `)
                .eq('org_id', orgId)
                .limit(1)
                .single()
        },
        {
            name: 'Contact',
            query: () => supabase
                .from('contact_sections')
                .select(`
                    contact_id,
                    title,
                    social_links (
                        link_id,
                        name,
                        order_key
                    )
                `)
                .eq('org_id', orgId)
                .limit(1)
                .single()
        },
        {
            name: 'CV',
            query: () => supabase
                .from('cv_sections')
                .select(`
                    cv_section_id,
                    title,
                    cv_versions (
                        cv_version_id,
                        name,
                        order_key
                    )
                `)
                .eq('org_id', orgId)
                .limit(1)
                .single()
        }
    ];
    
    for (const test of tests) {
        try {
            const { data, error } = await test.query();
            
            if (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
            } else if (!data) {
                console.log(`⚠️  ${test.name}: No data`);
            } else {
                console.log(`✅ ${test.name}: Working`);
            }
        } catch (err) {
            console.log(`❌ ${test.name}: ${err.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 RESULT\n');
    console.log('If all tests show ✅ or ⚠️ (no ❌):');
    console.log('  → http://localhost:3002/u/youremailgf should work!');
    console.log('\nIf you see ❌ errors:');
    console.log('  → Check the error messages above');
    console.log('  → May need additional column fixes');
}

testFix().catch(console.error);