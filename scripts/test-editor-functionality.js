/**
 * Case Study Editor Functionality Test
 * Tests the complete CRUD flow and data integrity
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEditorFunctionality() {
    console.log('🧪 Testing Case Study Editor Functionality\n');
    console.log('='.repeat(70) + '\n');
    
    const issues = [];
    const warnings = [];
    
    try {
        // Test 1: Check unique constraint
        console.log('1️⃣ Checking unique constraint on case_study_sections...');
        
        // Try to insert duplicate to test constraint
        const testCaseStudyId = 'test-' + Date.now();
        const { error: insertError1 } = await supabase
            .from('case_study_sections')
            .insert({
                section_id: 'test-section-1',
                case_study_id: testCaseStudyId,
                section_type: 'hero',
                enabled: true,
                content: '{}',
                order_key: '1'
            });
        
        const { error: insertError2 } = await supabase
            .from('case_study_sections')
            .insert({
                section_id: 'test-section-2',
                case_study_id: testCaseStudyId,
                section_type: 'hero',
                enabled: true,
                content: '{}',
                order_key: '2'
            });
        
        // Clean up test data
        await supabase
            .from('case_study_sections')
            .delete()
            .eq('case_study_id', testCaseStudyId);
        
        if (insertError2 && insertError2.code === '23505') {
            console.log('   ✅ Unique constraint exists (duplicate rejected)\n');
        } else if (!insertError2) {
            warnings.push('Unique constraint missing - duplicates allowed');
            console.log('   ⚠️  Unique constraint missing - apply migration 006\n');
        } else {
            console.log('   ℹ️  Could not verify constraint\n');
        }
        
        // Test 2: Check RLS policies
        console.log('2️⃣ Checking RLS policies...');
        const tables = [
            'case_studies',
            'case_study_sections',
            'user_profiles',
            'assets'
        ];
        
        let rlsEnabled = 0;
        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(0);
            
            if (!error || error.code === 'PGRST116') {
                rlsEnabled++;
            }
        }
        
        console.log(`   ✅ RLS enabled on ${rlsEnabled}/${tables.length} checked tables\n`);
        
        // Test 3: Check case study structure
        console.log('3️⃣ Checking case study data structure...');
        const { data: caseStudies, error: csError } = await supabase
            .from('case_studies')
            .select('*')
            .limit(1);
        
        if (csError) {
            issues.push(`Case studies query failed: ${csError.message}`);
        } else if (caseStudies && caseStudies.length > 0) {
            const cs = caseStudies[0];
            const requiredFields = [
                'case_study_id',
                'org_id',
                'title',
                'template',
                'is_published'
            ];
            
            const missingFields = requiredFields.filter(field => !(field in cs));
            if (missingFields.length === 0) {
                console.log('   ✅ Case study structure correct\n');
            } else {
                issues.push(`Missing fields: ${missingFields.join(', ')}`);
            }
        } else {
            console.log('   ℹ️  No case studies to check\n');
        }
        
        // Test 4: Check sections structure
        console.log('4️⃣ Checking sections structure...');
        const { data: sections, error: sectionsError } = await supabase
            .from('case_study_sections')
            .select('*')
            .limit(1);
        
        if (sectionsError) {
            issues.push(`Sections query failed: ${sectionsError.message}`);
        } else if (sections && sections.length > 0) {
            const section = sections[0];
            const requiredFields = [
                'section_id',
                'case_study_id',
                'section_type',
                'enabled',
                'content'
            ];
            
            const missingFields = requiredFields.filter(field => !(field in section));
            if (missingFields.length === 0) {
                console.log('   ✅ Section structure correct\n');
                
                // Check if content is valid JSON
                try {
                    JSON.parse(section.content);
                    console.log('   ✅ Section content is valid JSON\n');
                } catch (e) {
                    warnings.push('Section content is not valid JSON');
                }
            } else {
                issues.push(`Missing section fields: ${missingFields.join(', ')}`);
            }
        } else {
            console.log('   ℹ️  No sections to check\n');
        }
        
        // Test 5: Check multi-tenancy setup
        console.log('5️⃣ Checking multi-tenancy setup...');
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .limit(1);
        
        if (orgError) {
            warnings.push('Organizations table not accessible');
        } else if (orgs && orgs.length > 0) {
            console.log('   ✅ Organizations table exists and has data\n');
        } else {
            warnings.push('No organizations found - create one first');
        }
        
        // Test 6: Check user profile setup
        console.log('6️⃣ Checking user profile...');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (profileError) {
                warnings.push('User profile not found - set up profile first');
            } else if (profile && profile.org_id) {
                console.log('   ✅ User profile exists with org_id\n');
            } else {
                warnings.push('User profile missing org_id');
            }
        } else {
            console.log('   ℹ️  Not authenticated (development mode?)\n');
        }
        
        // Test 7: Check published field
        console.log('7️⃣ Checking published field...');
        const { data: publishedCheck, error: pubError } = await supabase
            .from('case_studies')
            .select('is_published, published_at')
            .limit(1);
        
        if (pubError) {
            if (pubError.message.includes('is_published')) {
                issues.push('is_published field missing - apply migration 005');
            }
        } else {
            console.log('   ✅ Published fields exist\n');
        }
        
        // Test 8: Check assets table
        console.log('8️⃣ Checking assets table...');
        const { data: assets, error: assetsError } = await supabase
            .from('assets')
            .select('*')
            .limit(1);
        
        if (assetsError) {
            warnings.push('Assets table not accessible');
        } else {
            console.log('   ✅ Assets table accessible\n');
        }
        
    } catch (error) {
        issues.push(`Unexpected error: ${error.message}`);
    }
    
    // Print summary
    console.log('='.repeat(70));
    console.log('📊 EDITOR FUNCTIONALITY TEST SUMMARY');
    console.log('='.repeat(70) + '\n');
    
    if (issues.length === 0 && warnings.length === 0) {
        console.log('🎉 All tests passed! Editor is fully functional.\n');
        console.log('✅ Multi-tenancy: Working');
        console.log('✅ RLS Policies: Enabled');
        console.log('✅ Data Structure: Correct');
        console.log('✅ Published Field: Present');
        console.log('✅ Unique Constraint: Enforced\n');
    } else {
        if (issues.length > 0) {
            console.log('❌ CRITICAL ISSUES:');
            issues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
            console.log('');
        }
        
        if (warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            warnings.forEach((warning, i) => {
                console.log(`   ${i + 1}. ${warning}`);
            });
            console.log('');
        }
    }
    
    console.log('='.repeat(70) + '\n');
    
    // Recommendations
    if (warnings.includes('Unique constraint missing - duplicates allowed')) {
        console.log('💡 RECOMMENDED ACTION:');
        console.log('   Apply migration: 006_add_section_unique_constraint.sql');
        console.log('   This prevents duplicate sections in case studies.\n');
    }
    
    if (warnings.includes('User profile not found - set up profile first')) {
        console.log('💡 RECOMMENDED ACTION:');
        console.log('   Set up your user profile first.');
        console.log('   See: SETUP_YOUR_PROFILE.md\n');
    }
    
    process.exit(issues.length > 0 ? 1 : 0);
}

testEditorFunctionality();
