import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifySQLFixApplied() {
  console.log('🔍 Verifying if SQL Fix was Applied Successfully...\n');
  
  try {
    // Step 1: Check authentication
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated - please log in first');
      return;
    }
    
    console.log('✅ Authenticated as:', user.id);
    
    // Step 2: Test profile access (this should work now)
    console.log('\n2. Testing profile access...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile access still failing:', profileError.message);
      console.error('Error code:', profileError.code);
      
      if (profileError.code === 'PGRST301' || profileError.message.includes('Not Acceptable')) {
        console.log('\n🚨 RLS policies are still blocking access');
        console.log('💡 The SQL fix may not have been applied correctly');
        console.log('💡 Try running the SQL again or check for errors in Supabase');
      } else if (profileError.code === 'PGRST116') {
        console.log('\n📝 No profile found - this is normal, let\'s create one');
        
        // Try to create profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            org_id: user.id,
            email: user.email,
            name: user.email?.split('@')[0] || 'User',
            username: `user${Date.now().toString().slice(-6)}`,
            is_portfolio_public: true
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Profile creation failed:', createError.message);
          console.log('💡 RLS policies may still be too restrictive');
        } else {
          console.log('✅ Profile created successfully!');
          console.log('Profile:', newProfile);
        }
      }
    } else {
      console.log('✅ Profile access successful!');
      console.log('Profile data:', {
        username: profile.username,
        email: profile.email,
        is_public: profile.is_portfolio_public,
        user_id: profile.user_id,
        org_id: profile.org_id
      });
    }
    
    // Step 3: Test organization access
    console.log('\n3. Testing organization access...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_id', user.id)
      .single();
    
    if (orgError) {
      console.error('❌ Organization access failed:', orgError.message);
    } else {
      console.log('✅ Organization access successful');
      console.log('Organization:', org);
    }
    
    // Step 4: Test the actual API method
    console.log('\n4. Testing API getProfileSettings method...');
    
    // Import the API (this might fail in Node.js, so we'll simulate it)
    try {
      // Simulate what the API does
      const { data: apiProfile, error: apiError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('org_id', user.id)
        .single();
      
      if (apiError) {
        console.error('❌ API method would fail:', apiError.message);
        console.log('💡 This is why Profile Settings shows an error');
      } else {
        console.log('✅ API method would succeed!');
        console.log('💡 Profile Settings should work now');
      }
    } catch (error) {
      console.error('❌ API test failed:', error.message);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('==========');
    
    if (!profileError && !orgError) {
      console.log('🎉 SUCCESS: SQL fix was applied correctly!');
      console.log('✅ Profile Settings should work now');
      console.log('💡 Try refreshing your Profile Settings page');
    } else {
      console.log('🚨 ISSUES DETECTED:');
      if (profileError) console.log('- Profile access is still blocked');
      if (orgError) console.log('- Organization access is still blocked');
      console.log('\n💡 NEXT STEPS:');
      console.log('1. Check if the SQL ran without errors in Supabase');
      console.log('2. Try running the EMERGENCY_DISABLE_RLS_FIX.sql instead');
      console.log('3. Check Supabase logs for any error messages');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifySQLFixApplied().catch(console.error);