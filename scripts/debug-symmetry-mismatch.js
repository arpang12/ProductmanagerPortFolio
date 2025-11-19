// Debug the symmetry mismatch issue
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debugging Symmetry Mismatch');
console.log('='.repeat(50));

async function debugSymmetryMismatch() {
    console.log('\n1️⃣  Testing Direct Case Studies Query...');
    
    // Direct query like the backend test
    const { data: directCaseStudies, error: directError } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, org_id')
        .eq('is_published', true);
    
    console.log('Direct query result:', {
        count: directCaseStudies?.length || 0,
        error: directError?.message,
        data: directCaseStudies
    });
    
    console.log('\n2️⃣  Testing getPublicProjects API Method Equivalent...');
    
    // Find the admin user's org_id
    const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('org_id, username')
        .eq('username', 'admin')
        .single();
    
    console.log('Admin profile:', adminProfile);
    
    if (adminProfile) {
        // Test the exact query that getPublicProjects uses
        const { data: publicProjects, error: publicError } = await supabase
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
            .eq('org_id', adminProfile.org_id)
            .eq('is_published', true);
        
        console.log('getPublicProjects equivalent result:', {
            count: publicProjects?.length || 0,
            error: publicError?.message,
            data: publicProjects?.map(p => ({ 
                id: p.case_study_id, 
                title: p.title, 
                sections: p.case_study_sections?.length 
            }))
        });
        
        console.log('\n3️⃣  Testing Case Study Sections...');
        
        if (publicProjects && publicProjects.length > 0) {
            const caseStudy = publicProjects[0];
            console.log('First case study details:', {
                id: caseStudy.case_study_id,
                title: caseStudy.title,
                org_id: caseStudy.org_id,
                is_published: caseStudy.is_published,
                sections_count: caseStudy.case_study_sections?.length || 0,
                sections: caseStudy.case_study_sections?.map(s => ({
                    id: s.section_id,
                    type: s.section_type,
                    enabled: s.enabled
                }))
            });
        }
    }
    
    console.log('\n4️⃣  Testing RLS Policy Directly...');
    
    // Test if RLS is blocking the inner join
    const { data: sectionsTest, error: sectionsError } = await supabase
        .from('case_study_sections')
        .select('section_id, case_study_id, section_type')
        .limit(5);
    
    console.log('Case study sections access:', {
        count: sectionsTest?.length || 0,
        error: sectionsError?.message,
        sample: sectionsTest?.slice(0, 2)
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 DIAGNOSIS RESULTS');
    console.log('='.repeat(50));
    
    if (directCaseStudies?.length > 0 && (!publicProjects || publicProjects.length === 0)) {
        console.log('\n❌ ISSUE IDENTIFIED: getPublicProjects method failing');
        console.log('   - Direct case_studies query works');
        console.log('   - getPublicProjects query with inner join fails');
        console.log('   - Likely issue: case_study_sections RLS policy or inner join');
        
        if (sectionsError) {
            console.log('   - case_study_sections access blocked by RLS');
            console.log('   - Need to fix case_study_sections RLS policy');
        }
    } else if (directCaseStudies?.length === publicProjects?.length) {
        console.log('\n✅ NO ISSUE: Both queries return same count');
        console.log('   - Issue might be in the React app API call');
    } else {
        console.log('\n⚠️  PARTIAL ISSUE: Different results between queries');
    }
}

debugSymmetryMismatch().catch(console.error);