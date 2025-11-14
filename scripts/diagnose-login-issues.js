import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseLoginIssues() {
  console.log('🔍 Diagnosing Post-Login Issues\n');
  
  try {
    // Step 1: Test login
    console.log('1️⃣ Testing Login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@portfolio.com',
      password: 'portfolio123!'
    });
    
    if (authError) {
      console.log('❌ Login failed:', authError.message);
      return;
    }
    
    console.log('✅ Login successful');
    const user = authData.user;
    console.log(`👤 User ID: ${user.id}`);
    console.log(`📧 Email: ${user.email}`);
    
    // Step 2: Check user profile
    console.log('\n2️⃣ Checking User Profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ User profile missing:', profileError.message);
      console.log('🔧 Creating user profile...');
      
      // Create user profile
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          org_id: 'default-org',
          email: user.email,
          name: 'Portfolio Admin',
          role: 'admin'
        });
      
      if (createError) {
        console.log('❌ Failed to create profile:', createError.message);
        return;
      } else {
        console.log('✅ User profile created');
      }
    } else {
      console.log('✅ User profile exists');
      console.log(`🏢 Organization: ${profile.org_id}`);
      console.log(`👤 Name: ${profile.name}`);
      console.log(`🔑 Role: ${profile.role}`);
    }
    
    // Step 3: Check organization
    console.log('\n3️⃣ Checking Organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_id', 'default-org')
      .single();
    
    if (orgError) {
      console.log('❌ Organization missing:', orgError.message);
      console.log('🔧 Creating organization...');
      
      const { error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          org_id: 'default-org',
          name: 'My Portfolio',
          slug: 'my-portfolio'
        });
      
      if (createOrgError) {
        console.log('❌ Failed to create organization:', createOrgError.message);
        return;
      } else {
        console.log('✅ Organization created');
      }
    } else {
      console.log('✅ Organization exists');
      console.log(`🏢 Name: ${org.name}`);
    }
    
    // Step 4: Test API functions
    console.log('\n4️⃣ Testing API Functions...');
    
    // Test case studies
    try {
      const { data: caseStudies, error: csError } = await supabase
        .from('case_studies')
        .select('*')
        .limit(5);
      
      if (csError) {
        console.log('❌ Case studies error:', csError.message);
      } else {
        console.log(`✅ Case studies accessible (${caseStudies.length} found)`);
      }
    } catch (err) {
      console.log('❌ Case studies test failed:', err.message);
    }
    
    // Test story sections
    try {
      const { data: story, error: storyError } = await supabase
        .from('story_sections')
        .select('*')
        .eq('org_id', 'default-org')
        .limit(1);
      
      if (storyError) {
        console.log('❌ Story sections error:', storyError.message);
      } else {
        console.log(`✅ Story sections accessible (${story.length} found)`);
      }
    } catch (err) {
      console.log('❌ Story sections test failed:', err.message);
    }
    
    // Test carousel
    try {
      const { data: carousel, error: carouselError } = await supabase
        .from('carousels')
        .select('*')
        .eq('org_id', 'default-org')
        .limit(1);
      
      if (carouselError) {
        console.log('❌ Carousel error:', carouselError.message);
      } else {
        console.log(`✅ Carousel accessible (${carousel.length} found)`);
      }
    } catch (err) {
      console.log('❌ Carousel test failed:', err.message);
    }
    
    // Step 5: Test RLS policies
    console.log('\n5️⃣ Testing Row Level Security...');
    
    // Check if RLS is working properly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      console.log('✅ User session active for RLS');
    } else {
      console.log('❌ No user session for RLS');
    }
    
    console.log('\n🎯 Diagnosis Complete!');
    console.log('\nIf you see any ❌ errors above, those are the issues causing functionality problems.');
    console.log('The script has attempted to fix missing profiles and organizations.');
    console.log('\n🔧 Try refreshing your admin dashboard now: http://localhost:5175/admin');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

diagnoseLoginIssues().catch(console.error);