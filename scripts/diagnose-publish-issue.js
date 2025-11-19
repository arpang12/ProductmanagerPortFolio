import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnosePublishIssue() {
  console.log('🔍 Diagnosing Portfolio Publishing Issue...\n');

  try {
    // Step 1: Check authentication
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message || 'No user found');
      return;
    }

    console.log('✅ User authenticated:', user.email);
    const orgId = user.id;

    // Step 2: Check user profile
    console.log('\n2. Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
      console.log('💡 You need a profile to publish. Creating one...');
      
      // Try to create profile
      const defaultUsername = user.email?.split('@')[0]?.replace(/[^a-z0-9]/g, '') || `user${Date.now().toString().slice(-6)}`;
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          org_id: orgId,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          username: defaultUsername,
          is_portfolio_public: true,
          portfolio_status: 'draft'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create profile:', createError.message);
        return;
      }
      
      console.log('✅ Profile created:', newProfile.username);
    } else {
      console.log('✅ Profile found:');
      console.log('   Username:', profile.username);
      console.log('   Portfolio Status:', profile.portfolio_status);
      console.log('   Is Public:', profile.is_portfolio_public);
    }

    // Step 3: Check portfolio content
    console.log('\n3. Checking portfolio content...');
    
    // Check case studies
    const { data: caseStudies, error: caseStudyError } = await supabase
      .from('case_studies')
      .select('case_study_id, title, is_published')
      .eq('org_id', orgId);

    if (caseStudyError) {
      console.error('❌ Case studies error:', caseStudyError.message);
    } else {
      console.log('✅ Case studies found:', caseStudies?.length || 0);
      if (caseStudies && caseStudies.length > 0) {
        caseStudies.forEach((cs, i) => {
          console.log(`   ${i + 1}. "${cs.title}" - Published: ${cs.is_published}`);
        });
      }
    }

    // Check my story
    const { data: myStory, error: storyError } = await supabase
      .from('my_story_sections')
      .select('section_id, section_type, enabled')
      .eq('org_id', orgId);

    if (storyError) {
      console.error('❌ My story error:', storyError.message);
    } else {
      console.log('✅ My story sections found:', myStory?.length || 0);
    }

    // Check contact info
    const { data: contact, error: contactError } = await supabase
      .from('contact_sections')
      .select('section_id, section_type, enabled')
      .eq('org_id', orgId);

    if (contactError) {
      console.error('❌ Contact sections error:', contactError.message);
    } else {
      console.log('✅ Contact sections found:', contact?.length || 0);
    }

    // Step 4: Test publish function
    console.log('\n4. Testing publish function...');
    
    // Check if profile has username (required for publishing)
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('username, portfolio_status')
      .eq('org_id', orgId)
      .single();

    if (!currentProfile?.username) {
      console.error('❌ No username found - cannot publish');
      console.log('💡 Set a username in Profile Settings first');
      return;
    }

    console.log('✅ Username available:', currentProfile.username);
    console.log('   Current status:', currentProfile.portfolio_status);

    // Try to update portfolio status to published
    console.log('\n5. Attempting to publish portfolio...');
    const { data: publishResult, error: publishError } = await supabase
      .from('user_profiles')
      .update({ portfolio_status: 'published' })
      .eq('org_id', orgId)
      .select()
      .single();

    if (publishError) {
      console.error('❌ Publish failed:', publishError.message);
      console.log('   Error code:', publishError.code);
      console.log('   Error details:', publishError.details);
    } else {
      console.log('✅ Portfolio published successfully!');
      console.log('   New status:', publishResult.portfolio_status);
      console.log('   Public URL: https://yourapp.vercel.app/u/' + publishResult.username);
    }

    // Step 6: Verify published status
    console.log('\n6. Verifying published status...');
    const { data: verifyProfile } = await supabase
      .from('user_profiles')
      .select('portfolio_status, username')
      .eq('org_id', orgId)
      .single();

    if (verifyProfile) {
      console.log('✅ Final status:', verifyProfile.portfolio_status);
      if (verifyProfile.portfolio_status === 'published') {
        console.log('🎉 Portfolio is now PUBLISHED!');
        console.log('🌐 Public URL: https://yourapp.vercel.app/u/' + verifyProfile.username);
      } else {
        console.log('⚠️  Portfolio is still in draft mode');
      }
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

// Run diagnosis
diagnosePublishIssue().then(() => {
  console.log('\n🏁 Publishing diagnosis complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Diagnosis crashed:', error);
  process.exit(1);
});