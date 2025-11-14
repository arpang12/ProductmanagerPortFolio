import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { ulid } from 'ulid';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixUserProfile() {
  console.log('🔍 Checking user profiles...\n');

  // Get all auth users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }

  console.log(`Found ${users.length} auth users\n`);

  for (const user of users) {
    console.log(`\n👤 User: ${user.email} (${user.id})`);
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('  ❌ Error checking profile:', profileError);
      continue;
    }

    if (!profile) {
      console.log('  ⚠️  No profile found, creating...');
      
      // Get or create organization
      let orgId;
      const { data: orgs } = await supabase
        .from('organizations')
        .select('org_id')
        .limit(1)
        .single();

      if (orgs) {
        orgId = orgs.org_id;
        console.log(`  ✅ Using existing org: ${orgId}`);
      } else {
        orgId = ulid();
        const { error: orgError } = await supabase
          .from('organizations')
          .insert({
            org_id: orgId,
            name: 'Default Organization',
            slug: 'default'
          });

        if (orgError) {
          console.error('  ❌ Error creating org:', orgError);
          continue;
        }
        console.log(`  ✅ Created new org: ${orgId}`);
      }

      // Create user profile
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          profile_id: ulid(),
          user_id: user.id,
          org_id: orgId,
          name: user.email.split('@')[0],
          role: 'admin'
        });

      if (createError) {
        console.error('  ❌ Error creating profile:', createError);
      } else {
        console.log('  ✅ Profile created successfully');
      }
    } else {
      console.log('  ✅ Profile exists');
      console.log(`     - Name: ${profile.name}`);
      console.log(`     - Org ID: ${profile.org_id}`);
      console.log(`     - Role: ${profile.role}`);
    }
  }

  console.log('\n✅ User profile check complete!');
}

fixUserProfile().catch(console.error);
