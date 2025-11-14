import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { ulid } from 'ulid';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const CURRENT_USER_ID = '9d75db25-23d4-4710-8167-c0ca6c72e2ba';

async function createProfileForCurrentUser() {
  console.log('🔍 Creating Profile for Current User\n');
  console.log('='.repeat(70));
  console.log(`\nUser ID: ${CURRENT_USER_ID}\n`);

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', CURRENT_USER_ID)
    .maybeSingle();

  if (existingProfile) {
    console.log('✅ Profile already exists!');
    console.log(`   Email: ${existingProfile.email}`);
    console.log(`   Name: ${existingProfile.name}`);
    console.log(`   Org ID: ${existingProfile.org_id}`);
    console.log(`   Role: ${existingProfile.role}`);
    console.log('\n🎉 You\'re all set!');
    return;
  }

  console.log('⚠️  No profile found. Creating one...\n');

  // Ensure organization exists
  const { data: org } = await supabase
    .from('organizations')
    .select('org_id')
    .eq('org_id', 'default-org')
    .maybeSingle();

  if (!org) {
    console.log('Creating organization...');
    const { error: orgError } = await supabase
      .from('organizations')
      .insert({
        org_id: 'default-org',
        name: 'My Portfolio',
        slug: 'my-portfolio'
      });

    if (orgError) {
      console.error('❌ Error creating organization:', orgError.message);
      console.log('\n💡 This might be an RLS issue.');
      console.log('   Please run the SQL in Supabase dashboard instead:');
      console.log('   File: CREATE_PROFILE_FOR_CURRENT_USER.sql');
      return;
    }
    console.log('✅ Organization created');
  } else {
    console.log('✅ Organization exists');
  }

  // Create user profile
  console.log('Creating user profile...');
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: CURRENT_USER_ID,
      org_id: 'default-org',
      email: 'user@example.com',  // Will be updated
      name: 'Portfolio Owner',
      role: 'admin'
    });

  if (profileError) {
    console.error('❌ Error creating profile:', profileError.message);
    console.log('\n💡 This is an RLS (Row Level Security) issue.');
    console.log('   The anon key cannot insert into user_profiles directly.');
    console.log('\n📋 Manual Solution:');
    console.log('   1. Go to Supabase dashboard');
    console.log('   2. Open SQL Editor');
    console.log('   3. Run the SQL from: CREATE_PROFILE_FOR_CURRENT_USER.sql');
    return;
  }

  console.log('✅ User profile created!');
  console.log('\n🎉 Setup complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Refresh your admin page (F5)');
  console.log('   2. Try saving in Journey Management');
  console.log('   3. It should work now!');
}

createProfileForCurrentUser().catch(console.error);
