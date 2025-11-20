import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testProfileSettingsFix() {
  console.log('🧪 Testing Profile Settings Fix...\n');
  
  try {
    // Step 1: Try to sign up or login
    console.log('1. Attempting to sign up/login...');
    
    // First try to sign up
    let authData;
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signupError && !signupError.message.includes('already registered')) {
      console.error('❌ Signup failed:', signupError.message);
      return;
    }
    
    // Now try to login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }
    
    authData = loginData;
    
    console.log('✅ Login successful');
    console.log('User ID:', authData.user.id);
    
    // Step 2: Test getUserOrgId logic
    console.log('\n2. Testing getUserOrgId logic...');
    const { data: { user } } = await supabase.auth.getUser();
    const orgId = user?.id;
    console.log('Org ID (user.id):', orgId);
    
    // Step 3: Check current profile
    console.log('\n3. Checking current profile...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    if (profileError) {
      console.log('Profile error:', profileError.message);
      console.log('Error code:', profileError.code);
      
      if (profileError.code === 'PGRST116') {
        console.log('📝 No profile exists - this is expected for new users');
      } else if (profileError.message.includes('row-level security policy')) {
        console.log('🚨 RLS Policy violation detected!');
        console.log('This is the issue we need to fix with the SQL script');
      }
    } else {
      console.log('✅ Profile exists:', {
        username: existingProfile.username,
        email: existingProfile.email,
        org_id: existingProfile.org_id,
        user_id: existingProfile.user_id
      });
    }
    
    // Step 4: Test profile creation (simulate the API method)
    console.log('\n4. Testing profile creation...');
    
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Attempting to create profile...');
      
      const defaultUsername = user.email?.split('@')[0]?.replace(/[^a-z0-9]/g, '') || `user${Date.now().toString().slice(-6)}`;
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,  // Add user_id field
          org_id: orgId,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          username: defaultUsername,
          is_portfolio_public: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Profile creation failed:', createError.message);
        console.error('Error code:', createError.code);
        console.error('Error details:', createError.details);
        
        if (createError.message.includes('row-level security policy')) {
          console.log('\n🔧 RLS Policy Issue Detected!');
          console.log('You need to run the SQL fix: FIX_RLS_PROFILE_CREATION_NOW.sql');
          console.log('This will update the RLS policies to allow profile creation.');
        }
      } else {
        console.log('✅ Profile created successfully:', {
          username: newProfile.username,
          email: newProfile.email,
          org_id: newProfile.org_id,
          user_id: newProfile.user_id
        });
      }
    }
    
    // Step 5: Test profile update
    console.log('\n5. Testing profile update...');
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ username: `test${Date.now().toString().slice(-4)}` })
      .eq('org_id', orgId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Profile update failed:', updateError.message);
      if (updateError.message.includes('row-level security policy')) {
        console.log('🔧 RLS Policy Issue on update as well');
      }
    } else {
      console.log('✅ Profile update successful');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileSettingsFix().catch(console.error);