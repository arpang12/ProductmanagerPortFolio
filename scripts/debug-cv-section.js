import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCVSection() {
  console.log('🔍 Debugging CV Section Loading Issue\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@arpanportfolio.com',
      password: 'ArpanAdmin2024!'
    });
    
    if (authError) {
      console.log('❌ Login failed:', authError.message);
      return;
    }
    console.log('✅ Login successful');
    
    // Step 2: Check user profile and org_id
    console.log('\n2️⃣ Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      return;
    }
    console.log('✅ User profile found:', profile.org_id);
    
    // Step 3: Test CV section query (exact same as API)
    console.log('\n3️⃣ Testing CV section query...');
    const { data: cvData, error: cvError } = await supabase
      .from('cv_sections')
      .select(`
        *,
        cv_versions (
          *,
          assets (*)
        )
      `)
      .eq('org_id', profile.org_id)
      .single();
    
    if (cvError) {
      console.log('❌ CV section query failed:', cvError);
      console.log('Error code:', cvError.code);
      console.log('Error details:', cvError.details);
      console.log('Error hint:', cvError.hint);
      
      // Try simpler query
      console.log('\n🔧 Trying simpler query...');
      const { data: simpleCv, error: simpleCvError } = await supabase
        .from('cv_sections')
        .select('*')
        .eq('org_id', profile.org_id);
      
      if (simpleCvError) {
        console.log('❌ Simple CV query also failed:', simpleCvError.message);
      } else {
        console.log('✅ Simple CV query worked:', simpleCv.length, 'records');
        console.log('CV data:', simpleCv);
        
        if (simpleCv.length > 0) {
          // Try to get CV versions separately
          console.log('\n🔧 Testing CV versions query...');
          const { data: versions, error: versionsError } = await supabase
            .from('cv_versions')
            .select('*')
            .eq('cv_section_id', simpleCv[0].cv_section_id);
          
          if (versionsError) {
            console.log('❌ CV versions query failed:', versionsError.message);
          } else {
            console.log('✅ CV versions query worked:', versions.length, 'records');
            console.log('Versions data:', versions);
          }
        }
      }
    } else {
      console.log('✅ CV section query successful');
      console.log('CV data:', cvData);
    }
    
    // Step 4: Test what the API getCVSection function would return
    console.log('\n4️⃣ Testing API getCVSection logic...');
    
    // Check if we're in development mode (from API perspective)
    const isDevelopmentMode = !supabaseUrl || 
                              !supabaseKey || 
                              supabaseUrl.includes('placeholder') || 
                              supabaseUrl.includes('your-project') ||
                              supabaseKey.includes('placeholder') ||
                              supabaseKey.includes('your_supabase') ||
                              supabaseUrl === 'https://placeholder.supabase.co';
    
    console.log('Development mode detected:', isDevelopmentMode);
    
    if (isDevelopmentMode) {
      console.log('⚠️  API would return mock data in development mode');
    } else {
      console.log('✅ API should use real database queries');
    }
    
    // Step 5: Check RLS policies
    console.log('\n5️⃣ Testing RLS policies...');
    
    // Test if user can access cv_sections table
    const { data: rlsTest, error: rlsError } = await supabase
      .from('cv_sections')
      .select('cv_section_id')
      .limit(1);
    
    if (rlsError) {
      console.log('❌ RLS test failed:', rlsError.message);
    } else {
      console.log('✅ RLS test passed, can access cv_sections');
    }
    
    console.log('\n🎯 Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugCVSection().catch(console.error);