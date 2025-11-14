import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const cloudinaryName = process.env.VITE_CLOUDINARY_CLOUD_NAME;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
  console.log('🔍 Production Setup Status Check\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`✅ Supabase URL: ${supabaseUrl ? 'Set' : '❌ Missing'}`);
  console.log(`✅ Supabase Key: ${supabaseKey ? 'Set' : '❌ Missing'}`);
  console.log(`✅ Cloudinary: ${cloudinaryName ? 'Set' : '❌ Missing'}`);
  
  // Check Supabase connection
  console.log('\n🔗 Supabase Connection:');
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Connection successful');
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return;
  }
  
  // Check database tables
  console.log('\n🗄️ Database Tables:');
  try {
    const { data, error } = await supabase.from('organizations').select('count').single();
    if (error && error.code === 'PGRST116') {
      console.log('❌ Tables not found - run the SQL schema');
    } else {
      console.log('✅ Database schema deployed');
    }
  } catch (err) {
    console.log('❌ Database check failed:', err.message);
  }
  
  // Check Edge Functions
  console.log('\n⚡ Edge Functions:');
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
    
    if (response.ok) {
      console.log('✅ Upload functions working');
    } else {
      console.log('⚠️  Upload functions need configuration');
    }
  } catch (err) {
    console.log('⚠️  Upload functions not accessible');
  }
  
  // Check users
  console.log('\n👥 Users:');
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('⚠️  Cannot check users (admin access needed)');
    } else {
      console.log(`✅ ${users.users.length} user(s) registered`);
    }
  } catch (err) {
    console.log('⚠️  User check not available');
  }
  
  console.log('\n🎯 Next Steps:');
  
  if (!cloudinaryName || cloudinaryName.includes('placeholder')) {
    console.log('1. ⚠️  Update Cloudinary credentials in .env.local');
  }
  
  console.log('2. 🔐 Disable email confirmation in Supabase Auth settings');
  console.log('3. 👤 Run: node scripts/setup-user-profile.js');
  console.log('4. 🚀 Test login at: http://localhost:5175/admin');
  
  console.log('\n🎉 Your portfolio system is almost ready!');
}

checkStatus().catch(console.error);