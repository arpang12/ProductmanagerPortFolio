import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Load from .env.local with VITE_ prefix
const envConfig = await import('dotenv').then(m => m.config({ path: '.env.local' }));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment loaded:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkApiKey() {
  console.log('🔍 Checking API Key in Database\n');
  console.log('='.repeat(60));
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Not authenticated');
      console.log('💡 Please log in to the application first\n');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.log('❌ User profile not found');
      return;
    }
    
    console.log('✅ Organization ID:', profile.org_id);
    
    // Get AI configuration
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('org_id', profile.org_id)
      .single();
    
    if (configError || !aiConfig) {
      console.log('❌ AI configuration not found');
      console.log('💡 Please configure AI Settings in the Admin page\n');
      return;
    }
    
    console.log('\n📋 AI Configuration:');
    console.log('   Config ID:', aiConfig.config_id);
    console.log('   Model:', aiConfig.selected_model);
    console.log('   Configured:', aiConfig.is_configured);
    console.log('   Updated:', aiConfig.updated_at);
    
    // Check API key
    const apiKey = aiConfig.encrypted_api_key;
    
    if (!apiKey) {
      console.log('\n❌ No API key stored');
      console.log('💡 Please add your Gemini API key in AI Settings\n');
      return;
    }
    
    console.log('\n🔑 API Key Analysis:');
    console.log('   Length:', apiKey.length, 'characters');
    console.log('   First 10 chars:', apiKey.substring(0, 10));
    console.log('   Last 4 chars:', apiKey.substring(apiKey.length - 4));
    console.log('   Has whitespace:', /\s/.test(apiKey) ? '⚠️  YES (PROBLEM!)' : '✅ No');
    console.log('   Starts with "AIza":', apiKey.startsWith('AIza') ? '✅ Yes' : '⚠️  No (might be invalid)');
    
    // Test the API key with Gemini
    console.log('\n🧪 Testing API Key with Gemini...');
    
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.selected_model}:generateContent?key=${apiKey.trim()}`;
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello" in one word' }]
        }]
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API Key is VALID!');
      console.log('   Response:', result.candidates[0]?.content?.parts[0]?.text);
    } else {
      console.log('❌ API Key is INVALID');
      console.log('   Error:', result.error?.message);
      console.log('\n🔧 Possible Issues:');
      console.log('   1. API key is incorrect or expired');
      console.log('   2. API key has extra spaces (trim needed)');
      console.log('   3. API key doesn\'t have proper permissions');
      console.log('   4. Model name is incorrect');
      console.log('\n💡 Solutions:');
      console.log('   1. Get a new API key from https://ai.google.dev/');
      console.log('   2. Copy the key carefully without extra spaces');
      console.log('   3. Paste it in AI Settings and save again');
      console.log('   4. Try a different model (e.g., gemini-1.5-pro)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
}

checkApiKey();
