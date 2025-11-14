import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixApiKey() {
  console.log('🔧 Fixing API Key Whitespace\n');
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
      console.log('💡 Please configure AI Settings first\n');
      return;
    }
    
    const oldKey = aiConfig.encrypted_api_key;
    
    if (!oldKey) {
      console.log('❌ No API key found');
      console.log('💡 Please add your API key in AI Settings\n');
      return;
    }
    
    console.log('\n📋 Current API Key:');
    console.log('   Length:', oldKey.length);
    console.log('   Has whitespace:', /\s/.test(oldKey) ? '⚠️  YES' : '✅ No');
    
    // Trim the API key
    const newKey = oldKey.trim();
    
    if (oldKey === newKey) {
      console.log('\n✅ API key is already clean (no whitespace)');
      console.log('💡 The issue might be:');
      console.log('   1. Invalid API key - get a new one from https://ai.google.dev/');
      console.log('   2. Wrong model name - try "gemini-1.5-pro"');
      console.log('   3. API key expired - create a new one\n');
      return;
    }
    
    console.log('\n🔧 Fixing API key...');
    console.log('   Old length:', oldKey.length);
    console.log('   New length:', newKey.length);
    console.log('   Removed:', oldKey.length - newKey.length, 'whitespace characters');
    
    // Update the API key
    const { error: updateError } = await supabase
      .from('ai_configurations')
      .update({
        encrypted_api_key: newKey,
        updated_at: new Date().toISOString()
      })
      .eq('config_id', aiConfig.config_id);
    
    if (updateError) {
      console.log('❌ Failed to update:', updateError.message);
      return;
    }
    
    console.log('✅ API key updated successfully!');
    
    // Test the fixed API key
    console.log('\n🧪 Testing fixed API key...');
    
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.selected_model}:generateContent?key=${newKey}`;
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Success" in one word' }]
        }]
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API Key is now VALID!');
      console.log('   Response:', result.candidates[0]?.content?.parts[0]?.text);
      console.log('\n🎉 Fix complete! AI generation should work now.');
    } else {
      console.log('❌ API Key is still INVALID');
      console.log('   Error:', result.error?.message);
      console.log('\n💡 The API key itself might be invalid.');
      console.log('   Please get a new API key from https://ai.google.dev/');
      console.log('   Then update it in AI Settings.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
}

fixApiKey();
