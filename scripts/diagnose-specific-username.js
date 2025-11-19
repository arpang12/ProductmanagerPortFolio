// Diagnose specific username issue
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const username = 'youremailgf';

console.log(`🔍 Diagnosing Username: ${username}\n`);
console.log('='.repeat(80));

async function diagnose() {
    // Step 1: Check if profile exists
    console.log('\n1️⃣  Checking if profile exists...\n');
    
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username);
    
    if (profileError) {
        console.log('❌ ERROR:', profileError.message);
        return;
    }
    
    if (!profile || profile.length === 0) {
        console.log('❌ NO PROFILE FOUND');
        console.log(`   Username "${username}" does not exist in database`);
        console.log('\n📋 Available usernames:');
        
        const { data: allProfiles } = await supabase
            .from('user_profiles')
            .select('username, is_portfolio_public, email');
        
        allProfiles?.forEach(p => {
            console.log(`   - ${p.username} (${p.is_portfolio_public ? 'Public' : 'Private'}) - ${p.email}`);
        });
        
        console.log('\n💡 SOLUTION:');
        console.log('   1. Check your actual username in Profile Settings');
        console.log('   2. Or create a profile with username "youremailgf"');
        console.log('   3. Use the correct username in the URL');
        return;
    }
    
    console.log(`✅ Profile found: ${profile[0].username}`);
    console.log(`   Email: ${profile[0].email}`);
    console.log(`   Org ID: ${profile[0].org_id}`);
    console.log(`   Public: ${profile[0].is_portfolio_public}`);
    
    if (!profile[0].is_portfolio_public) {
        console.log('\n❌ PORTFOLIO IS PRIVATE');
        console.log('   This portfolio is not set to public');
        console.log('\n💡 SOLUTION:');
        console.log('   1. Login to admin panel');
        console.log('   2. Go to Profile Settings');
        console.log('   3. Toggle "Make Portfolio Public"');
        return;
    }
    
    // Step 2: Check data for this org_id
    console.log('\n2️⃣  Checking data for this profile...\n');
    
    const orgId = profile[0].org_id;
    
    const sections = [
        { name: 'Story', table: 'story_sections' },
        { name: 'Skill Categories', table: 'skill_categories' },
        { name: 'Tools', table: 'tools' },
        { name: 'Journey', table: 'journey_timelines' },
        { name: 'Contact', table: 'contact_sections' },
        { name: 'CV', table: 'cv_sections' },
        { name: 'Carousels', table: 'carousels' },
        { name: 'Case Studies', table: 'case_studies', extraFilter: { is_published: true } }
    ];
    
    for (const section of sections) {
        let query = supabase
            .from(section.table)
            .select('*', { count: 'exact' })
            .eq('org_id', orgId);
        
        if (section.extraFilter) {
            Object.entries(section.extraFilter).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { data, error, count } = await query;
        
        if (error) {
            console.log(`   ❌ ${section.name}: RLS BLOCKING - ${error.message}`);
        } else if (!data || data.length === 0) {
            console.log(`   ⚠️  ${section.name}: NO DATA (empty)`);
        } else {
            console.log(`   ✅ ${section.name}: ${count} record(s)`);
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 DIAGNOSIS COMPLETE\n');
}

diagnose().catch(console.error);
