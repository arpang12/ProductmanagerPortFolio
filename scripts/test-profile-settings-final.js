import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testProfileSettingsFinal() {
  console.log('🧪 Testing Profile Settings - Final Test...\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }
    
    console.log('✅ Login successful');
    
    // Step 2: Test the actual API methods that ProfileSettingsManager uses
    console.log('\n2. Testing getProfileSettings API method...');
    
    // Simulate the getUserOrgId function
    const { data: { user } } = await supabase.auth.getUser();
    const orgId = user.id;
    
    // Test getting profile (this is what getProfileSettings does)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    if (profileError) {
      console.log('Profile error:', profileError.message);
      
      if (profileError.code === 'PGRST116') {
        console.log('📝 No profile exists - testing profile creation...');
        
        // Test profile creation (this is what the API does)
        const defaultUsername = user.email?.split('@')[0]?.replace(/[^a-z0-9]/g, '') || `user${Date.now().toString().slice(-6)}`;
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
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
          
          if (createError.message.includes('violates foreign key constraint')) {
            console.log('\n🚨 FOREIGN KEY CONSTRAINT ERROR');
            console.log('This means the organization record is missing.');
            console.log('You need to apply the SQL fix in Supabase Dashboard first.');
            console.log('See PROFILE_SETTINGS_COMPLETE_FIX.md for instructions.');
          } else if (createError.message.includes('row-level security policy')) {
            console.log('\n🚨 RLS POLICY ERROR');
            console.log('This means the RLS policies are blocking the operation.');
            console.log('You need to apply the SQL fix in Supabase Dashboard first.');
            console.log('See PROFILE_SETTINGS_COMPLETE_FIX.md for instructions.');
          }
        } else {
          console.log('✅ Profile created successfully:', {
            username: newProfile.username,
            email: newProfile.email,
            is_public: newProfile.is_portfolio_public
          });
        }
      }
    } else {
      console.log('✅ Profile exists:', {
        username: profile.username,
        email: profile.email,
        is_public: profile.is_portfolio_public
      });
    }
    
    // Step 3: Test profile update
    console.log('\n3. Testing profile update...');
    const testUsername = `test${Date.now().toString().slice(-4)}`;
    
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        username: testUsername,
        is_portfolio_public: true 
      })
      .eq('org_id', orgId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Profile update failed:', updateError.message);
    } else {
      console.log('✅ Profile update successful');
    }
    
    console.log('\n🎉 Profile Settings test completed!');
    console.log('\nIf all tests passed, the Profile Settings Manager should work correctly.');
    console.log('If any tests failed, apply the SQL fix in PROFILE_SETTINGS_COMPLETE_FIX.md');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileSettingsFinal().catch(console.error);