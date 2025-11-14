import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCarouselUpload() {
  console.log('🎠 Testing Carousel Upload Process\n');
  
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
    
    // Step 2: Test upload signature generation
    console.log('\n2️⃣ Testing upload signature...');
    const { data: signatureData, error: signatureError } = await supabase.functions.invoke('generate-upload-signature', {
      body: {
        asset_type: 'image',
        original_filename: 'test-carousel.jpg',
        file_size: 100000,
        mime_type: 'image/jpeg'
      }
    });
    
    if (signatureError) {
      console.log('❌ Signature generation failed:', signatureError);
      return;
    }
    console.log('✅ Upload signature generated');
    console.log('Asset ID:', signatureData.asset_id);
    
    // Step 3: Test carousel creation (without actual file upload)
    console.log('\n3️⃣ Testing carousel creation...');
    
    // First check if carousel exists
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single();
    
    console.log('User org_id:', profile?.org_id);
    
    const { data: carousel } = await supabase
      .from('carousels')
      .select('*')
      .eq('org_id', profile.org_id)
      .single();
    
    if (carousel) {
      console.log('✅ Carousel exists:', carousel.carousel_id);
    } else {
      console.log('⚠️  No carousel found, will be created automatically');
    }
    
    // Step 4: Test carousel slide creation
    console.log('\n4️⃣ Testing carousel slide creation...');
    
    // Generate ULID for slide
    function ulid() {
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 15);
      return (timestamp + randomPart).toUpperCase();
    }
    
    const slide_id = ulid();
    const carousel_id = carousel?.carousel_id || 'default-carousel';
    
    // Test insert into carousel_slides
    const { data: slideData, error: slideError } = await supabase
      .from('carousel_slides')
      .insert({
        slide_id,
        carousel_id,
        asset_id: signatureData.asset_id,
        title: 'Test Carousel Image',
        description: 'Test description',
        order_key: '000001'
      })
      .select()
      .single();
    
    if (slideError) {
      console.log('❌ Carousel slide creation failed:', slideError);
      
      // Check if it's a foreign key constraint error
      if (slideError.code === '23503') {
        console.log('🔍 Foreign key constraint error - checking references...');
        
        // Check if asset exists
        const { data: asset } = await supabase
          .from('assets')
          .select('*')
          .eq('asset_id', signatureData.asset_id)
          .single();
        
        if (asset) {
          console.log('✅ Asset exists in database');
        } else {
          console.log('❌ Asset not found in database');
        }
        
        // Check if carousel exists
        if (!carousel) {
          console.log('🔧 Creating carousel...');
          const { error: carouselError } = await supabase
            .from('carousels')
            .insert({
              carousel_id: 'default-carousel',
              org_id: profile.org_id,
              name: 'Homepage Carousel'
            });
          
          if (carouselError) {
            console.log('❌ Carousel creation failed:', carouselError);
          } else {
            console.log('✅ Carousel created');
          }
        }
      }
      
      return;
    }
    
    console.log('✅ Carousel slide created successfully');
    console.log('Slide data:', slideData);
    
    // Clean up - delete the test slide
    await supabase
      .from('carousel_slides')
      .delete()
      .eq('slide_id', slide_id);
    
    console.log('\n🎉 Carousel upload test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCarouselUpload().catch(console.error);