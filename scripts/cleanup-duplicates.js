import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate records\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@arpanportfolio.com',
      password: 'ArpanAdmin2024!'
    });
    
    if (authError) {
      console.log('❌ Login failed:', authError.message);
      return;
    }
    console.log('✅ Login successful');
    
    const orgId = 'arpan-portfolio';
    
    // Step 2: Clean up CV sections (keep only the latest one)
    console.log('\n2️⃣ Cleaning up CV sections...');
    const { data: cvSections } = await supabase
      .from('cv_sections')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    console.log(`Found ${cvSections.length} CV sections`);
    
    if (cvSections.length > 1) {
      // Keep the latest one, delete the rest
      const keepSection = cvSections[0];
      const deleteIds = cvSections.slice(1).map(s => s.cv_section_id);
      
      console.log(`Keeping CV section: ${keepSection.cv_section_id}`);
      console.log(`Deleting ${deleteIds.length} duplicate CV sections...`);
      
      // Delete CV versions for duplicate sections first
      for (const sectionId of deleteIds) {
        await supabase
          .from('cv_versions')
          .delete()
          .eq('cv_section_id', sectionId);
      }
      
      // Delete duplicate CV sections
      const { error: deleteError } = await supabase
        .from('cv_sections')
        .delete()
        .in('cv_section_id', deleteIds);
      
      if (deleteError) {
        console.log('❌ Failed to delete CV sections:', deleteError.message);
      } else {
        console.log('✅ Duplicate CV sections deleted');
      }
    }
    
    // Step 3: Clean up Journey timelines
    console.log('\n3️⃣ Cleaning up Journey timelines...');
    const { data: timelines } = await supabase
      .from('journey_timelines')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    console.log(`Found ${timelines.length} journey timelines`);
    
    if (timelines.length > 1) {
      const keepTimeline = timelines[0];
      const deleteTimelineIds = timelines.slice(1).map(t => t.timeline_id);
      
      console.log(`Keeping timeline: ${keepTimeline.timeline_id}`);
      console.log(`Deleting ${deleteTimelineIds.length} duplicate timelines...`);
      
      // Delete milestones for duplicate timelines first
      for (const timelineId of deleteTimelineIds) {
        await supabase
          .from('journey_milestones')
          .delete()
          .eq('timeline_id', timelineId);
      }
      
      // Delete duplicate timelines
      const { error: deleteTimelineError } = await supabase
        .from('journey_timelines')
        .delete()
        .in('timeline_id', deleteTimelineIds);
      
      if (deleteTimelineError) {
        console.log('❌ Failed to delete timelines:', deleteTimelineError.message);
      } else {
        console.log('✅ Duplicate timelines deleted');
      }
    }
    
    // Step 4: Clean up Contact sections
    console.log('\n4️⃣ Cleaning up Contact sections...');
    const { data: contacts } = await supabase
      .from('contact_sections')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    console.log(`Found ${contacts.length} contact sections`);
    
    if (contacts.length > 1) {
      const keepContact = contacts[0];
      const deleteContactIds = contacts.slice(1).map(c => c.contact_id);
      
      console.log(`Keeping contact: ${keepContact.contact_id}`);
      console.log(`Deleting ${deleteContactIds.length} duplicate contacts...`);
      
      // Delete social links for duplicate contacts first
      for (const contactId of deleteContactIds) {
        await supabase
          .from('social_links')
          .delete()
          .eq('contact_id', contactId);
      }
      
      // Delete duplicate contacts
      const { error: deleteContactError } = await supabase
        .from('contact_sections')
        .delete()
        .in('contact_id', deleteContactIds);
      
      if (deleteContactError) {
        console.log('❌ Failed to delete contacts:', deleteContactError.message);
      } else {
        console.log('✅ Duplicate contacts deleted');
      }
    }
    
    // Step 5: Clean up AI configurations
    console.log('\n5️⃣ Cleaning up AI configurations...');
    const { data: aiConfigs } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    console.log(`Found ${aiConfigs.length} AI configurations`);
    
    if (aiConfigs.length > 1) {
      const keepConfig = aiConfigs[0];
      const deleteConfigIds = aiConfigs.slice(1).map(c => c.config_id);
      
      console.log(`Keeping AI config: ${keepConfig.config_id}`);
      console.log(`Deleting ${deleteConfigIds.length} duplicate configs...`);
      
      const { error: deleteConfigError } = await supabase
        .from('ai_configurations')
        .delete()
        .in('config_id', deleteConfigIds);
      
      if (deleteConfigError) {
        console.log('❌ Failed to delete AI configs:', deleteConfigError.message);
      } else {
        console.log('✅ Duplicate AI configs deleted');
      }
    }
    
    // Step 6: Verify cleanup
    console.log('\n6️⃣ Verifying cleanup...');
    
    const verifyQueries = [
      { name: 'CV Sections', table: 'cv_sections' },
      { name: 'Journey Timelines', table: 'journey_timelines' },
      { name: 'Contact Sections', table: 'contact_sections' },
      { name: 'AI Configurations', table: 'ai_configurations' }
    ];
    
    for (const query of verifyQueries) {
      const { data, error } = await supabase
        .from(query.table)
        .select('*')
        .eq('org_id', orgId);
      
      if (error) {
        console.log(`❌ ${query.name} verification failed:`, error.message);
      } else {
        console.log(`✅ ${query.name}: ${data.length} record(s) remaining`);
      }
    }
    
    console.log('\n🎉 Cleanup complete!');
    console.log('Refresh your admin dashboard - all sections should now load properly.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

cleanupDuplicates().catch(console.error);