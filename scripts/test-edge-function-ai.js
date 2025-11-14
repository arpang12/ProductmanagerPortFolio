import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEdgeFunction() {
  console.log('🧪 Testing AI Edge Function\n');
  console.log('='.repeat(60));
  
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Not authenticated');
      console.log('💡 Please log in to the application first\n');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    
    // Test Edge Function
    console.log('\n🔧 Testing Edge Function...');
    
    const testPayload = {
      prompt: 'Enhance this text',
      existing_text: 'This is a test.',
      tone: 'Professional',
      custom_instruction: 'Make it brief'
    };
    
    console.log('📤 Sending request:', testPayload);
    
    const { data, error } = await supabase.functions.invoke('ai-enhance-content', {
      body: testPayload
    });
    
    if (error) {
      console.log('\n❌ Edge Function Error:');
      console.log('   Status:', error.status || 'Unknown');
      console.log('   Message:', error.message);
      console.log('   Context:', error.context || 'None');
      
      // Try to parse error details
      if (data && typeof data === 'object') {
        console.log('\n📋 Error Details from Response:');
        console.log(JSON.stringify(data, null, 2));
      }
      
      console.log('\n🔍 Common Causes:');
      console.log('   1. Edge Function not deployed');
      console.log('   2. Invalid API key in database');
      console.log('   3. AI not configured');
      console.log('   4. API quota exceeded');
      console.log('   5. Network/connection issues');
      
      console.log('\n💡 Solutions:');
      console.log('   1. Deploy: supabase functions deploy ai-enhance-content');
      console.log('   2. Check API key in AI Settings');
      console.log('   3. Configure AI Settings in Admin page');
      console.log('   4. Check Gemini API quota at https://ai.google.dev/');
      console.log('   5. Check Supabase Edge Function logs');
      
      return;
    }
    
    if (!data) {
      console.log('\n❌ No data returned from Edge Function');
      return;
    }
    
    console.log('\n✅ Edge Function Response:');
    console.log('   Generated Text:', data.generated_text?.substring(0, 100) + '...');
    console.log('   Model Used:', data.model_used);
    console.log('   Full Response:', JSON.stringify(data, null, 2));
    
    console.log('\n🎉 Edge Function is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Unexpected Error:', error.message);
    console.error('   Stack:', error.stack);
  }
  
  console.log('\n' + '='.repeat(60));
}

testEdgeFunction();
