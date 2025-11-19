// Check if username field exists and what usernames are available
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking Username Field and Public Portfolio Access');
console.log('='.repeat(60));

async function checkUsernameField() {
    console.log('\n1️⃣  Checking user_profiles table structure...');
    
    // Get all user profiles to see what fields exist
    const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(5);
    
    if (profileError) {
        console.log('❌ Cannot read user profiles:', profileError.message);
        return;
    }
    
    console.log(`✅ Found ${profiles.length} user profiles`);
    
    if (profiles.length > 0) {
        console.log('\n📋 Available fields in user_profiles:');
        const fields = Object.keys(profiles[0]);
        fields.forEach(field => {
            console.log(`   - ${field}`);
        });
        
        console.log('\n👤 User profile data:');
        profiles.forEach((profile, index) => {
            console.log(`   ${index + 1}. ${profile.name} (${profile.email})`);
            console.log(`      - user_id: ${profile.user_id}`);
            console.log(`      - org_id: ${profile.org_id}`);
            console.log(`      - username: ${profile.username || 'NOT SET'}`);
            console.log(`      - is_portfolio_public: ${profile.is_portfolio_public}`);
            console.log('');
        });
        
        // Check if username field exists
        const hasUsernameField = 'username' in profiles[0];
        console.log(`📊 Username field exists: ${hasUsernameField}`);
        
        if (!hasUsernameField) {
            console.log('❌ USERNAME FIELD MISSING!');
            console.log('   This explains why getPublicPortfolioByUsername fails');
            console.log('   The method is looking for a username field that does not exist');
        } else {
            const profilesWithUsernames = profiles.filter(p => p.username);
            console.log(`📊 Profiles with usernames: ${profilesWithUsernames.length}/${profiles.length}`);
            
            if (profilesWithUsernames.length === 0) {
                console.log('❌ NO USERNAMES SET!');
                console.log('   All profiles have null/empty usernames');
                console.log('   This explains why getPublicPortfolioByUsername fails');
            }
        }
    }
    
    console.log('\n2️⃣  Testing the actual API call...');
    
    // Test the API call that the frontend is making
    console.log('   Testing: api.getPublicPortfolioByUsername("admin")');
    
    // Simulate the API call
    const { data: testProfile, error: testError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'admin')
        .eq('is_portfolio_public', true)
        .limit(1)
        .single();
    
    if (testError) {
        console.log('❌ API call failed:', testError.message);
        
        if (testError.message.includes('No rows')) {
            console.log('   No profile found with username="admin" and is_portfolio_public=true');
        }
    } else {
        console.log('✅ API call succeeded:', testProfile.name);
    }
    
    console.log('\n3️⃣  Checking what URL you are using...');
    
    console.log('   You mentioned: incognito mode with the link');
    console.log('   Expected URL format: http://localhost:3002/u/[username]');
    console.log('   Example: http://localhost:3002/u/admin');
    console.log('');
    
    // Check what usernames are actually available
    const availableUsernames = profiles
        .filter(p => p.username && p.is_portfolio_public)
        .map(p => p.username);
    
    if (availableUsernames.length > 0) {
        console.log('✅ Available public usernames:');
        availableUsernames.forEach(username => {
            console.log(`   - http://localhost:3002/u/${username}`);
        });
    } else {
        console.log('❌ No public usernames available');
        console.log('   You need to set usernames for your profiles');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSIS');
    console.log('='.repeat(60));
    
    if (!profiles[0] || !('username' in profiles[0])) {
        console.log('\n🚨 MISSING USERNAME FIELD');
        console.log('   The user_profiles table is missing the username column');
        console.log('   This needs to be added to the database schema');
    } else if (availableUsernames.length === 0) {
        console.log('\n🚨 NO USERNAMES SET');
        console.log('   The username field exists but no profiles have usernames set');
        console.log('   You need to set usernames in the admin panel');
    } else {
        console.log('\n✅ USERNAMES AVAILABLE');
        console.log('   Try these URLs:');
        availableUsernames.forEach(username => {
            console.log(`   http://localhost:3002/u/${username}`);
        });
    }
}

checkUsernameField().catch(console.error);