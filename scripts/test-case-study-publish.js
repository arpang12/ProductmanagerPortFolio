/**
 * Test Case Study Publish Flow
 * Verifies that case studies can be published and appear on homepage
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

async function testCaseStudyPublish() {
    console.log('🧪 Testing Case Study Publish Flow\n');
    console.log('='.repeat(60) + '\n');
    
    try {
        // Step 1: Check all case studies
        console.log('1️⃣ Fetching all case studies...');
        const { data: allCaseStudies, error: allError } = await supabase
            .from('case_studies')
            .select('case_study_id, title, is_published, published_at, created_at')
            .order('created_at', { ascending: false });
        
        if (allError) {
            console.error('❌ Error fetching case studies:', allError.message);
            return;
        }
        
        console.log(`   Found ${allCaseStudies.length} total case studies:\n`);
        allCaseStudies.forEach((cs, i) => {
            const status = cs.is_published ? '✅ PUBLISHED' : '📝 DRAFT';
            console.log(`   ${i + 1}. ${cs.title}`);
            console.log(`      ID: ${cs.case_study_id}`);
            console.log(`      Status: ${status}`);
            if (cs.published_at) {
                console.log(`      Published: ${new Date(cs.published_at).toLocaleString()}`);
            }
            console.log('');
        });
        
        // Step 2: Check published case studies (what homepage sees)
        console.log('2️⃣ Fetching published case studies (homepage view)...');
        const { data: publishedCaseStudies, error: pubError } = await supabase
            .from('case_studies')
            .select(`
                case_study_id,
                title,
                is_published,
                hero_image_asset_id,
                assets!case_studies_hero_image_asset_id_fkey (cloudinary_url),
                case_study_sections!inner (content, section_type)
            `)
            .eq('is_published', true)
            .eq('case_study_sections.section_type', 'hero');
        
        if (pubError) {
            console.error('❌ Error fetching published case studies:', pubError.message);
            return;
        }
        
        console.log(`   Found ${publishedCaseStudies.length} published case studies:\n`);
        if (publishedCaseStudies.length === 0) {
            console.log('   ⚠️  No published case studies found!');
            console.log('   💡 To publish a case study:');
            console.log('      1. Go to Admin page');
            console.log('      2. Edit a case study');
            console.log('      3. Click the "🚀 Publish" button');
            console.log('      4. Save changes\n');
        } else {
            publishedCaseStudies.forEach((cs, i) => {
                console.log(`   ${i + 1}. ${cs.title}`);
                console.log(`      ID: ${cs.case_study_id}`);
                console.log(`      Hero Image: ${cs.assets?.cloudinary_url || 'None'}`);
                console.log('');
            });
        }
        
        // Step 3: Check for case studies that should be published
        const unpublishedCount = allCaseStudies.filter(cs => !cs.is_published).length;
        if (unpublishedCount > 0) {
            console.log(`3️⃣ Found ${unpublishedCount} unpublished case studies\n`);
            console.log('   To make them visible on homepage:');
            console.log('   1. Open Admin page');
            console.log('   2. Click "Edit" on a case study');
            console.log('   3. Click "🚀 Publish" button');
            console.log('   4. Click "💾 Save Changes"\n');
        }
        
        // Step 4: Verify the publish flow
        console.log('4️⃣ Verifying publish flow...\n');
        
        // Check if is_published column exists
        const { data: columnCheck, error: columnError } = await supabase
            .from('case_studies')
            .select('is_published')
            .limit(1);
        
        if (columnError) {
            console.error('   ❌ is_published column missing!');
            console.error('   💡 Run migration: 005_add_published_field.sql\n');
        } else {
            console.log('   ✅ is_published column exists');
        }
        
        // Check if there's at least one case study
        if (allCaseStudies.length === 0) {
            console.log('   ⚠️  No case studies found');
            console.log('   💡 Create a case study in the Admin page\n');
        } else {
            console.log('   ✅ Case studies exist');
        }
        
        // Check if any are published
        if (publishedCaseStudies.length === 0 && allCaseStudies.length > 0) {
            console.log('   ⚠️  No case studies are published');
            console.log('   💡 Publish at least one case study to see it on homepage\n');
        } else if (publishedCaseStudies.length > 0) {
            console.log('   ✅ Published case studies will appear on homepage\n');
        }
        
        console.log('='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60) + '\n');
        console.log(`Total Case Studies: ${allCaseStudies.length}`);
        console.log(`Published: ${publishedCaseStudies.length}`);
        console.log(`Drafts: ${unpublishedCount}`);
        console.log('');
        
        if (publishedCaseStudies.length > 0) {
            console.log('✅ Case studies are ready to display on homepage!');
        } else if (allCaseStudies.length > 0) {
            console.log('⚠️  You have case studies but none are published.');
            console.log('   Click "🚀 Publish" in the editor to make them visible.');
        } else {
            console.log('ℹ️  No case studies yet. Create one in the Admin page!');
        }
        console.log('');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

testCaseStudyPublish();
