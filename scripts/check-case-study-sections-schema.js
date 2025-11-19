// Check the actual schema of case_study_sections table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking case_study_sections Table Schema\n');
console.log('='.repeat(60));

async function checkSchema() {
    console.log('\n1️⃣  Getting sample record to see columns...\n');
    
    const { data, error } = await supabase
        .from('case_study_sections')
        .select('*')
        .limit(1);
    
    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }
    
    if (!data || data.length === 0) {
        console.log('⚠️  No data in case_study_sections table');
        console.log('   Cannot determine schema from empty table');
        return;
    }
    
    const sample = data[0];
    const columns = Object.keys(sample);
    
    console.log('📋 Current Columns:');
    columns.forEach(col => {
        console.log(`   - ${col}: ${typeof sample[col]} (${sample[col]})`);
    });
    
    console.log('\n📊 Schema Analysis:');
    
    const expectedColumns = [
        'section_id',
        'case_study_id', 
        'org_id',
        'section_type',
        'title',
        'enabled',
        'order_key',
        'content',
        'created_at',
        'updated_at'
    ];
    
    const missingColumns = expectedColumns.filter(col => !columns.includes(col));
    const extraColumns = columns.filter(col => !expectedColumns.includes(col));
    
    if (missingColumns.length > 0) {
        console.log('\n❌ Missing Columns:');
        missingColumns.forEach(col => {
            console.log(`   - ${col}`);
        });
    }
    
    if (extraColumns.length > 0) {
        console.log('\n➕ Extra Columns:');
        extraColumns.forEach(col => {
            console.log(`   - ${col}`);
        });
    }
    
    if (missingColumns.length === 0 && extraColumns.length === 0) {
        console.log('\n✅ Schema matches expected structure');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSIS\n');
    
    if (missingColumns.includes('org_id')) {
        console.log('❌ CRITICAL: org_id column is missing!');
        console.log('   This explains the RLS policy error');
        console.log('   Solution: Add org_id column to case_study_sections table');
    } else {
        console.log('✅ org_id column exists');
        console.log('   The RLS error has a different cause');
    }
}

checkSchema().catch(console.error);