import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupUserProfile() {
  console.log('👤 Setting up user profile and organization...');
  
  try {
    // First, sign in as the admin user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@portfolio.com',
      password: 'portfolio123!'
    });
    
    if (authError) {
      console.error('❌ Login failed:', authError.message);
      return false;
    }
    
    console.log('✅ Logged in successfully');
    
    const userId = authData.user.id;
    const userEmail = authData.user.email;
    
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
      console.log('✅ Organization already exists');
    }
    
    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!existingProfile) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          org_id: 'default-org',
          email: userEmail,
          name: 'Portfolio Admin',
          role: 'admin'
        });
      
      if (profileError) {
        console.error('❌ Error creating user profile:', profileError.message);
        return false;
      }
      
      console.log('✅ User profile created');
    } else {
      console.log('✅ User profile already exists');
    }
    
    console.log('\n🎉 User profile setup complete!');
    console.log('🔑 You can now log in with: admin@portfolio.com / portfolio123!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    return false;
  }
}

setupUserProfile().catch(console.error);