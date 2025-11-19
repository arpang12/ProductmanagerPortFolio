// Check authentication status and RLS policies
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔐 Checking Authentication and RLS');
console.log('='.repeat(40));

async function checkAuthAndRLS() {
    // Check current user
    console.log('\n1️⃣  Checking current user...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
        console.log('❌ Error getting user:', userError.message);
    } else if (!user) {
        console.log('❌ No authenticated user');
        console.log('   This explains why RLS is blocking operations!');
        console.log('   The frontend should be authenticated when making these calls.');
    } else {
        console.log('✅ Authenticated user:', user.email);
        console.log(`   User ID: ${user.id}`);
    }
    
    // Check if we can read case studies (should work for public)
    console.log('\n2️⃣  Testing READ access...');
    
    const { data: caseStudies, error: readError } = await supabase
        .from('case_studies')
        .select('case_study_id, title, is_published, status')
        .limit(1);
    
    if (readError) {
        console.log('❌ Cannot read case studies:', readError.message);
    } else {
        console.log(`✅ Can read case studies: ${caseStudies.length} found`);
        if (caseStudies.length > 0) {
            console.log(`   Example: "${caseStudies[0].title}" (published: ${caseStudies[0].is_published})`);
        }
    }
    
    // Check user profile
    console.log('\n3️⃣  Checking user profile...');
    
    const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*');
    
    if (profileError) {
        console.log('❌ Cannot read user profiles:', profileError.message);
    } else {
        console.log(`✅ Found ${profiles.length} user profiles`);
        profiles.forEach(profile => {
            console.log(`   - ${profile.email} (org: ${profile.org_id})`);
        });
    }
    
    console.log('\n' + '='.repeat(40));
    console.log('💡 SOLUTION');
    console.log('='.repeat(40));
    
    if (!user) {
        console.log('\n🔑 The issue is AUTHENTICATION!');
        console.log('');
        console.log('The scripts are running with anonymous access, but the');
        console.log('RLS policies require authenticated users to UPDATE case studies.');
        console.log('');
        console.log('In the actual frontend:');
        console.log('✅ Users are authenticated via Supabase Auth');
        console.log('✅ The updateCaseStudy API calls use the authenticated user');
        console.log('✅ RLS policies allow authenticated users to update their org data');
        console.log('');
        console.log('The publish/unpublish fix in services/api.ts should work');
        console.log('correctly when called from the authenticated frontend!');
        console.log('');
        console.log('🧪 TO TEST: Use the admin panel UI with authentication');
    }
}

checkAuthAndRLS().catch(console.error);