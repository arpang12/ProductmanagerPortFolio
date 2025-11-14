import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function confirmUser() {
  console.log('🔐 Manual User Confirmation...');
  
  try {
    // Try to sign in first to see the exact error
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@portfolio.com',
      password: 'portfolio123!'
    });
    
    if (error) {
      console.log('❌ Login error:', error.message);
      
      if (error.message.includes('Email not confirmed')) {
        console.log('\n📧 Email confirmation required.');
        console.log('Please do ONE of the following:');
        console.log('\n🔧 Option 1 - Disable Email Confirmation:');
        console.log('1. Go to: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/auth/settings');
        console.log('2. Scroll to "Email Auth"');
        console.log('3. UNCHECK "Enable email confirmations"');
        console.log('4. Click "Save"');
        console.log('5. Run this script again');
        
        console.log('\n👤 Option 2 - Manual Confirmation:');
        console.log('1. Go to: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/auth/users');
        console.log('2. Find user: admin@portfolio.com');
        console.log('3. Click the user');
        console.log('4. Click "Confirm Email"');
        console.log('5. Run this script again');
        
        return false;
      }
    } else {
      console.log('✅ User login successful!');
      console.log('🎉 Email is already confirmed');
      
      // Now set up the profile
      await setupProfile(data.user);
      return true;
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

async function setupProfile(user) {
  console.log('👤 Setting up user profile...');
  
  try {
    // Check if organization exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_id', 'default-org')
      .single();
    
    if (!existingOrg) {
      // Create organization
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          org_id: 'default-org',
          name: 'My Portfolio',
          slug: 'my-portfolio'
        });
      
      if (orgError) {
        console.error('❌ Error creating organization:', orgError.message);
        return false;
      }
      
      console.log('✅ Organization created');
    } else {
      console.log('✅ Organization exists');
    }
    
    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!existingProfile) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          org_id: 'default-org',
          email: user.email,
          name: 'Portfolio Admin',
          role: 'admin'
        });
      
      if (profileError) {
        console.error('❌ Error creating user profile:', profileError.message);
        return false;
      }
      
      console.log('✅ User profile created');
    } else {
      console.log('✅ User profile exists');
    }
    
    console.log('\n🎉 Setup complete!');
    console.log('🚀 You can now access: http://localhost:5175/admin');
    console.log('🔑 Login: admin@portfolio.com / portfolio123!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Profile setup error:', error.message);
    return false;
  }
}

confirmUser().catch(console.error);