// Check schema differences between profiles
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking Database Schema\n');
console.log('='.repeat(80));

async function checkSchema() {
    console.log('\n1️⃣  Checking table columns...\n');
    
    const tables = [
        'story_sections',
        'skill_categories', 
        'journey_milestones',
        'social_links',
        'cv_versions'
    ];
    
    for (const table of tables) {
        console.log(`📋 ${table}:`);
        
        // Try to get one record to see available columns
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
        
        if (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
        } else if (!data || data.length === 0) {
            console.log(`   ⚠️  No data to check columns`);
        } else {
            const columns = Object.keys(data[0]);
            console.log(`   ✅ Columns: ${columns.join(', ')}`);
            
            // Check for missing columns
            const expectedColumns = {
                'story_sections': ['asset_id'],
                'skill_categories': ['display_order'],
                'journey_milestones': ['display_order'],
                'social_links': ['display_order'],
                'cv_versions': ['display_order']
            };
            
            const expected = expectedColumns[table] || [];
            const missing = expected.filter(col => !columns.includes(col));
            
            if (missing.length > 0) {
                console.log(`   ❌ Missing: ${missing.join(', ')}`);
            } else {
                console.log(`   ✅ All expected columns present`);
            }
        }
        console.log('');
    }
    
    console.log('\n2️⃣  Checking migration status...\n');
    
    // Check if migrations table exists and what migrations have been run
    const { data: migrations, error: migError } = await supabase
        .from('supabase_migrations')
        .select('*')
        .order('version');
    
    if (migError) {
        console.log('❌ Cannot check migrations (table may not exist)');
        console.log(`   Error: ${migError.message}`);
    } else {
        console.log('✅ Applied migrations:');
        migrations?.forEach(mig => {
            console.log(`   - ${mig.version}: ${mig.name || 'unnamed'}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 DIAGNOSIS\n');
    
    console.log('The "youremailgf" profile is failing because:');
    console.log('1. Database schema is missing newer columns');
    console.log('2. Migrations may not have been fully applied');
    console.log('3. The public API methods expect these columns to exist');
    
    console.log('\n💡 SOLUTIONS:\n');
    console.log('Option 1: Run missing migrations');
    console.log('   - Check supabase/migrations/ folder');
    console.log('   - Run: supabase db push');
    
    console.log('\nOption 2: Update API methods to handle missing columns');
    console.log('   - Make columns optional in SELECT queries');
    console.log('   - Add fallback values');
    
    console.log('\nOption 3: Use the main profile instead');
    console.log('   - Use /u/admin instead of /u/youremailgf');
    console.log('   - The admin profile has the correct schema');
}

checkSchema().catch(console.error);