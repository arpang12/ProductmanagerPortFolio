import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseProfileSettings() {
  console.log('🔍 Diagnosing Profile Settings Issue...\n');

  try {
    // Check if user_profiles table exists
    console.log('1. Checking user_profiles table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing user_profiles table:', tableError.message);
      
      // Check if table exists at all
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_names');
      
      if (!tablesError && tables) {
        console.log('📋 Available tables:', tables.map(t => t.table_name));
      }
      return;
    }

    console.log('✅ user_profiles table accessible');

    // Check current user authentication
    console.log('\n2. Checking current user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ User not authenticated:', authError?.message || 'No user found');
      console.log('💡 You need to be logged in to test profile settings');
      return;
    }

    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);

    // Check if user has a profile
    console.log('\n3. Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile not found:', profileError.message);
      
      // Check if any profiles exist
      const { data: allProfiles, error: allError } = await supabase
        .from('user_profiles')
        .select('org_id, username, name, email')
        .limit(5);

      if (!allError && allProfiles) {
        console.log('\n📋 Existing profiles in database:');
        allProfiles.forEach((p, i) => {
          console.log(`   ${i + 1}. org_id: ${p.org_id}, username: ${p.username}, name: ${p.name}`);
        });
      }

      // Create profile for current user
      console.log('\n🔧 Creating profile for current user...');
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          org_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          username: user.email?.split('@')[0]?.replace(/[^a-z0-9]/g, '') || 'user',
          is_portfolio_public: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create profile:', createError.message);
        
        // Check if username conflict
        if (createError.message.includes('duplicate') || createError.message.includes('unique')) {
          console.log('\n🔧 Username conflict, trying with timestamp...');
          const timestamp = Date.now().toString().slice(-4);
          const { data: retryProfile, error: retryError } = await supabase
            .from('user_profiles')
            .insert({
              org_id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email,
              username: (user.email?.split('@')[0]?.replace(/[^a-z0-9]/g, '') || 'user') + timestamp,
              is_portfolio_public: true
            })
            .select()
            .single();

          if (retryError) {
            console.error('❌ Still failed to create profile:', retryError.message);
          } else {
            console.log('✅ Profile created successfully with unique username:', retryProfile.username);
          }
        }
      } else {
        console.log('✅ Profile created successfully:', newProfile.username);
      }
    } else {
      console.log('✅ Profile found:', profile.username);
      console.log('   Name:', profile.name);
      console.log('   Email:', profile.email);
      console.log('   Public:', profile.is_portfolio_public);
    }

    // Test the API method
    console.log('\n4. Testing getProfileSettings API method...');
    try {
      // Simulate the API call
      const { data: testProfile, error: testError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('org_id', user.id)
        .single();

      if (testError) {
        console.error('❌ API method would fail:', testError.message);
      } else {
        console.log('✅ API method would succeed');
        console.log('   Profile data:', {
          username: testProfile.username,
          name: testProfile.name,
          email: testProfile.email,
          is_portfolio_public: testProfile.is_portfolio_public
        });
      }
    } catch (error) {
      console.error('❌ API test failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

// Run diagnosis
diagnoseProfileSettings().then(() => {
  console.log('\n🏁 Profile settings diagnosis complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Diagnosis crashed:', error);
  process.exit(1);
});