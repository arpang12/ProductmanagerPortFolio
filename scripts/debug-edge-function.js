import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugEdgeFunction() {
  console.log('🔍 Debugging Edge Function\n');
  
  try {
    // Login first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@arpanportfolio.com',
      password: 'ArpanAdmin2024!'
    });
    
    if (authError) {
      console.log('❌ Auth failed:', authError.message);
      return;
    }
    
    console.log('✅ Authenticated');
    
    // Make a direct fetch request to see the actual error
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-upload-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset_type: 'image',
        original_filename: 'test-image.jpg',
        file_size: 50000,
        mime_type: 'image/jpeg'
      })
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📊 Response Body:`, responseText);
    
    if (!response.ok) {
      console.log('\n❌ Edge Function Error Details:');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error:', errorData);
      } catch {
        console.log('Raw error:', responseText);
      }
    } else {
      console.log('\n✅ Edge Function Success!');
      try {
        const successData = JSON.parse(responseText);
        console.log('Success data:', successData);
      } catch {
        console.log('Raw success:', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugEdgeFunction().catch(console.error);