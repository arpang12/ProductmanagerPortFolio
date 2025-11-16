/**
 * Comprehensive Data Persistence Pipeline Diagnostic
 * 
 * Traces the complete flow from editor input → database → frontend display
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 DATA PERSISTENCE PIPELINE DIAGNOSTIC\n');
console.log('='.repeat(80));

async function diagnosePipeline() {
  try {
    // Step 1: Check Supabase Connection
    console.log('\n📡 STEP 1: Checking Supabase Connection');
    console.log('-'.repeat(80));
    
    console.log(`Supabase URL: ${process.env.VITE_SUPABASE_URL}`);
    console.log(`Anon Key: ${process.env.VITE_SUPABASE_ANON_KEY ? 'Set (length: ' + process.env.VITE_SUPABASE_ANON_KEY.length + ')' : 'NOT SET'}`);
    
    const isDevelopmentMode = !process.env.VITE_SUPABASE_URL || 
                              !process.env.VITE_SUPABASE_ANON_KEY || 
                              process.env.VITE_SUPABASE_URL.includes('placeholder');
    
    if (isDevelopmentMode) {
      console.log('\n⚠️  WARNING: DEVELOPMENT MODE DETECTED!');
      console.log('   - Supabase is NOT configured');
      console.log('   - Data will NOT persist to database');
      console.log('   - Using mock data only');
      console.log('\n💡 To fix: Configure Supabase in .env.local');
      console.log('   VITE_SUPABASE_URL=your_supabase_url');
      console.log('   VITE_SUPABASE_ANON_KEY=your_anon_key');
      return;
    }
    
    console.log('✅ Supabase configured');
    
    // Step 2: Check Authentication
    console.log('\n👤 STEP 2: Checking Authentication');
    console.log('-'.repeat(80));
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ NOT AUTHENTICATED');
      console.log('   Error:', authError?.message || 'No user found');
      console.log('\n💡 To fix: Log in to the application first');
      return;
    }
    
    console.log(`✅ Authenticated as: ${user.email}`);
    console.log(`   User ID: ${user.id}`);
    
    // Step 3: Check User Profile
    console.log('\n📋 STEP 3: Checking User Profile');
    console.log('-'.repeat(80));
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.log('❌ NO USER PROFILE FOUND');
      console.log('   Error:', profileError?.message || 'Profile not found');
      console.log('\n💡 To fix: Create user profile first');
      console.log('   Run: node scripts/create-profile-for-current-user.js');
      return;
    }
    
    console.log(`✅ Profile found`);
    console.log(`   Profile ID: ${profile.profile_id}`);
    console.log(`   Org ID: ${profile.org_id}`);
    
    // Step 4: Check Case Studies
    console.log('\n📝 STEP 4: Checking Case Studies');
    console.log('-'.repeat(80));
    
    const { data: caseStudies, error: csError } = await supabase
      .from('case_studies')
      .select('*')
      .eq('org_id', profile.org_id)
      .order('updated_at', { ascending: false });
    
    if (csError) {
      console.log('❌ ERROR FETCHING CASE STUDIES');
      console.log('   Error:', csError.message);
      console.log('   Code:', csError.code);
      console.log('   Details:', csError.details);
      return;
    }
    
    console.log(`✅ Found ${caseStudies?.length || 0} case study(ies)`);
    
    if (!caseStudies || caseStudies.length === 0) {
      console.log('\n⚠️  No case studies found');
      console.log('   This is normal if you haven\'t created any yet');
      console.log('\n💡 Create a case study in the admin panel to test persistence');
      return;
    }
    
    // Step 5: Check Each Case Study's Sections
    console.log('\n🔍 STEP 5: Checking Case Study Sections');
    console.log('-'.repeat(80));
    
    for (const cs of caseStudies) {
      console.log(`\n📄 Case Study: "${cs.title}"`);
      console.log(`   ID: ${cs.case_study_id}`);
      console.log(`   Published: ${cs.is_published ? 'YES' : 'NO'}`);
      console.log(`   Last Updated: ${new Date(cs.updated_at).toLocaleString()}`);
      
      // Fetch sections
      const { data: sections, error: sectError } = await supabase
        .from('case_study_sections')
        .select('*')
        .eq('case_study_id', cs.case_study_id)
        .order('section_type');
      
      if (sectError) {
        console.log(`   ❌ Error fetching sections: ${sectError.message}`);
        continue;
      }
      
      console.log(`   Total Sections: ${sections?.length || 0}`);
      
      // Check target sections
      const targetSections = ['gallery', 'document', 'video', 'figma', 'miro', 'links'];
      
      console.log('\n   Target Sections Status:');
      for (const sectionType of targetSections) {
        const section = sections?.find(s => s.section_type === sectionType);
        
        if (!section) {
          console.log(`   ❌ ${sectionType.padEnd(10)} - NOT IN DATABASE`);
          continue;
        }
        
        try {
          const content = typeof section.content === 'string' 
            ? JSON.parse(section.content) 
            : section.content;
          
          const enabled = content.enabled;
          const hasContent = checkHasContent(sectionType, content);
          
          console.log(`   ${enabled && hasContent ? '✅' : '⚠️'} ${sectionType.padEnd(10)} - Enabled: ${enabled}, Has Content: ${hasContent}`);
          
          // Show content details
          if (sectionType === 'figma' && content.url) {
            console.log(`      URL: ${content.url}`);
            console.log(`      Caption: ${content.caption || 'None'}`);
          }
          
        } catch (e) {
          console.log(`   ❌ ${sectionType.padEnd(10)} - Error: ${e.message}`);
        }
      }
    }
    
    // Step 6: Test Write Permission
    console.log('\n\n✍️  STEP 6: Testing Write Permissions');
    console.log('-'.repeat(80));
    
    const testCaseStudyId = 'test-' + Date.now();
    
    console.log('Attempting to create test case study...');
    const { data: testCS, error: writeError } = await supabase
      .from('case_studies')
      .insert({
        case_study_id: testCaseStudyId,
        org_id: profile.org_id,
        title: 'Test Case Study - DELETE ME',
        template: 'default',
        is_published: false
      })
      .select()
      .single();
    
    if (writeError) {
      console.log('❌ WRITE PERMISSION DENIED');
      console.log('   Error:', writeError.message);
      console.log('   Code:', writeError.code);
      console.log('\n💡 This is the problem! RLS policies may be blocking writes.');
      console.log('   Check Supabase RLS policies for case_studies table');
      return;
    }
    
    console.log('✅ Write permission OK');
    
    // Clean up test
    await supabase
      .from('case_studies')
      .delete()
      .eq('case_study_id', testCaseStudyId);
    
    console.log('✅ Test case study cleaned up');
    
    // Step 7: Summary
    console.log('\n\n📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n✅ All checks passed!');
    console.log('\nIf data is still not persisting, check:');
    console.log('1. Browser console for JavaScript errors');
    console.log('2. Network tab for failed API calls');
    console.log('3. Supabase dashboard for actual data');
    console.log('4. Make sure you click "Save Changes" button');
    console.log('5. Check if updateCaseStudy API is being called');
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    console.error('Stack:', error.stack);
  }
}

function checkHasContent(sectionType, content) {
  switch (sectionType) {
    case 'gallery':
      return content.images && content.images.length > 0;
    case 'links':
      return content.items && content.items.trim().length > 0;
    case 'video':
    case 'figma':
    case 'miro':
    case 'document':
      return content.url && content.url.trim().length > 0;
    default:
      return false;
  }
}

diagnosePipeline();
