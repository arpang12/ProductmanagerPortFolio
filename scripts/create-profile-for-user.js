import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { ulid } from 'ulid';

config({ path: '.env.local' });

// This script creates a profile for a specific user ID
const USER_ID = '1f1a3c1a-e0ff-42a6-910c-930724e7ea5d'; // Your user ID from the console

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createProfile() {
  console.log('🔍 Creating profile for user:', USER_ID);
  console.log('');

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', USER_ID)
    .maybeSingle();

  if (existingProfile) {
    console.log('✅ Profile already exists!');
    console.log(`   Name: ${existingProfile.name}`);
    console.log(`   Org ID: ${existingProfile.org_id}`);
    console.log(`   Role: ${existingProfile.role}`);
    return;
  }

  console.log('⚠️  No profile found. Creating one...\n');

  // Get or create organization
  let orgId;
  const { data: orgs } = await supabase
    .from('organizations')
    .select('org_id')
    .limit(1)
    .maybeSingle();

  if (orgs) {
    orgId = orgs.org_id;
    console.log(`✅ Using existing organization: ${orgId}`);
  } else {
    orgId = ulid();
    const { error: orgError } = await supabase
      .from('organizations')
      .insert({
        org_id: orgId,
        name: 'My Portfolio',
        slug: 'my-portfolio'
      });

    if (orgError) {
      console.error('❌ Error creating organization:', orgError);
      console.log('\n💡 This might be an RLS (Row Level Security) issue.');
      console.log('   You may need to temporarily disable RLS or use the service role key.');
      return;
    }
    console.log(`✅ Created new organization: ${orgId}`);
  }

  // Create user profile
  const profileId = ulid();
  const { error: createError } = await supabase
    .from('user_profiles')
    .insert({
      profile_id: profileId,
      user_id: USER_ID,
      org_id: orgId,
      name: 'Portfolio Owner',
      role: 'admin'
    });

  if (createError) {
    console.error('❌ Error creating profile:', createError);
    console.log('\n💡 This is likely an RLS (Row Level Security) issue.');
    console.log('   The anon key cannot insert into user_profiles directly.');
    console.log('\n📋 Manual Solution:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Open the SQL Editor');
    console.log('   3. Run this query:\n');
    console.log(`-- Create organization if needed`);
    console.log(`INSERT INTO organizations (org_id, name, slug)`);
    console.log(`VALUES ('${orgId}', 'My Portfolio', 'my-portfolio')`);
    console.log(`ON CONFLICT (org_id) DO NOTHING;\n`);
    console.log(`-- Create user profile`);
    console.log(`INSERT INTO user_profiles (profile_id, user_id, org_id, name, role)`);
    console.log(`VALUES ('${profileId}', '${USER_ID}', '${orgId}', 'Portfolio Owner', 'admin');`);
    return;
  }

  console.log('\n✅ User profile created successfully!');
  console.log(`   Profile ID: ${profileId}`);
  console.log(`   Org ID: ${orgId}`);
  console.log('\n🎉 You can now use all admin features!');
  console.log('   Refresh your admin page to see the changes.');
}

createProfile().catch(console.error);
