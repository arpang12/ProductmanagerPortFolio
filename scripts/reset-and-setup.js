import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAndSetup() {
  console.log('🔄 Password Reset and Account Setup\n');
  
  try {
    // Step 1: Try password reset
    console.log('1️⃣ Sending password reset email...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      'arpanguria68@gmail.com',
      {
        redirectTo: 'http://localhost:5175/admin'
      }
    );
    
    if (resetError) {
      console.log('❌ Password reset failed:', resetError.message);
    } else {
      console.log('✅ Password reset email sent!');
      console.log('📧 Check your email: arpanguria68@gmail.com');
      console.log('🔗 Click the reset link to set a new password');
    }
    
    // Step 2: Alternative - create with different email
    console.log('\n2️⃣ Alternative: Creating backup admin account...');
    const { data: backupUser, error: backupError } = await supabase.auth.signUp({
      email: 'admin@arpanportfolio.com',
      password: 'ArpanAdmin2024!'
    });
    
    if (backupError) {
      if (backupError.message.includes('already registered')) {
        console.log('✅ Backup admin account already exists');
        
        // Try to login with backup account
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'admin@arpanportfolio.com',
          password: 'ArpanAdmin2024!'
        });
        
        if (!loginError && loginData.user) {
          console.log('✅ Backup admin login successful!');
          await setupUserProfile(loginData.user, 'admin@arpanportfolio.com');
        }
      } else {
        console.log('❌ Backup account creation failed:', backupError.message);
      }
    } else {
      console.log('✅ Backup admin account created!');
      if (backupUser.user) {
        await setupUserProfile(backupUser.user, 'admin@arpanportfolio.com');
      }
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('\n📧 Option 1 - Use Password Reset:');
    console.log('1. Check email: arpanguria68@gmail.com');
    console.log('2. Click the password reset link');
    console.log('3. Set a new password');
    console.log('4. Login at: http://localhost:5175/admin');
    
    console.log('\n🔑 Option 2 - Use Backup Account:');
    console.log('Email: admin@arpanportfolio.com');
    console.log('Password: ArpanAdmin2024!');
    console.log('URL: http://localhost:5175/admin');
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
  }
}

async function setupUserProfile(user, email) {
  console.log(`👤 Setting up profile for ${email}...`);
  
  try {
    // Ensure organization exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_id', 'arpan-portfolio')
      .single();
    
    if (orgError && orgError.code === 'PGRST116') {
      await supabase
        .from('organizations')
        .insert({
          org_id: 'arpan-portfolio',
          name: 'Arpan\'s Portfolio',
          slug: 'arpan-portfolio'
        });
      console.log('✅ Organization created');
    }
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        org_id: 'arpan-portfolio',
        email: user.email,
        name: 'Arpan Guria',
        role: 'admin'
      });
    
    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
    } else {
      console.log('✅ User profile ready');
    }
    
  } catch (error) {
    console.log('❌ Profile setup failed:', error.message);
  }
}

resetAndSetup().catch(console.error);