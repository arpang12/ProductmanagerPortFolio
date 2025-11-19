// Debug the API methods to see what they return
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debugging API Methods');
console.log('='.repeat(50));

// Simulate the getProjects method (authenticated)
async function simulateGetProjects() {
    console.log('\n1️⃣  Simulating getProjects() (authenticated method)...');
    
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
        .eq('is_published', true)
        .order('created_at', { ascending: false });
    
    console.log('getProjects result:', {
        count: data?.length || 0,
        error: error?.message,
        titles: data?.map(p => p.title)
    });
    
    return data || [];
}

// Simulate the getPublicProjects method
async function simulateGetPublicProjects(orgId) {
    console.log('\n2️⃣  Simulating getPublicProjects() (public method)...');
    
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
    
    console.log('getPublicProjects result:', {
        count: data?.length || 0,
        error: error?.message,
        titles: data?.map(p => p.title)
    });
    
    return data || [];
}

async function debugApiMethods() {
    // Get admin profile
    const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('org_id, username')
        .eq('username', 'admin')
        .single();
    
    console.log('Admin profile:', adminProfile);
    
    if (!adminProfile) {
        console.log('❌ Admin profile not found');
        return;
    }
    
    // Test both methods
    const authProjects = await simulateGetProjects();
    const publicProjects = await simulateGetPublicProjects(adminProfile.org_id);
    
    console.log('\n3️⃣  Comparison Results...');
    console.log(`Auth projects count: ${authProjects.length}`);
    console.log(`Public projects count: ${publicProjects.length}`);
    
    if (authProjects.length !== publicProjects.length) {
        console.log('❌ COUNT MISMATCH DETECTED');
        console.log('Auth projects:', authProjects.map(p => ({ id: p.case_study_id, title: p.title, org_id: p.org_id })));
        console.log('Public projects:', publicProjects.map(p => ({ id: p.case_study_id, title: p.title, org_id: p.org_id })));
        
        // Check if it's an org_id filtering issue
        console.log('\n4️⃣  Checking org_id filtering...');
        const authProjectsForOrg = authProjects.filter(p => p.org_id === adminProfile.org_id);
        console.log(`Auth projects for org ${adminProfile.org_id}: ${authProjectsForOrg.length}`);
        
        if (authProjectsForOrg.length === publicProjects.length) {
            console.log('✅ ISSUE IDENTIFIED: getProjects() returns ALL projects, not just current user\'s');
            console.log('   - getProjects() should filter by current user\'s org_id');
            console.log('   - getPublicProjects() correctly filters by org_id');
        }
    } else {
        console.log('✅ Both methods return same count');
    }
}

debugApiMethods().catch(console.error);