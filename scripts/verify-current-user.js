import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba';

async function verifyCurrentUser() {
  console.log('🔍 Verifying Current User Profile\n');
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', CURRENT_USER_ID)
    .single();

  if (profile) {
    console.log('✅ Profile EXISTS for current user!');
    console.log(`   User ID: ${profile.user_id}`);
    console.log(`   Org ID: ${profile.org_id}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Name: ${profile.name}`);
    console.log(`   Role: ${profile.role}`);
    console.log('\n🎉 Journey Management should work now!');
    console.log('\n💡 Refresh your admin page (F5) and try saving.');
  } else {
    console.log('❌ Profile NOT found');
    console.log('\n💡 Run: node scripts/create-profile-for-current-user.js');
  }
}

verifyCurrentUser().catch(console.error);
