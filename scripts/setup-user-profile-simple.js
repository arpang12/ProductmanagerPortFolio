import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { ulid } from 'ulid';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setupUserProfile() {
  console.log('🔍 Setting up user profile...\n');

  // First, let's check if we're authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('❌ Not authenticated. Please log in to the app first.');
    console.log('   Visit http://localhost:5173/admin and log in with your credentials.');
    return;
  }

  console.log(`✅ Authenticated as: ${user.email}`);
  console.log(`   User ID: ${user.id}\n`);

  // Check if profile exists
  const { data: existingProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Error checking profile:', profileError);
    return;
  }

  if (existingProfile) {
    console.log('✅ User profile already exists:');
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
      user_id: user.id,
      org_id: orgId,
      name: user.email.split('@')[0],
      role: 'admin'
    });

  if (createError) {
    console.error('❌ Error creating profile:', createError);
    return;
  }

  console.log('\n✅ User profile created successfully!');
  console.log(`   Profile ID: ${profileId}`);
  console.log(`   Org ID: ${orgId}`);
  console.log('\n🎉 You can now use all admin features!');
}

setupUserProfile().catch(console.error);
