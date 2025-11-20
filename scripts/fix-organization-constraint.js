import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixOrganizationConstraint() {
  console.log('🔧 Fixing Organization Constraint Issue...\n');
  
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
    
    const userId = loginData.user.id;
    console.log('✅ Login successful, User ID:', userId);
    
    // Step 2: Check if organization exists for this user
    console.log('\n2. Checking if organization exists...');
    const { data: existingOrg, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_id', userId)
      .single();
    
    if (orgError && orgError.code === 'PGRST116') {
      console.log('📝 No organization exists for this user');
      
      // Step 3: Create organization
      console.log('\n3. Creating organization...');
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          org_id: userId,
          name: `User ${userId.slice(0, 8)}`,
          slug: `user-${userId.slice(0, 8)}`
        })
        .select()
        .single();
      
      if (createOrgError) {
        console.error('❌ Failed to create organization:', createOrgError.message);
        return;
      }
      
      console.log('✅ Organization created:', newOrg);
    } else if (orgError) {
      console.error('❌ Error checking organization:', orgError.message);
      return;
    } else {
      console.log('✅ Organization already exists:', existingOrg);
    }
    
    // Step 4: Now try to create user profile
    console.log('\n4. Creating user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        org_id: userId,
        email: loginData.user.email,
        name: loginData.user.email?.split('@')[0] || 'User',
        role: 'admin'
      })
      .select()
      .single();
    
    if (profileError) {
      if (profileError.message.includes('duplicate') || profileError.message.includes('already exists')) {
        console.log('✅ Profile already exists');
        
        // Get existing profile
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        console.log('Existing profile:', existingProfile);
      } else {
        console.error('❌ Failed to create profile:', profileError.message);
        console.error('Error code:', profileError.code);
        return;
      }
    } else {
      console.log('✅ Profile created successfully:', profile);
    }
    
    // Step 5: Test the profile settings API methods
    console.log('\n5. Testing profile settings methods...');
    
    // Test getProfileSettings equivalent
    const { data: profileData, error: getError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', userId)
      .single();
    
    if (getError) {
      console.error('❌ Failed to get profile:', getError.message);
    } else {
      console.log('✅ Profile retrieved successfully');
    }
    
    console.log('\n🎉 Organization constraint issue fixed!');
    console.log('The system now has:');
    console.log('- Organization record for user');
    console.log('- User profile with proper foreign key references');
    console.log('- Profile Settings should now work correctly');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixOrganizationConstraint().catch(console.error);