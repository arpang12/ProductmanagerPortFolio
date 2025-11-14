import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealUpload() {
  console.log('📸 Testing Real Image Upload Process\n');
  
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
        original_filename: 'test-upload.jpg',
        file_size: 50000,
        mime_type: 'image/jpeg'
      }
    });
    
    if (signatureError) {
      console.log('❌ Signature generation failed:', signatureError);
      return;
    }
    console.log('✅ Upload signature generated');
    console.log('Upload URL:', signatureData.upload_url);
    console.log('Asset ID:', signatureData.asset_id);
    
    // Step 3: Create a test image blob
    console.log('\n3️⃣ Creating test image...');
    
    // Create a simple 1x1 pixel red image
    const canvas = document?.createElement ? document.createElement('canvas') : null;
    if (!canvas) {
      console.log('⚠️  Canvas not available in Node.js, using mock blob');
      // Create a mock blob for testing
      const testBlob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
      
      // Step 4: Upload to Cloudinary
      console.log('\n4️⃣ Uploading to Cloudinary...');
      const formData = new FormData();
      
      // Add all upload parameters
      Object.entries(signatureData.upload_params).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', testBlob, 'test-upload.jpg');
      
      console.log('Upload parameters:', signatureData.upload_params);
      
      const uploadResponse = await fetch(signatureData.upload_url, {
        method: 'POST',
        body: formData
      });
      
      console.log('Upload response status:', uploadResponse.status);
      const uploadResult = await uploadResponse.text();
      console.log('Upload response:', uploadResult);
      
      if (!uploadResponse.ok) {
        console.log('❌ Cloudinary upload failed');
        try {
          const errorData = JSON.parse(uploadResult);
          console.log('Error details:', errorData);
        } catch {
          console.log('Raw error:', uploadResult);
        }
        return;
      }
      
      console.log('✅ Cloudinary upload successful');
      
      // Parse the result
      let parsedResult;
      try {
        parsedResult = JSON.parse(uploadResult);
      } catch {
        console.log('❌ Failed to parse upload result');
        return;
      }
      
      // Step 5: Finalize upload
      console.log('\n5️⃣ Finalizing upload...');
      const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalize-upload', {
        body: {
          asset_id: signatureData.asset_id,
          cloudinary_public_id: parsedResult.public_id,
          cloudinary_url: parsedResult.secure_url,
          width: parsedResult.width,
          height: parsedResult.height
        }
      });
      
      if (finalizeError) {
        console.log('❌ Finalize failed:', finalizeError);
        return;
      }
      
      console.log('✅ Upload finalized');
      console.log('Final asset:', finalizeData.asset);
      
      console.log('\n🎉 Complete upload test successful!');
    } else {
      console.log('⚠️  Running in browser environment - use browser console for full test');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Check if we're in Node.js or browser
if (typeof window === 'undefined') {
  // Node.js environment
  global.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }
    append(key, value, filename) {
      this.data.set(key, { value, filename });
    }
  };
  
  global.Blob = class Blob {
    constructor(parts, options) {
      this.parts = parts;
      this.type = options?.type || '';
    }
  };
  
  global.fetch = (await import('node-fetch')).default;
}

testRealUpload().catch(console.error);