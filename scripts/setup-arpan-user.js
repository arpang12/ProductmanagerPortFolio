import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupArpanUser() {
  console.log('👤 Setting up Arpan\'s Portfolio Account\n');
  
  try {
    // Step 1: Create user account
    console.log('1️⃣ Creating user account...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'arpanguria68@gmail.com',
      password: 'portfolio2024!'
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ User already exists, proceeding with login test...');
      } else {
        console.log('❌ Signup error:', signUpError.message);
        return;
      }
    } else {
      console.log('✅ User account created successfully');
      if (signUpData.user && !signUpData.user.email_confirmed_at) {
        console.log('📧 Email confirmation may be required');
      }
    }
    
    // Step 2: Try to sign in
    console.log('\n2️⃣ Testing login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'arpanguria68@gmail.com',
      password: 'portfolio2024!'
    });
    
    if (authError) {
      console.log('❌ Login failed:', authError.message);
      
      if (authError.message.includes('Email not confirmed')) {
        console.log('\n🔧 Email confirmation required. Please:');
        console.log('1. Go to: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/auth/users');
        console.log('2. Find user: arpanguria68@gmail.com');
        console.log('3. Click "Confirm Email"');
        console.log('4. Run this script again');
        return;
      }
      return;
    }
    
    console.log('✅ Login successful!');
    const user = authData.user;
    
    // Step 3: Ensure organization exists
    console.log('\n3️⃣ Setting up organization...');
    const { data: existingOrg, error: orgCheckError } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_id', 'arpan-portfolio')
      .single();
    
    if (orgCheckError && orgCheckError.code === 'PGRST116') {
      // Create organization
      const { error: orgCreateError } = await supabase
        .from('organizations')
        .insert({
          org_id: 'arpan-portfolio',
          name: 'Arpan\'s Portfolio',
          slug: 'arpan-portfolio'
        });
      
      if (orgCreateError) {
        console.log('❌ Failed to create organization:', orgCreateError.message);
        return;
      }
      console.log('✅ Organization created: Arpan\'s Portfolio');
    } else if (existingOrg) {
      console.log('✅ Organization already exists');
    }
    
    // Step 4: Create user profile
    console.log('\n4️⃣ Setting up user profile...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // Create user profile
      const { error: profileCreateError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          org_id: 'arpan-portfolio',
          email: user.email,
          name: 'Arpan Guria',
          role: 'admin'
        });
      
      if (profileCreateError) {
        console.log('❌ Failed to create user profile:', profileCreateError.message);
        return;
      }
      console.log('✅ User profile created');
    } else if (existingProfile) {
      console.log('✅ User profile already exists');
    }
    
    // Step 5: Test API access
    console.log('\n5️⃣ Testing API access...');
    
    // Test case studies access
    const { data: caseStudies, error: csError } = await supabase
      .from('case_studies')
      .select('*')
      .limit(1);
    
    if (csError) {
      console.log('⚠️  Case studies access issue:', csError.message);
    } else {
      console.log('✅ Case studies accessible');
    }
    
    // Test story sections access
    const { data: story, error: storyError } = await supabase
      .from('story_sections')
      .select('*')
      .eq('org_id', 'arpan-portfolio')
      .limit(1);
    
    if (storyError) {
      console.log('⚠️  Story sections access issue:', storyError.message);
    } else {
      console.log('✅ Story sections accessible');
    }
    
    console.log('\n🎉 Setup Complete!');
    console.log('\n🔑 Your Login Credentials:');
    console.log('Email: arpanguria68@gmail.com');
    console.log('Password: portfolio2024!');
    console.log('\n🚀 Access Your Dashboard:');
    console.log('URL: http://localhost:5175/admin');
    console.log('\n✨ Your portfolio system is ready to use!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupArpanUser().catch(console.error);