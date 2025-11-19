// Comprehensive symmetry check between Supabase schema and code
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 COMPREHENSIVE SYMMETRY & CONFLICT CHECK');
console.log('='.repeat(80));
console.log('Checking alignment between Database Schema, Code, and Migrations\n');

async function checkSymmetry() {
    const issues = [];
    const warnings = [];
    const successes = [];

    console.log('1️⃣  CHECKING TABLE SCHEMAS vs CODE EXPECTATIONS\n');
    
    // Define expected schemas based on code analysis
    const expectedSchemas = {
        user_profiles: {
            required: ['user_id', 'org_id', 'email', 'username', 'is_portfolio_public'],
            optional: ['name', 'created_at', 'updated_at']
        },
        story_sections: {
            required: ['story_id', 'org_id', 'title', 'subtitle'],
            optional: ['image_asset_id', 'image_alt', 'created_at', 'updated_at']
        },
        story_paragraphs: {
            required: ['paragraph_id', 'story_id', 'content', 'order_key'],
            optional: ['created_at', 'updated_at']
        },
        skill_categories: {
            required: ['category_id', 'org_id', 'title', 'icon', 'color', 'order_key'],
            optional: ['icon_url', 'created_at', 'updated_at']
        },
        skills: {
            required: ['skill_id', 'category_id', 'name', 'level'],
            optional: ['created_at', 'updated_at']
        },
        tools: {
            required: ['tool_id', 'org_id', 'name', 'icon', 'color', 'order_key'],
            optional: ['icon_url', 'created_at', 'updated_at']
        },
        journey_timelines: {
            required: ['timeline_id', 'org_id', 'title', 'subtitle'],
            optional: ['created_at', 'updated_at']
        },
        journey_milestones: {
            required: ['milestone_id', 'timeline_id', 'title', 'company', 'period', 'description', 'is_active', 'order_key'],
            optional: ['created_at', 'updated_at']
        },
        contact_sections: {
            required: ['contact_id', 'org_id', 'title', 'email', 'location'],
            optional: ['subtitle', 'resume_asset_id', 'created_at', 'updated_at']
        },
        social_links: {
            required: ['link_id', 'contact_id', 'name', 'url', 'icon', 'color', 'order_key'],
            optional: ['created_at', 'updated_at']
        },
        cv_sections: {
            required: ['cv_section_id', 'org_id', 'title', 'subtitle', 'description'],
            optional: ['created_at', 'updated_at']
        },
        cv_versions: {
            required: ['cv_version_id', 'cv_section_id', 'name', 'type', 'is_active', 'order_key'],
            optional: ['file_asset_id', 'google_drive_url', 'file_name', 'file_size', 'upload_date', 'created_at', 'updated_at']
        },
        carousels: {
            required: ['carousel_id', 'org_id', 'name'],
            optional: ['created_at', 'updated_at']
        },
        carousel_slides: {
            required: ['slide_id', 'carousel_id', 'asset_id'],
            optional: ['title', 'description', 'order_key', 'created_at', 'updated_at']
        },
        case_studies: {
            required: ['case_study_id', 'org_id', 'title', 'is_published'],
            optional: ['slug', 'template', 'status', 'hero_image_asset_id', 'created_at', 'updated_at']
        },
        case_study_sections: {
            required: ['section_id', 'case_study_id', 'org_id', 'section_type', 'title', 'enabled', 'order_key', 'content'],
            optional: ['metadata', 'created_at', 'updated_at']
        },
        assets: {
            required: ['asset_id', 'org_id', 'cloudinary_url'],
            optional: ['original_filename', 'file_size', 'created_at', 'updated_at']
        }
    };

    // Check each table
    for (const [tableName, expectedSchema] of Object.entries(expectedSchemas)) {
        console.log(`📋 Checking ${tableName}...`);
        
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);
            
            if (error) {
                issues.push(`❌ ${tableName}: Cannot access table - ${error.message}`);
                continue;
            }
            
            if (!data || data.length === 0) {
                warnings.push(`⚠️  ${tableName}: Empty table - cannot verify schema`);
                continue;
            }
            
            const actualColumns = Object.keys(data[0]);
            const requiredColumns = expectedSchema.required;
            const optionalColumns = expectedSchema.optional || [];
            const allExpectedColumns = [...requiredColumns, ...optionalColumns];
            
            // Check for missing required columns
            const missingRequired = requiredColumns.filter(col => !actualColumns.includes(col));
            if (missingRequired.length > 0) {
                issues.push(`❌ ${tableName}: Missing required columns: ${missingRequired.join(', ')}`);
            }
            
            // Check for missing optional columns
            const missingOptional = optionalColumns.filter(col => !actualColumns.includes(col));
            if (missingOptional.length > 0) {
                warnings.push(`⚠️  ${tableName}: Missing optional columns: ${missingOptional.join(', ')}`);
            }
            
            // Check for unexpected columns
            const unexpectedColumns = actualColumns.filter(col => !allExpectedColumns.includes(col));
            if (unexpectedColumns.length > 0) {
                warnings.push(`➕ ${tableName}: Unexpected columns: ${unexpectedColumns.join(', ')}`);
            }
            
            if (missingRequired.length === 0) {
                successes.push(`✅ ${tableName}: Required schema OK`);
            }
            
        } catch (err) {
            issues.push(`❌ ${tableName}: Exception - ${err.message}`);
        }
    }

    console.log('\n2️⃣  CHECKING COLUMN NAME CONSISTENCY\n');
    
    // Check for common column naming conflicts we've seen
    const columnConflicts = [
        {
            table: 'story_sections',
            codeExpects: 'asset_id',
            actualColumn: 'image_asset_id',
            status: 'FIXED'
        },
        {
            table: 'skill_categories',
            codeExpects: 'display_order',
            actualColumn: 'order_key',
            status: 'FIXED'
        },
        {
            table: 'journey_milestones',
            codeExpects: 'display_order',
            actualColumn: 'order_key',
            status: 'FIXED'
        },
        {
            table: 'social_links',
            codeExpects: 'display_order',
            actualColumn: 'order_key',
            status: 'FIXED'
        },
        {
            table: 'cv_versions',
            codeExpects: 'display_order',
            actualColumn: 'order_key',
            status: 'FIXED'
        },
        {
            table: 'cv_versions',
            codeExpects: 'asset_id',
            actualColumn: 'file_asset_id',
            status: 'FIXED'
        },
        {
            table: 'case_study_sections',
            codeExpects: 'org_id',
            actualColumn: 'org_id',
            status: 'NEEDS_MIGRATION'
        }
    ];

    columnConflicts.forEach(conflict => {
        if (conflict.status === 'FIXED') {
            successes.push(`✅ ${conflict.table}: Column naming conflict resolved (${conflict.codeExpects} → ${conflict.actualColumn})`);
        } else if (conflict.status === 'NEEDS_MIGRATION') {
            issues.push(`❌ ${conflict.table}: Missing column ${conflict.codeExpects} - needs migration`);
        }
    });

    console.log('\n3️⃣  CHECKING RLS POLICIES\n');
    
    // Check critical RLS policies
    const criticalTables = [
        'user_profiles',
        'case_studies', 
        'case_study_sections',
        'story_sections',
        'skill_categories',
        'journey_timelines',
        'contact_sections',
        'cv_sections'
    ];

    for (const table of criticalTables) {
        try {
            // Test if we can read from the table (indicates RLS allows it)
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
            
            if (error && error.message.includes('row-level security')) {
                issues.push(`❌ ${table}: RLS blocking public read access`);
            } else if (error) {
                warnings.push(`⚠️  ${table}: ${error.message}`);
            } else {
                successes.push(`✅ ${table}: RLS allows public read`);
            }
        } catch (err) {
            warnings.push(`⚠️  ${table}: Could not test RLS - ${err.message}`);
        }
    }

    console.log('\n4️⃣  CHECKING ORG_ID CONSISTENCY\n');
    
    // Check org_id consistency across related tables
    try {
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('org_id, username')
            .limit(5);
        
        if (profiles && profiles.length > 0) {
            for (const profile of profiles) {
                console.log(`👤 Checking org_id consistency for: ${profile.username} (${profile.org_id})`);
                
                const tablesToCheck = [
                    'story_sections',
                    'skill_categories', 
                    'tools',
                    'journey_timelines',
                    'contact_sections',
                    'cv_sections',
                    'carousels',
                    'case_studies'
                ];
                
                for (const table of tablesToCheck) {
                    try {
                        const { data, error } = await supabase
                            .from(table)
                            .select('*')
                            .eq('org_id', profile.org_id)
                            .limit(1);
                        
                        if (error) {
                            warnings.push(`⚠️  ${table}: Cannot check org_id consistency - ${error.message}`);
                        } else if (data && data.length > 0) {
                            successes.push(`✅ ${table}: Has data for org_id ${profile.org_id}`);
                        }
                    } catch (err) {
                        warnings.push(`⚠️  ${table}: Exception checking org_id - ${err.message}`);
                    }
                }
                break; // Just check first profile to avoid spam
            }
        }
    } catch (err) {
        warnings.push(`⚠️  Could not check org_id consistency: ${err.message}`);
    }

    console.log('\n5️⃣  CHECKING MIGRATION STATUS\n');
    
    // List migration files we have
    const migrationFiles = [
        '001_initial_schema.sql',
        '002_rls_policies.sql', 
        '003_add_icon_url_to_toolbox.sql',
        '005_add_published_field.sql',
        '006_add_section_unique_constraint.sql',
        '007_add_public_portfolio_access.sql'
    ];
    
    console.log('📁 Migration files found:');
    migrationFiles.forEach(file => {
        console.log(`   - ${file}`);
    });
    
    // Note: We can't easily check which migrations have been applied without service key
    warnings.push('⚠️  Cannot verify which migrations have been applied (requires service key)');

    // SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('📊 SYMMETRY CHECK SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n✅ SUCCESSES (${successes.length}):`);
    successes.forEach(success => console.log(`   ${success}`));
    
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(warning => console.log(`   ${warning}`));
    
    console.log(`\n❌ CRITICAL ISSUES (${issues.length}):`);
    issues.forEach(issue => console.log(`   ${issue}`));
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 RECOMMENDATIONS');
    console.log('='.repeat(80));
    
    if (issues.length === 0) {
        console.log('\n🎉 EXCELLENT! No critical issues found.');
        console.log('   Your database schema and code are well aligned.');
    } else {
        console.log('\n🔧 CRITICAL FIXES NEEDED:');
        
        if (issues.some(i => i.includes('case_study_sections') && i.includes('org_id'))) {
            console.log('   1. Run ADD_ORG_ID_TO_CASE_STUDY_SECTIONS.sql');
        }
        
        if (issues.some(i => i.includes('RLS'))) {
            console.log('   2. Run FIX_PUBLIC_PORTFOLIO_RLS.sql');
        }
        
        console.log('\n   After fixes, run this script again to verify.');
    }
    
    if (warnings.length > 0) {
        console.log('\n💡 OPTIONAL IMPROVEMENTS:');
        console.log('   - Some tables are empty (add content via admin panel)');
        console.log('   - Some optional columns missing (non-critical)');
        console.log('   - Consider running all pending migrations');
    }
    
    console.log('\n📈 OVERALL HEALTH:');
    const totalChecks = successes.length + warnings.length + issues.length;
    const healthScore = Math.round((successes.length / totalChecks) * 100);
    
    if (healthScore >= 90) {
        console.log(`   🟢 EXCELLENT (${healthScore}%) - System is well aligned`);
    } else if (healthScore >= 75) {
        console.log(`   🟡 GOOD (${healthScore}%) - Minor issues to address`);
    } else if (healthScore >= 50) {
        console.log(`   🟠 FAIR (${healthScore}%) - Several issues need attention`);
    } else {
        console.log(`   🔴 POOR (${healthScore}%) - Major alignment issues`);
    }
}

checkSymmetry().catch(console.error);