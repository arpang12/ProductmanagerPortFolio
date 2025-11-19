// Diagnose Portfolio Publisher Issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnosePortfolioPublisher() {
  console.log('🔍 Diagnosing Portfolio Publisher Issues...\n');
  
  try {
    // Check 1: Authentication
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user found');
      console.log('💡 Solution: Login to your portfolio first');
      console.log('   Go to http://localhost:3000 and login');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Check 2: User Profile
    console.log('\n2. Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('org_id, username, portfolio_status')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      console.log('💡 Solution: Create user profile');
      console.log('   Run: node scripts/setup-user-profile.js');
      return;
    }
    
    if (!profile) {
      console.log('❌ No user profile found');
      console.log('💡 Solution: Create user profile');
      console.log('   Run: node scripts/setup-user-profile.js');
      return;
    }
    
    console.log('✅ User profile found:');
    console.log('   - org_id:', profile.org_id);
    console.log('   - username:', profile.username || 'NOT SET');
    console.log('   - portfolio_status:', profile.portfolio_status || 'NOT SET');
    
    // Check 3: Username Setup
    if (!profile.username) {
      console.log('\n❌ Username not set up');
      console.log('💡 Solution: Set up your username');
      console.log('   1. Go to http://localhost:3000/admin');
      console.log('   2. Click "Public Profile" card');
      console.log('   3. Set your username (e.g., "john-doe")');
      console.log('   4. Save settings');
      console.log('   5. Try the Portfolio Publisher again');
      return;
    }
    
    console.log('✅ Username is set up:', profile.username);
    
    // Check 4: Portfolio Status
    console.log('\n3. Checking portfolio status...');
    const status = profile.portfolio_status || 'draft';
    console.log('✅ Portfolio status:', status);
    
    if (profile.username) {
      const publicUrl = `http://localhost:3000/u/${profile.username}`;
      console.log('✅ Public URL would be:', publicUrl);
    }
    
    // Check 5: Test API Method
    console.log('\n4. Testing getPortfolioStatus API method...');
    
    // Simulate the API call
    const portfolioStatus = {
      status: profile.portfolio_status || 'draft',
      username: profile.username,
      publicUrl: profile.username ? `http://localhost:3000/u/${profile.username}` : undefined
    };
    
    console.log('✅ API method would return:', portfolioStatus);
    
    console.log('\n📊 Diagnosis Complete:');
    console.log('================');
    
    if (!profile.username) {
      console.log('🔧 ISSUE FOUND: Username not set up');
      console.log('📋 SOLUTION:');
      console.log('   1. Go to /admin');
      console.log('   2. Click "Public Profile"');
      console.log('   3. Set your username');
      console.log('   4. Save and try Portfolio Publisher again');
    } else {
      console.log('✅ Everything looks good!');
      console.log('💡 If you\'re still seeing errors, try:');
      console.log('   1. Refresh the admin page');
      console.log('   2. Check browser console for errors');
      console.log('   3. Try logging out and back in');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    console.log('\n💡 Common solutions:');
    console.log('   1. Make sure you\'re logged in');
    console.log('   2. Check your .env.local file');
    console.log('   3. Restart your development server');
  }
}

diagnosePortfolioPublisher();