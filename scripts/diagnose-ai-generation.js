import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 AI Generation Diagnostic\n');
console.log('='.repeat(70));

async function diagnoseAIGeneration() {
  try {
    // 1. Check if user is authenticated
    console.log('\n📋 1. Checking Authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Not authenticated');
      console.log('   Please log in to the application first');
      return;
    }
    console.log('✅ Authenticated as:', user.email);

    // 2. Check user profile
    console.log('\n📋 2. Checking User Profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.log('❌ User profile not found');
      console.log('   Error:', profileError?.message);
      return;
    }
    console.log('✅ Profile found, org_id:', profile.org_id);

    // 3. Check AI configuration
    console.log('\n📋 3. Checking AI Configuration...');
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('org_id', profile.org_id)
      .single();
    
    if (configError) {
      console.log('❌ AI configuration not found');
      console.log('   Error:', configError.message);
      console.log('\n💡 Solution:');
      console.log('   1. Go to Admin Page');
      console.log('   2. Click "AI Settings"');
      console.log('   3. Enter your Gemini API key');
      console.log('   4. Test connection');
      console.log('   5. Save settings');
      return;
    }
    
    console.log('✅ AI configuration found');
    console.log('   Config ID:', aiConfig.config_id);
    console.log('   Provider:', aiConfig.provider);
    console.log('   Selected Model:', aiConfig.selected_model);
    console.log('   Is Configured:', aiConfig.is_configured);
    console.log('   Has API Key:', aiConfig.encrypted_api_key ? 'Yes' : 'No');

    if (!aiConfig.is_configured) {
      console.log('\n⚠️  AI is not configured');
      console.log('   Please configure AI Settings first');
      return;
    }

    if (!aiConfig.encrypted_api_key) {
      console.log('\n❌ No API key stored');
      console.log('   Please add your Gemini API key in AI Settings');
      return;
    }

    // 4. Check Edge Function
    console.log('\n📋 4. Testing Edge Function...');
    console.log('   Calling ai-enhance-content...');
    
    const { data: testData, error: edgeError } = await supabase.functions.invoke('ai-enhance-content', {
      body: {
        prompt: 'Say "Hello, AI is working!" in a friendly way.',
        tone: 'friendly'
      }
    });
    
    if (edgeError) {
      console.log('❌ Edge Function error:', edgeError.message);
      console.log('\n🔍 Possible causes:');
      console.log('   1. Edge Function not deployed');
      console.log('   2. Invalid API key');
      console.log('   3. API quota exceeded');
      console.log('   4. Network issues');
      console.log('   5. Model not available');
      
      if (edgeError.message.includes('not found')) {
        console.log('\n💡 Edge Function may not be deployed');
        console.log('   Run: supabase functions deploy ai-enhance-content');
      } else if (edgeError.message.includes('API')) {
        console.log('\n💡 Check your Gemini API key');
        console.log('   1. Go to https://ai.google.dev/');
        console.log('   2. Verify your API key is valid');
        console.log('   3. Check quota limits');
      }
      return;
    }
    
    if (testData && testData.generated_text) {
      console.log('✅ Edge Function working!');
      console.log('   Response:', testData.generated_text.substring(0, 100) + '...');
      console.log('   Model used:', testData.model_used);
    } else {
      console.log('⚠️  Edge Function returned empty response');
      console.log('   Data:', testData);
    }

    // 5. Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(70));
    console.log('✅ Authentication: OK');
    console.log('✅ User Profile: OK');
    console.log('✅ AI Configuration: OK');
    console.log('✅ Edge Function: OK');
    console.log('\n🎉 AI Generation should be working!');
    console.log('\nIf you still see errors, check:');
    console.log('  1. Browser console for detailed errors');
    console.log('  2. Network tab for failed requests');
    console.log('  3. Supabase dashboard for Edge Function logs');

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
    console.error(error);
  }
}

diagnoseAIGeneration();
