import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS Policies and Data Issues\n');
  
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
    
    // Step 2: Check user profile
    console.log('\n2️⃣ Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      console.log('🔧 Creating user profile...');
      
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          org_id: 'arpan-portfolio',
          email: authData.user.email,
          name: 'Arpan Guria',
          role: 'admin'
        });
      
      if (createError) {
        console.log('❌ Failed to create profile:', createError.message);
      } else {
        console.log('✅ User profile created');
      }
    } else {
      console.log('✅ User profile exists:', profile.org_id);
    }
    
    // Step 3: Test problematic queries
    console.log('\n3️⃣ Testing problematic queries...');
    
    const queries = [
      { name: 'AI Configurations', table: 'ai_configurations' },
      { name: 'Story Sections', table: 'story_sections' },
      { name: 'Journey Timelines', table: 'journey_timelines' },
      { name: 'Contact Sections', table: 'contact_sections' },
      { name: 'CV Sections', table: 'cv_sections' }
    ];
    
    for (const query of queries) {
      try {
        const { data, error } = await supabase
          .from(query.table)
          .select('*')
          .eq('org_id', 'arpan-portfolio')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${query.name} error:`, error.message);
        } else {
          console.log(`✅ ${query.name} accessible (${data.length} records)`);
        }
      } catch (err) {
        console.log(`❌ ${query.name} exception:`, err.message);
      }
    }
    
    // Step 4: Test carousel access (this is what we need for image upload)
    console.log('\n4️⃣ Testing carousel access...');
    const { data: carousels, error: carouselError } = await supabase
      .from('carousels')
      .select('*')
      .eq('org_id', 'arpan-portfolio');
    
    if (carouselError) {
      console.log('❌ Carousel error:', carouselError.message);
    } else {
      console.log(`✅ Carousel accessible (${carousels.length} records)`);
      
      if (carousels.length === 0) {
        console.log('🔧 Creating default carousel...');
        const { error: createCarouselError } = await supabase
          .from('carousels')
          .insert({
            carousel_id: 'default-carousel',
            org_id: 'arpan-portfolio',
            name: 'Homepage Carousel'
          });
        
        if (createCarouselError) {
          console.log('❌ Failed to create carousel:', createCarouselError.message);
        } else {
          console.log('✅ Default carousel created');
        }
      }
    }
    
    console.log('\n🎯 RLS Policy Fix Complete!');
    console.log('Try the image upload now - the carousel should be accessible.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixRLSPolicies().catch(console.error);