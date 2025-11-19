// Diagnose public access issues in incognito mode
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create client WITHOUT authentication (simulates incognito)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Diagnosing Public Access (Incognito Mode Simulation)\n');
console.log('='.repeat(70));

async function diagnose() {
    console.log('\n1️⃣  Checking if username column exists...');
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('username, is_portfolio_public')
            .limit(1);
        
        if (error) {
            console.log('❌ ERROR:', error.message);
            console.log('🔧 FIX: Run FIX_PUBLIC_PORTFOLIO_RLS.sql in Supabase SQL Editor');
            return;
        }
        
        if (!data || data.length === 0) {
            console.log('⚠️  No user profiles found');
            return;
        }
        
        const profile = data[0];
        if (!profile.username) {
            console.log('❌ username column is NULL');
            console.log('🔧 FIX: Run FIX_PUBLIC_PORTFOLIO_RLS.sql to add username');
            return;
        }
        
        console.log('✅ username column exists');
        console.log(`   Username: ${profile.username}`);
        console.log(`   Public: ${profile.is_portfolio_public}`);
        
        // Test each section
        await testSection('story_sections', 'My Story', profile.username);
        await testSection('skill_categories', 'Magic Toolbox', profile.username);
        await testSection('tools', 'Enhanced Tools', profile.username);
        await testSection('journey_timelines', 'My Journey', profile.username);
        await testSection('cv_sections', 'Download CV', profile.username);
        await testSection('contact_sections', 'Contact Me', profile.username);
        await testSection('carousels', 'Carousel', profile.username);
        await testSection('case_studies', 'Projects', profile.username);
        
    } catch (error) {
        console.log('❌ CRITICAL ERROR:', error.message);
    }
}

async function testSection(tableName, displayName, username) {
    console.log(`\n📊 Testing: ${displayName} (${tableName})`);
    
    try {
        // First get the org_id for this username
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('org_id')
            .eq('username', username)
            .eq('is_portfolio_public', true)
            .single();
        
        if (!profile) {
            console.log('   ❌ Profile not found or not public');
            return;
        }
        
        // Try to fetch data from this table
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('org_id', profile.org_id)
            .limit(1);
        
        if (error) {
            console.log(`   ❌ RLS BLOCKING: ${error.message}`);
            console.log(`   🔧 FIX: Run FIX_PUBLIC_PORTFOLIO_RLS.sql to add public read policy`);
            return;
        }
        
        if (!data || data.length === 0) {
            console.log('   ⚠️  No data found (table is empty)');
            console.log('   💡 Add content via admin panel');
            return;
        }
        
        console.log(`   ✅ PUBLIC ACCESS WORKS - Found ${data.length} record(s)`);
        
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
    }
}

console.log('\n' + '='.repeat(70));
console.log('🎯 DIAGNOSIS COMPLETE\n');
console.log('If you see RLS BLOCKING errors:');
console.log('  1. Open Supabase Dashboard → SQL Editor');
console.log('  2. Copy ALL content from FIX_PUBLIC_PORTFOLIO_RLS.sql');
console.log('  3. Paste and click "Run"');
console.log('  4. Run this script again to verify\n');
console.log('If you see "No data found":');
console.log('  1. Login to admin panel');
console.log('  2. Add content to those sections');
console.log('  3. Test again\n');
console.log('='.repeat(70));

diagnose().catch(console.error);
