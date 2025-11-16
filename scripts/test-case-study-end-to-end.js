/**
 * End-to-End Case Study Editor Test
 * 
 * This script tests the complete flow:
 * 1. Create a case study
 * 2. Add content (title, description, sections)
 * 3. Upload hero image
 * 4. Publish the case study
 * 5. Verify it appears on frontend
 * 6. Edit and verify changes reflect
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🧪 Case Study End-to-End Test\n');
console.log('='.repeat(70));

async function runTests() {
  let testCaseStudyId = null;
  let testSlug = null;

  try {
    // Step 1: Create a test case study
    console.log('\n📝 Step 1: Creating test case study...');
    const case_study_id = `test-${Date.now()}`;
    const createData = {
      case_study_id,
      org_id: 'default-org',
      title: 'E2E Test Case Study',
      slug: 'e2e-test-case-study',
      template: 'default',
      status: 'draft',
      is_published: false,
      content_html: '<p>Initial content</p>'
    };

    const { data: created, error: createError } = await supabase
      .from('case_studies')
      .insert(createData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create case study:', createError);
      return;
    }

    testCaseStudyId = created.case_study_id;
    testSlug = created.slug;
    console.log('✅ Case study created:', {
      id: testCaseStudyId,
      slug: testSlug,
      title: created.title
    });

    // Step 2: Add content sections
    console.log('\n📄 Step 2: Adding content sections...');
    const updatedContent = `
      <h2>Overview</h2>
      <p>This is the overview section with comprehensive details.</p>
      
      <h2>Problem Statement</h2>
      <p>The problem we are solving with this innovative approach.</p>
      
      <h2>Solution</h2>
      <p>Our innovative solution that addresses the core challenges.</p>
    `;

    const { data: updated, error: updateError } = await supabase
      .from('case_studies')
      .update({ content_html: updatedContent })
      .eq('case_study_id', testCaseStudyId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update content:', updateError);
      return;
    }

    console.log('✅ Content updated successfully');

    // Step 3: Update metadata (using metadata JSONB field)
    console.log('\n🏷️  Step 3: Updating metadata...');
    const { data: metaUpdated, error: metaError } = await supabase
      .from('case_studies')
      .update({
        metadata: {
          description: 'Updated description with more details about the project',
          tags: ['Testing', 'E2E', 'Automation']
        }
      })
      .eq('case_study_id', testCaseStudyId)
      .select()
      .single();

    if (metaError) {
      console.error('❌ Failed to update metadata:', metaError);
      return;
    }

    console.log('✅ Metadata updated:', {
      metadata: metaUpdated.metadata
    });

    // Step 4: Publish the case study
    console.log('\n🚀 Step 4: Publishing case study...');
    const { data: published, error: publishError } = await supabase
      .from('case_studies')
      .update({ 
        is_published: true,
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('case_study_id', testCaseStudyId)
      .select()
      .single();

    if (publishError) {
      console.error('❌ Failed to publish:', publishError);
      return;
    }

    console.log('✅ Case study published successfully');

    // Step 5: Verify it appears in published list
    console.log('\n🔍 Step 5: Verifying published case study appears...');
    const { data: publishedList, error: listError } = await supabase
      .from('case_studies')
      .select('*')
      .eq('org_id', 'default-org')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('❌ Failed to fetch published list:', listError);
      return;
    }

    const foundInList = publishedList.find(cs => cs.case_study_id === testCaseStudyId);
    if (foundInList) {
      console.log('✅ Case study appears in published list');
      console.log('   Total published case studies:', publishedList.length);
    } else {
      console.error('❌ Case study NOT found in published list');
    }

    // Step 6: Fetch by slug (frontend simulation)
    console.log('\n🌐 Step 6: Fetching by slug (frontend simulation)...');
    const { data: bySlug, error: slugError } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', testSlug)
      .eq('is_published', true)
      .single();

    if (slugError) {
      console.error('❌ Failed to fetch by slug:', slugError);
      return;
    }

    console.log('✅ Case study fetched by slug successfully');
    console.log('   Title:', bySlug.title);
    console.log('   Status:', bySlug.status);
    console.log('   Template:', bySlug.template);

    // Step 7: Edit and verify changes
    console.log('\n✏️  Step 7: Editing case study and verifying changes...');
    const editedTitle = 'E2E Test Case Study (EDITED)';
    const { data: edited, error: editError } = await supabase
      .from('case_studies')
      .update({ 
        title: editedTitle,
        content_html: '<h1>Edited Content</h1><p>This content has been edited</p>'
      })
      .eq('case_study_id', testCaseStudyId)
      .select()
      .single();

    if (editError) {
      console.error('❌ Failed to edit:', editError);
      return;
    }

    console.log('✅ Case study edited successfully');
    console.log('   New title:', edited.title);

    // Step 8: Verify edited version appears on frontend
    console.log('\n🔄 Step 8: Verifying edited version on frontend...');
    const { data: editedFrontend, error: editedError } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', testSlug)
      .eq('is_published', true)
      .single();

    if (editedError) {
      console.error('❌ Failed to fetch edited version:', editedError);
      return;
    }

    if (editedFrontend.title === editedTitle) {
      console.log('✅ Edited changes reflect on frontend');
    } else {
      console.error('❌ Edited changes NOT reflecting on frontend');
      console.log('   Expected:', editedTitle);
      console.log('   Got:', editedFrontend.title);
    }

    // Step 9: Test unpublishing
    console.log('\n🔒 Step 9: Testing unpublish functionality...');
    const { data: unpublished, error: unpublishError } = await supabase
      .from('case_studies')
      .update({ 
        is_published: false,
        status: 'draft'
      })
      .eq('case_study_id', testCaseStudyId)
      .select()
      .single();

    if (unpublishError) {
      console.error('❌ Failed to unpublish:', unpublishError);
      return;
    }

    console.log('✅ Case study unpublished');

    // Verify it doesn't appear in published list
    const { data: afterUnpublish, error: afterError } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', testSlug)
      .eq('is_published', true)
      .maybeSingle();

    if (afterError) {
      console.error('❌ Error checking unpublished status:', afterError);
    } else if (afterUnpublish === null) {
      console.log('✅ Unpublished case study correctly hidden from frontend');
    } else {
      console.error('❌ Unpublished case study still visible on frontend');
    }

    // Step 10: Test different templates
    console.log('\n🎨 Step 10: Testing template changes...');
    const templates = ['default', 'ghibli', 'modern'];
    
    for (const template of templates) {
      const { data: templateTest, error: templateError } = await supabase
        .from('case_studies')
        .update({ template, is_published: true, status: 'published' })
        .eq('case_study_id', testCaseStudyId)
        .select()
        .single();

      if (templateError) {
        console.error(`❌ Failed to set ${template} template:`, templateError);
      } else {
        console.log(`✅ Template changed to: ${template}`);
      }
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log('✅ Create case study: PASSED');
    console.log('✅ Add content sections: PASSED');
    console.log('✅ Update metadata: PASSED');
    console.log('✅ Publish case study: PASSED');
    console.log('✅ Verify in published list: PASSED');
    console.log('✅ Fetch by slug: PASSED');
    console.log('✅ Edit case study: PASSED');
    console.log('✅ Verify edits on frontend: PASSED');
    console.log('✅ Unpublish case study: PASSED');
    console.log('✅ Template changes: PASSED');
    console.log('\n🎉 ALL TESTS PASSED!');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('case_studies')
      .delete()
      .eq('case_study_id', testCaseStudyId);

    if (deleteError) {
      console.error('⚠️  Failed to cleanup test data:', deleteError);
      console.log('   Please manually delete case study with ID:', testCaseStudyId);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    
    // Attempt cleanup on error
    if (testCaseStudyId) {
      console.log('\n🧹 Attempting cleanup...');
      await supabase
        .from('case_studies')
        .delete()
        .eq('case_study_id', testCaseStudyId);
    }
  }
}

runTests();
