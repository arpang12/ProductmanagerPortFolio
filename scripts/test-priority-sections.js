// Test all priority sections are working correctly
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🎯 TESTING ALL PRIORITY SECTIONS');
console.log('='.repeat(60));

async function testPrioritySections() {
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id, username, name')
        .eq('username', 'admin')
        .single();
    
    if (!profile) {
        console.log('❌ Admin profile not found');
        return;
    }
    
    console.log(`✅ Testing priority sections for: ${profile.name} (@${profile.username})`);
    
    const prioritySections = [
        {
            name: '1. My Story',
            priority: 'HIGH',
            test: async () => {
                const { data, error } = await supabase
                    .from('story_sections')
                    .select(`
                        story_id, title, subtitle,
                        story_paragraphs (paragraph_id, content)
                    `)
                    .eq('org_id', profile.org_id)
                    .single();
                
                return {
                    success: !error && data,
                    data: data,
                    error: error?.message,
                    count: data?.story_paragraphs?.length || 0
                };
            }
        },
        {
            name: '2. Magic Toolbox',
            priority: 'HIGH',
            test: async () => {
                const { data, error } = await supabase
                    .from('skill_categories')
                    .select(`
                        category_id, title, icon, color,
                        skills (skill_id, name, level)
                    `)
                    .eq('org_id', profile.org_id);
                
                return {
                    success: !error && data && data.length > 0,
                    data: data,
                    error: error?.message,
                    count: data?.length || 0
                };
            }
        },
        {
            name: '3. Enhanced Tools I Wield',
            priority: 'HIGH',
            test: async () => {
                const { data, error } = await supabase
                    .from('tools')
                    .select('tool_id, name, icon, color')
                    .eq('org_id', profile.org_id);
                
                return {
                    success: !error && data && data.length > 0,
                    data: data,
                    error: error?.message,
                    count: data?.length || 0
                };
            }
        },
        {
            name: '4. Magical Projects',
            priority: 'HIGH',
            test: async () => {
                const { data, error } = await supabase
                    .from('case_studies')
                    .select('case_study_id, title, is_published')
                    .eq('org_id', profile.org_id)
                    .eq('is_published', true);
                
                return {
                    success: !error && data && data.length > 0,
                    data: data,
                    error: error?.message,
                    count: data?.length || 0
                };
            }
        },
        {
            name: '5. My Journey',
            priority: 'HIGH',
            test: async () => {
                const { data, error } = await supabase
                    .from('journey_timelines')
                    .select(`
                        timeline_id, title, subtitle,
                        journey_milestones (milestone_id, title, company, is_active)
                    `)
                    .eq('org_id', profile.org_id)
                    .single();
                
                return {
                    success: !error && data,
                    data: data,
                    error: error?.message,
                    count: data?.journey_milestones?.length || 0
                };
            }
        },
        {
            name: '6. Magical Journeys',
            priority: 'MEDIUM',
            test: async () => {
                // This is the carousel section - always available
                return {
                    success: true,
                    data: { type: 'carousel', available: true },
                    error: null,
                    count: 1
                };
            }
        },
        {
            name: '7. Download CV',
            priority: 'MEDIUM',
            test: async () => {
                const { data, error } = await supabase
                    .from('cv_sections')
                    .select('cv_section_id, title, subtitle, description')
                    .eq('org_id', profile.org_id)
                    .single();
                
                return {
                    success: !error && data,
                    data: data,
                    error: error?.message,
                    count: data ? 1 : 0
                };
            }
        },
        {
            name: '8. Contact Me',
            priority: 'HIGH',
            test: async () => {
                const { data, error } = await supabase
                    .from('contact_sections')
                    .select('contact_id, title, subtitle, description, email, location')
                    .eq('org_id', profile.org_id)
                    .single();
                
                return {
                    success: !error && data,
                    data: data,
                    error: error?.message,
                    count: data ? 1 : 0
                };
            }
        }
    ];
    
    console.log('\n📊 PRIORITY SECTIONS TEST RESULTS:');
    console.log('-'.repeat(60));
    
    const results = [];
    
    for (const section of prioritySections) {
        try {
            const result = await section.test();
            
            const status = result.success ? '✅' : '❌';
            const priority = section.priority === 'HIGH' ? '🔥' : '📋';
            
            console.log(`${status} ${priority} ${section.name}: ${result.success ? 'WORKING' : 'NEEDS ATTENTION'}`);
            
            if (result.success) {
                if (result.count > 0) {
                    console.log(`   📈 ${result.count} item(s) available`);
                } else {
                    console.log('   ✨ Section available');
                }
            } else {
                console.log(`   ⚠️  ${result.error || 'No data found'}`);
            }
            
            results.push({
                ...section,
                ...result
            });
            
        } catch (err) {
            console.log(`❌ 🔥 ${section.name}: EXCEPTION - ${err.message}`);
            results.push({
                ...section,
                success: false,
                error: err.message
            });
        }
    }
    
    console.log('\n📈 PRIORITY SECTIONS SUMMARY:');
    console.log('-'.repeat(60));
    
    const highPriority = results.filter(r => r.priority === 'HIGH');
    const mediumPriority = results.filter(r => r.priority === 'MEDIUM');
    
    const highWorking = highPriority.filter(r => r.success).length;
    const mediumWorking = mediumPriority.filter(r => r.success).length;
    
    console.log(`🔥 HIGH PRIORITY: ${highWorking}/${highPriority.length} working`);
    console.log(`📋 MEDIUM PRIORITY: ${mediumWorking}/${mediumPriority.length} working`);
    
    const totalWorking = results.filter(r => r.success).length;
    const completeness = Math.round((totalWorking / results.length) * 100);
    
    console.log(`\n🎯 OVERALL COMPLETENESS: ${completeness}% (${totalWorking}/${results.length} sections)`);
    
    if (completeness >= 80) {
        console.log('🌟 EXCELLENT! Portfolio is well-populated and ready to showcase');
    } else if (completeness >= 60) {
        console.log('👍 GOOD! Most sections working, add a few more for completeness');
    } else {
        console.log('📝 NEEDS WORK! Add more content to make portfolio shine');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    
    const highPriorityIssues = highPriority.filter(r => !r.success);
    if (highPriorityIssues.length > 0) {
        console.log('1. 🔥 Fix HIGH PRIORITY sections first:');
        highPriorityIssues.forEach(section => {
            console.log(`   - ${section.name}: ${section.error || 'Add content'}`);
        });
    }
    
    const mediumPriorityIssues = mediumPriority.filter(r => !r.success);
    if (mediumPriorityIssues.length > 0) {
        console.log('2. 📋 Then address MEDIUM PRIORITY sections:');
        mediumPriorityIssues.forEach(section => {
            console.log(`   - ${section.name}: ${section.error || 'Add content'}`);
        });
    }
    
    console.log('3. 🌐 Test public portfolio: http://localhost:3002/u/admin');
    console.log('4. 🔐 Test authenticated view: http://localhost:3002/ (logged in)');
    
    console.log('\n💡 PORTFOLIO IMPACT:');
    if (highWorking >= 4) {
        console.log('✅ Strong foundation - visitors will see substantial content');
    } else {
        console.log('⚠️  Weak foundation - add more HIGH PRIORITY content first');
    }
    
    if (totalWorking >= 6) {
        console.log('✅ Professional appearance - ready for sharing');
    } else {
        console.log('📝 Needs more content before sharing publicly');
    }
}

testPrioritySections().catch(console.error);