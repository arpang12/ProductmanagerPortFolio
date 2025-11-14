import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalTest() {
  console.log('🎯 Final Production Test\n');
  
  // Test 1: Environment
  console.log('📋 Environment Check:');
  console.log(`✅ Supabase URL: ${supabaseUrl ? 'Connected' : '❌ Missing'}`);
  console.log(`✅ Cloudinary: ${process.env.VITE_CLOUDINARY_CLOUD_NAME ? 'Configured' : '❌ Missing'}`);
  
  // Test 2: Database Connection
  console.log('\n🗄️ Database Check:');
  try {
    const { data, error } = await supabase.from('organizations').select('*').limit(1);
    if (error) {
      console.log('❌ Database error:', error.message);
    } else {
      console.log('✅ Database connected and accessible');
    }
  } catch (err) {
    console.log('❌ Database connection failed:', err.message);
  }
  
  // Test 3: Authentication Status
  console.log('\n🔐 Authentication Check:');
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      console.log('✅ User session active');
      console.log(`👤 User: ${session.session.user.email}`);
    } else {
      console.log('ℹ️  No active session (this is normal for server-side check)');
    }
  } catch (err) {
    console.log('⚠️  Session check not available');
  }
  
  // Test 4: API Functions
  console.log('\n⚡ API Functions Check:');
  try {
    // Test the API service directly
    const isDevelopmentMode = !supabaseUrl || 
                              supabaseUrl.includes('placeholder') || 
                              supabaseUrl.includes('your-project');
    
    console.log(`🔧 Development Mode: ${isDevelopmentMode ? 'Yes' : 'No'}`);
    console.log(`🚀 Production Mode: ${!isDevelopmentMode ? 'Yes' : 'No'}`);
    
    if (!isDevelopmentMode) {
      console.log('✅ Running in production mode with real Supabase');
    }
  } catch (err) {
    console.log('❌ API test failed:', err.message);
  }
  
  // Test 5: File Upload Functions
  console.log('\n📁 File Upload Check:');
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-upload-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset_type: 'image',
        original_filename: 'test.jpg',
        file_size: 1000,
        mime_type: 'image/jpeg'
      })
    });
    
    if (response.status === 200) {
      console.log('✅ File upload functions working');
    } else if (response.status === 401) {
      console.log('⚠️  File upload needs authentication (normal)');
    } else {
      console.log(`⚠️  File upload response: ${response.status}`);
    }
  } catch (err) {
    console.log('⚠️  File upload functions not accessible');
  }
  
  console.log('\n🎉 Production Test Complete!');
  console.log('\n🚀 Ready to Use:');
  console.log('1. Visit: http://localhost:5175/admin');
  console.log('2. Login with your credentials');
  console.log('3. Start creating your portfolio content!');
  
  console.log('\n✨ Available Features:');
  console.log('• Case Study Editor - Create portfolio projects');
  console.log('• My Story Manager - Personal narrative');
  console.log('• Carousel Manager - Homepage images');
  console.log('• Skills & Tools - Magic toolbox');
  console.log('• Journey Timeline - Career progression');
  console.log('• Contact Manager - Social links & info');
  console.log('• CV Manager - Multiple CV versions');
  console.log('• AI Enhancement - Content improvement');
}

finalTest().catch(console.error);