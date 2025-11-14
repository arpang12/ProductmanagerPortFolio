import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunctionDirect() {
  console.log('🔍 Testing Edge Function Direct Access\n');
  
  try {
    // Step 1: Login and get session
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
    console.log('Access token:', authData.session.access_token.substring(0, 20) + '...');
    
    // Step 2: Test direct fetch to Edge Function
    console.log('\n2️⃣ Testing direct fetch to Edge Function...');
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-upload-signature`;
    console.log('Edge Function URL:', edgeFunctionUrl);
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        asset_type: 'image',
        original_filename: 'test.jpg',
        file_size: 50000,
        mime_type: 'image/jpeg'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Direct fetch successful');
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed data:', data);
      } catch (e) {
        console.log('Failed to parse JSON response');
      }
    } else {
      console.log('❌ Direct fetch failed');
    }
    
    // Step 3: Test using Supabase client
    console.log('\n3️⃣ Testing using Supabase client...');
    try {
      const { data: clientData, error: clientError } = await supabase.functions.invoke('generate-upload-signature', {
        body: {
          asset_type: 'image',
          original_filename: 'test.jpg',
          file_size: 50000,
          mime_type: 'image/jpeg'
        }
      });
      
      if (clientError) {
        console.log('❌ Supabase client failed:', clientError);
        console.log('Error details:', JSON.stringify(clientError, null, 2));
      } else {
        console.log('✅ Supabase client successful:', clientData);
      }
    } catch (e) {
      console.log('❌ Supabase client exception:', e.message);
    }
    
    // Step 4: Check function status
    console.log('\n4️⃣ Checking function deployment status...');
    try {
      const statusResponse = await fetch(`${supabaseUrl}/functions/v1/`, {
        headers: {
          'Authorization': `Bearer ${authData.session.access_token}`,
          'apikey': supabaseKey
        }
      });
      
      console.log('Functions status:', statusResponse.status);
      if (statusResponse.ok) {
        const statusText = await statusResponse.text();
        console.log('Functions response:', statusText);
      }
    } catch (e) {
      console.log('Functions status check failed:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEdgeFunctionDirect().catch(console.error);