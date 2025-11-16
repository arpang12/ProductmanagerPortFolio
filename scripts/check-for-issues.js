/**
 * Comprehensive System Health Check
 * Checks for common issues across the application
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

async function checkSystemHealth() {
    console.log('🔍 Running System Health Check...\n');
    
    const issues = [];
    const warnings = [];
    
    try {
        // 1. Check database connection
        console.log('1️⃣ Checking database connection...');
        const { data: connectionTest, error: connectionError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
        
        if (connectionError) {
            issues.push(`Database connection failed: ${connectionError.message}`);
        } else {
            console.log('   ✅ Database connection OK\n');
        }
        
        // 2. Check for published case studies
        console.log('2️⃣ Checking case studies...');
        const { data: caseStudies, error: csError } = await supabase
            .from('case_studies')
            .select('*')
            .eq('published', true);
        
        if (csError) {
            issues.push(`Case studies query failed: ${csError.message}`);
        } else {
            console.log(`   ✅ Found ${caseStudies.length} published case studies`);
            
            // Check for case studies without hero images
            const missingHeroImages = caseStudies.filter(cs => !cs.hero_image_url);
            if (missingHeroImages.length > 0) {
                warnings.push(`${missingHeroImages.length} case studies missing hero images`);
            }
            
            // Check for case studies with invalid templates
            const invalidTemplates = caseStudies.filter(cs => 
                !['default', 'ghibli', 'modern'].includes(cs.template)
            );
            if (invalidTemplates.length > 0) {
                issues.push(`${invalidTemplates.length} case studies have invalid templates`);
            }
            console.log('');
        }
        
        // 3. Check My Story section
        console.log('3️⃣ Checking My Story section...');
        const { data: myStory, error: storyError } = await supabase
            .from('my_story')
            .select('*')
            .single();
        
        if (storyError) {
            warnings.push(`My Story section not configured: ${storyError.message}`);
        } else if (!myStory.image_url) {
            warnings.push('My Story section missing image');
        } else {
            console.log('   ✅ My Story section configured\n');
        }
        
        // 4. Check Magic Toolbox
        console.log('4️⃣ Checking Magic Toolbox...');
        const { data: toolbox, error: toolboxError } = await supabase
            .from('magic_toolbox')
            .select('*, categories:magic_toolbox_categories(*), tools:magic_toolbox_tools(*)');
        
        if (toolboxError) {
            warnings.push(`Magic Toolbox not configured: ${toolboxError.message}`);
        } else {
            const categories = toolbox[0]?.categories || [];
            const tools = toolbox[0]?.tools || [];
            console.log(`   ✅ ${categories.length} skill categories, ${tools.length} tools\n`);
        }
        
        // 5. Check Journey section
        console.log('5️⃣ Checking Journey section...');
        const { data: journey, error: journeyError } = await supabase
            .from('my_journey')
            .select('*, items:my_journey_items(*)');
        
        if (journeyError) {
            warnings.push(`Journey section not configured: ${journeyError.message}`);
        } else {
            const items = journey[0]?.items || [];
            console.log(`   ✅ ${items.length} journey items\n`);
        }
        
        // 6. Check CV section
        console.log('6️⃣ Checking CV section...');
        const { data: cv, error: cvError } = await supabase
            .from('cv_section')
            .select('*, versions:cv_versions(*)');
        
        if (cvError) {
            warnings.push(`CV section not configured: ${cvError.message}`);
        } else {
            const versions = cv[0]?.versions || [];
            const activeVersions = versions.filter(v => v.is_active);
            console.log(`   ✅ ${activeVersions.length} active CV versions\n`);
            
            // Check for CV versions without download URLs
            const missingUrls = activeVersions.filter(v => !v.file_url && !v.google_drive_url);
            if (missingUrls.length > 0) {
                warnings.push(`${missingUrls.length} active CV versions missing download URLs`);
            }
        }
        
        // 7. Check Contact section
        console.log('7️⃣ Checking Contact section...');
        const { data: contact, error: contactError } = await supabase
            .from('contact_section')
            .select('*, social_links:contact_social_links(*)');
        
        if (contactError) {
            warnings.push(`Contact section not configured: ${contactError.message}`);
        } else {
            const links = contact[0]?.social_links || [];
            console.log(`   ✅ ${links.length} social links configured\n`);
            
            if (!contact[0]?.resume_url) {
                warnings.push('Contact section missing resume URL');
            }
        }
        
        // 8. Check Carousel
        console.log('8️⃣ Checking Carousel...');
        const { data: carousel, error: carouselError } = await supabase
            .from('carousel_images')
            .select('*')
            .eq('is_active', true);
        
        if (carouselError) {
            warnings.push(`Carousel not configured: ${carouselError.message}`);
        } else {
            console.log(`   ✅ ${carousel.length} active carousel images\n`);
        }
        
        // 9. Check AI Settings
        console.log('9️⃣ Checking AI Settings...');
        const { data: aiSettings, error: aiError } = await supabase
            .from('ai_settings')
            .select('*')
            .single();
        
        if (aiError) {
            warnings.push('AI settings not configured');
        } else if (!aiSettings.gemini_api_key) {
            warnings.push('Gemini API key not set');
        } else {
            console.log('   ✅ AI settings configured\n');
        }
        
    } catch (error) {
        issues.push(`Unexpected error: ${error.message}`);
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 HEALTH CHECK SUMMARY');
    console.log('='.repeat(60) + '\n');
    
    if (issues.length === 0 && warnings.length === 0) {
        console.log('🎉 All systems operational! No issues found.\n');
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
    
    console.log('='.repeat(60) + '\n');
    
    // Exit with appropriate code
    process.exit(issues.length > 0 ? 1 : 0);
}

checkSystemHealth();
