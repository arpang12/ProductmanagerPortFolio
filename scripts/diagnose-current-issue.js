import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseCurrentIssue() {
  console.log('🔍 Diagnosing Current Profile Settings Issue...\n');
  
  try {
    // Step 1: Check authentication
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated');
      return;
    }
    
    console.log('✅ Authenticated as:', user.id);
    
    // Step 2: Check if organization exists
    console.log('\n2. Checking organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_id', user.id);
    
    if (orgError) {
      console.log('❌ Organization query failed:', orgError.message);
      console.log('This suggests RLS policies are blocking access');
    } else {
      console.log('✅ Organization query successful');
      console.log('Organizations found:', org?.length || 0);
      if (org?.length > 0) {
        console.log('Organization data:', org[0]);
      }
    }
    
    // Step 3: Check if profile exists
    console.log('\n3. Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id);
    
    if (profileError) {
      console.log('❌ Profile query by user_id failed:', profileError.message);
    } else {
      console.log('✅ Profile query by user_id successful');
      console.log('Profiles found:', profile?.length || 0);
      if (profile?.length > 0) {
        console.log('Profile data:', profile[0]);
      }
    }
    
    // Step 4: Check profile by org_id (what the API uses)
    console.log('\n4. Checking profile by org_id...');
    const { data: profileByOrg, error: profileByOrgError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', user.id);
    
    if (profileByOrgError) {
      console.log('❌ Profile query by org_id failed:', profileByOrgError.message);
      console.log('Error code:', profileByOrgError.code);
      
      if (profileByOrgError.code === 'PGRST301') {
        console.log('🚨 This is a 406 Not Acceptable error - RLS is blocking access');
      }
    } else {
      console.log('✅ Profile query by org_id successful');
      console.log('Profiles found:', profileByOrg?.length || 0);
      if (profileByOrg?.length > 0) {
        console.log('Profile data:', profileByOrg[0]);
      }
    }
    
    // Step 5: Check RLS policies
    console.log('\n5. Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'user_profiles' })
      .select('*');
    
    if (policyError) {
      console.log('❌ Cannot check policies:', policyError.message);
    } else {
      console.log('✅ Policies check successful');
      console.log('Policies found:', policies?.length || 0);
    }
    
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('===================');
    
    if (profileError && profileError.code === 'PGRST301') {
      console.log('🚨 ISSUE: RLS policies are blocking profile access');
      console.log('💡 SOLUTION: Apply the SQL fix in Supabase Dashboard');
      console.log('   File: APPLY_PROFILE_SETTINGS_FIX.sql');
    } else if (profile?.length > 0 && profileByOrg?.length === 0) {
      console.log('🚨 ISSUE: Profile exists with user_id but not accessible by org_id');
      console.log('💡 SOLUTION: Update existing profile to match org_id');
    } else if (profile?.length > 0 && profileByOrg?.length > 0) {
      console.log('✅ Profile exists and is accessible');
      console.log('🤔 The issue might be in the component logic or API method');
    } else {
      console.log('📝 No profile exists - this is normal for new users');
      console.log('💡 The API should create a profile automatically');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

diagnoseCurrentIssue().catch(console.error);