import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testProfileSettingsLive() {
  console.log('🔍 Testing Profile Settings Loading (Live Test)...\n');

  try {
    // Step 1: Check authentication
    console.log('1. Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message || 'No user found');
      console.log('\n💡 To test this properly, you need to:');
      console.log('   1. Start your development server: npm run dev');
      console.log('   2. Open browser and login to your app');
      console.log('   3. Then run this test while logged in');
      return;
    }

    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);

    // Step 2: Test the exact API call that ProfileSettingsManager makes
    console.log('\n2. Testing getProfileSettings API call...');
    
    // Simulate the exact API call
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Profile query failed:', profileError.message);
      console.log('   Error code:', profileError.code);
      
      if (profileError.code === 'PGRST116') {
        console.log('\n🔧 Profile not found - testing auto-creation...');
        
        // Test profile creation
        const defaultUsername = user.email?.split('@')[0]?.replace(/[^a-z0-9]/g, '') || `user${Date.now().toString().slice(-6)}`;
        
        console.log('   Attempting to create profile with username:', defaultUsername);
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            org_id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            username: defaultUsername,
            is_portfolio_public: true
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Profile creation failed:', createError.message);
          
          if (createError.message.includes('duplicate') || createError.message.includes('unique')) {
            console.log('\n🔧 Username conflict - trying with timestamp...');
            const timestampUsername = defaultUsername + Date.now().toString().slice(-4);
            
            const { data: retryProfile, error: retryError } = await supabase
              .from('user_profiles')
              .insert({
                org_id: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email,
                username: timestampUsername,
                is_portfolio_public: true
              })
              .select()
              .single();

            if (retryError) {
              console.error('❌ Retry profile creation failed:', retryError.message);
            } else {
              console.log('✅ Profile created successfully with username:', retryProfile.username);
            }
          }
        } else {
          console.log('✅ Profile created successfully with username:', newProfile.username);
        }
      }
    } else {
      console.log('✅ Profile found:', profile.username);
      console.log('   Name:', profile.name);
      console.log('   Email:', profile.email);
      console.log('   Public:', profile.is_portfolio_public);
    }

    // Step 3: Test table structure
    console.log('\n3. Checking user_profiles table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Table access error:', tableError.message);
    } else {
      console.log('✅ Table accessible');
      if (tableData && tableData.length > 0) {
        console.log('   Sample columns:', Object.keys(tableData[0]));
      }
    }

    // Step 4: Check RLS policies
    console.log('\n4. Testing RLS policies...');
    const { data: allProfiles, error: rlsError } = await supabase
      .from('user_profiles')
      .select('org_id, username')
      .limit(5);

    if (rlsError) {
      console.error('❌ RLS policy error:', rlsError.message);
    } else {
      console.log('✅ RLS policies working');
      console.log('   Visible profiles:', allProfiles?.length || 0);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProfileSettingsLive().then(() => {
  console.log('\n🏁 Profile settings live test complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});