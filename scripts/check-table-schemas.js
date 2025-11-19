// Check actual table schemas to understand column names
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 CHECKING TABLE SCHEMAS');
console.log('='.repeat(50));

async function checkTableSchemas() {
    const tables = [
        'story_sections',
        'story_paragraphs', 
        'cv_sections',
        'contact_sections',
        'skill_categories',
        'skills',
        'tools',
        'case_studies',
        'journey_timelines',
        'journey_milestones'
    ];
    
    for (const table of tables) {
        console.log(`\n📋 ${table.toUpperCase()}:`);
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`❌ Error: ${error.message}`);
            } else if (data && data.length > 0) {
                const columns = Object.keys(data[0]);
                console.log(`✅ Columns: ${columns.join(', ')}`);
            } else {
                console.log('⚠️  No data, trying to get structure...');
                // Try to get structure by selecting with limit 0
                const { error: structError } = await supabase
                    .from(table)
                    .select('*')
                    .limit(0);
                
                if (structError) {
                    console.log(`❌ Structure error: ${structError.message}`);
                } else {
                    console.log('✅ Table exists but is empty');
                }
            }
        } catch (err) {
            console.log(`❌ Exception: ${err.message}`);
        }
    }
}

checkTableSchemas().catch(console.error);