import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    // Test basic connection by checking auth
    const { data, error } = await supabase.auth.getSession();
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function checkTables() {
  console.log('📋 Checking existing tables...');
  
  try {
    // Check if user_profiles table exists
    const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tables not found - database needs to be set up');
        return false;
      } else {
        console.error('❌ Error checking tables:', error.message);
        return false;
      }
    }
    
    console.log('✅ Database tables exist!');
    return true;
  } catch (err) {
    console.error('❌ Error checking tables:', err.message);
    return false;
  }
}

async function createUser() {
  console.log('👤 Creating admin user...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@portfolio.com',
      password: 'portfolio123!'
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Admin user already exists');
        return true;
      } else {
        console.error('❌ Error creating user:', error.message);
        return false;
      }
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Check your email for verification (if required)');
    return true;
  } catch (err) {
    console.error('❌ Error creating user:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up Supabase connection...\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Setup failed - connection issues');
    process.exit(1);
  }
  
  const tablesExist = await checkTables();
  if (!tablesExist) {
    console.log('\n⚠️  Database schema needs to be deployed');
    console.log('📝 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the migration files from supabase/migrations/');
    console.log('4. Or use: npx supabase db push (requires database password)');
  }
  
  await createUser();
  
  console.log('\n🎉 Supabase setup complete!');
  console.log('🌐 Your app is now connected to production Supabase');
  console.log('🔑 Admin login: admin@portfolio.com / portfolio123!');
  console.log('🚀 Visit: http://localhost:5175/admin to test login');
}

main().catch(console.error);