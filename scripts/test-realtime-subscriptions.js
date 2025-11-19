// Test real-time subscriptions functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔄 Testing Real-time Subscriptions');
console.log('='.repeat(50));

async function testRealtimeSubscriptions() {
    console.log('\n1️⃣  Setting up test subscription...');
    
    // Get a test org_id
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id, username')
        .eq('username', 'admin')
        .single();
    
    if (!profile) {
        console.log('❌ No test profile found');
        return;
    }
    
    console.log(`✅ Testing with org_id: ${profile.org_id} (@${profile.username})`);
    
    // Set up a test subscription
    const subscription = supabase
        .channel('test-case-studies')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'case_studies',
                filter: `org_id=eq.${profile.org_id}`
            }, 
            (payload) => {
                console.log('🔄 Real-time update received:', {
                    event: payload.eventType,
                    table: payload.table,
                    new: payload.new?.title,
                    old: payload.old?.title
                });
            }
        )
        .subscribe((status) => {
            console.log('📡 Subscription status:', status);
        });
    
    console.log('\n2️⃣  Subscription setup complete');
    console.log('   - Listening for changes to case_studies table');
    console.log(`   - Filtered to org_id: ${profile.org_id}`);
    console.log('   - Will log any INSERT, UPDATE, DELETE events');
    
    console.log('\n3️⃣  Testing instructions:');
    console.log('   1. Keep this script running');
    console.log('   2. In another terminal/browser, make changes to case studies');
    console.log('   3. Watch for real-time updates in this console');
    console.log('   4. Press Ctrl+C to stop');
    
    // Keep the script running
    console.log('\n🔄 Listening for real-time updates...');
    console.log('   (Press Ctrl+C to stop)');
    
    // Prevent the script from exiting
    process.stdin.resume();
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log('\n🔄 Cleaning up subscription...');
        subscription.unsubscribe();
        console.log('✅ Subscription cleaned up');
        process.exit(0);
    });
}

async function testRealtimeCapabilities() {
    console.log('\n4️⃣  Testing Supabase real-time capabilities...');
    
    try {
        // Test if real-time is enabled
        const testChannel = supabase.channel('test-connection');
        
        testChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Real-time connection successful');
                console.log('   - Supabase real-time is working');
                console.log('   - WebSocket connection established');
                testChannel.unsubscribe();
                
                // Start the actual test
                testRealtimeSubscriptions();
            } else if (status === 'CHANNEL_ERROR') {
                console.log('❌ Real-time connection failed');
                console.log('   - Check Supabase configuration');
                console.log('   - Ensure real-time is enabled in Supabase dashboard');
            } else {
                console.log(`📡 Connection status: ${status}`);
            }
        });
    } catch (error) {
        console.error('❌ Error testing real-time capabilities:', error);
    }
}

console.log('\n🚀 Starting real-time test...');
testRealtimeCapabilities();