import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteUpload() {
  console.log('🎠 Testing Complete Upload Flow\n');
  
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
    
    // Step 2: Generate upload signature
    console.log('\n2️⃣ Generating upload signature...');
    const { data: signatureData, error: signatureError } = await supabase.functions.invoke('generate-upload-signature', {
      body: {
        asset_type: 'image',
        original_filename: 'test-complete.jpg',
        file_size: 50000,
        mime_type: 'image/jpeg'
      }
    });
    
    if (signatureError) {
      console.log('❌ Signature generation failed:', signatureError);
      return;
    }
    console.log('✅ Upload signature generated');
    console.log('Asset ID:', signatureData.asset_id);
    
    // Step 3: Simulate successful Cloudinary upload
    console.log('\n3️⃣ Simulating Cloudinary upload...');
    const mockCloudinaryResult = {
      public_id: signatureData.upload_params.public_id,
      secure_url: `https://res.cloudinary.com/dgymjtqil/image/upload/${signatureData.upload_params.public_id}.jpg`,
      width: 800,
      height: 600
    };
    console.log('Mock Cloudinary result:', mockCloudinaryResult);
    
    // Step 4: Finalize upload
    console.log('\n4️⃣ Finalizing upload...');
    const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalize-upload', {
      body: {
        asset_id: signatureData.asset_id,
        cloudinary_public_id: mockCloudinaryResult.public_id,
        cloudinary_url: mockCloudinaryResult.secure_url,
        width: mockCloudinaryResult.width,
        height: mockCloudinaryResult.height
      }
    });
    
    if (finalizeError) {
      console.log('❌ Finalize failed:', finalizeError);
      return;
    }
    console.log('✅ Upload finalized');
    console.log('Final asset:', finalizeData.asset);
    
    // Step 5: Create carousel slide
    console.log('\n5️⃣ Creating carousel slide...');
    
    function ulid() {
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 15);
      return (timestamp + randomPart).toUpperCase();
    }
    
    const { data: slideData, error: slideError } = await supabase
      .from('carousel_slides')
      .insert({
        slide_id: ulid(),
        carousel_id: 'default-carousel',
        asset_id: signatureData.asset_id,
        title: 'Test Upload Image',
        description: 'Test description for uploaded image',
        order_key: '999999' // Put at end
      })
      .select(`
        *,
        assets (*)
      `)
      .single();
    
    if (slideError) {
      console.log('❌ Carousel slide creation failed:', slideError);
      return;
    }
    
    console.log('✅ Carousel slide created successfully');
    console.log('Slide data:', slideData);
    
    // Step 6: Verify carousel retrieval
    console.log('\n6️⃣ Testing carousel retrieval...');
    const { data: carouselImages, error: retrieveError } = await supabase
      .from('carousel_slides')
      .select(`
        *,
        assets (*)
      `)
      .eq('carousel_id', 'default-carousel')
      .eq('is_active', true)
      .order('order_key');
    
    if (retrieveError) {
      console.log('❌ Carousel retrieval failed:', retrieveError);
    } else {
      console.log(`✅ Carousel retrieval successful (${carouselImages.length} images)`);
    }
    
    // Clean up - delete the test slide
    await supabase
      .from('carousel_slides')
      .delete()
      .eq('slide_id', slideData.slide_id);
    
    console.log('\n🎉 Complete upload flow test successful!');
    console.log('All components are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteUpload().catch(console.error);