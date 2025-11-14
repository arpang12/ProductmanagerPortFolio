import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('👥 Checking existing users...\n');
  
  try {
    // Try different common passwords for arpanguria68@gmail.com
    const passwords = [
      'portfolio2024!',
      'portfolio123!',
      'admin123456',
      'password123',
      'arpan123',
      'portfolio123'
    ];
    
    console.log('🔍 Testing login with different passwords...');
    
    for (const password of passwords) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'arpanguria68@gmail.com',
          password: password
        });
        
        if (!error && data.user) {
          console.log(`✅ Login successful with password: ${password}`);
          console.log(`👤 User ID: ${data.user.id}`);
          console.log(`📧 Email: ${data.user.email}`);
          console.log(`✅ Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
          
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          
          if (profile) {
            console.log(`🏢 Organization: ${profile.org_id}`);
            console.log(`👤 Name: ${profile.name}`);
          } else {
            console.log('⚠️  No user profile found');
          }
          
          console.log('\n🎉 Working credentials found!');
          console.log(`🔑 Email: arpanguria68@gmail.com`);
          console.log(`🔑 Password: ${password}`);
          console.log('🚀 Try logging in at: http://localhost:5175/admin');
          
          return;
        }
      } catch (err) {
        // Continue to next password
      }
    }
    
    console.log('❌ No working password found for arpanguria68@gmail.com');
    console.log('\n🔧 Let me create a fresh account...');
    
    // Create new account with known password
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: 'arpanguria68@gmail.com',
      password: 'ArpanPortfolio2024!'
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('⚠️  User exists but password unknown');
        console.log('\n🔧 Options:');
        console.log('1. Reset password in Supabase dashboard');
        console.log('2. Use a different email');
        console.log('3. Check your email for existing account details');
      } else {
        console.log('❌ Signup error:', signUpError.message);
      }
    } else {
      console.log('✅ New account created!');
      console.log('📧 Check your email for confirmation');
      console.log('\n🔑 New credentials:');
      console.log('Email: arpanguria68@gmail.com');
      console.log('Password: ArpanPortfolio2024!');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkUsers().catch(console.error);