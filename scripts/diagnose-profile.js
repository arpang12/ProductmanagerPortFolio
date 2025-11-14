import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseProfile() {
  console.log('🔍 Portfolio Profile Diagnostic Tool\n');
  console.log('=' .repeat(50));
  
  // Check authentication
  console.log('\n📋 Step 1: Checking Authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('❌ Not authenticated');
    console.log('\n💡 Solution:');
    console.log('   1. Visit http://localhost:5173/admin');
    console.log('   2. Log in with your credentials');
    console.log('   3. Run this script again');
    return;
  }
  
  console.log('✅ Authenticated');
  console.log(`   Email: ${user.email}`);
  console.log(`   User ID: ${user.id}`);
  
  // Check user profile
  console.log('\n📋 Step 2: Checking User Profile...');
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (profileError) {
    console.log('❌ Error checking profile:', profileError.message);
    return;
  }
  
  if (!profile) {
    console.log('❌ User profile NOT found');
    console.log('\n💡 Solution:');
    console.log('   Run: node scripts/setup-user-profile-simple.js');
    
    // Check if organization exists
    console.log('\n📋 Checking if organization exists...');
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (org) {
      console.log('✅ Organization exists:', org.name);
    } else {
      console.log('⚠️  No organization found (will be created)');
    }
    return;
  }
  
  console.log('✅ User profile found');
  console.log(`   Profile ID: ${profile.profile_id}`);
  console.log(`   Name: ${profile.name}`);
  console.log(`   Role: ${profile.role}`);
  console.log(`   Org ID: ${profile.org_id}`);
  
  // Check organization
  console.log('\n📋 Step 3: Checking Organization...');
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('org_id', profile.org_id)
    .single();
  
  if (orgError || !org) {
    console.log('❌ Organization NOT found');
    console.log('   This is unusual - profile exists but org doesn\'t');
    return;
  }
  
  console.log('✅ Organization found');
  console.log(`   Name: ${org.name}`);
  console.log(`   Slug: ${org.slug}`);
  
  // Check content sections
  console.log('\n📋 Step 4: Checking Content Sections...');
  
  const checks = [
    { table: 'story_sections', name: 'My Story' },
    { table: 'journey_timelines', name: 'Journey' },
    { table: 'cv_sections', name: 'CV Section' },
    { table: 'contact_sections', name: 'Contact' },
    { table: 'carousels', name: 'Carousel' },
    { table: 'ai_configurations', name: 'AI Settings' }
  ];
  
  for (const check of checks) {
    const { data, error } = await supabase
      .from(check.table)
      .select('*')
      .eq('org_id', profile.org_id)
      .maybeSingle();
    
    if (error) {
      console.log(`   ⚠️  ${check.name}: Error - ${error.message}`);
    } else if (data) {
      console.log(`   ✅ ${check.name}: Exists`);
    } else {
      console.log(`   ⚠️  ${check.name}: Not created yet (will use defaults)`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary\n');
  console.log('✅ Authentication: Working');
  console.log('✅ User Profile: Configured');
  console.log('✅ Organization: Set up');
  console.log('\n🎉 Your portfolio is ready to use!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Visit http://localhost:5173/admin');
  console.log('   2. Start customizing your content');
  console.log('   3. Add your story, journey, and projects');
}

diagnoseProfile().catch(error => {
  console.error('\n❌ Diagnostic failed:', error.message);
  console.error('\nFull error:', error);
});
