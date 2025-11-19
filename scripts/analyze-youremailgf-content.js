// Analyze what content exists for youremailgf profile
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('📊 Analyzing youremailgf Content\n');
console.log('='.repeat(60));

async function analyzeContent() {
    const username = 'youremailgf';
    
    // Get profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();
    
    if (!profile) {
        console.log('❌ Profile not found');
        return;
    }
    
    const orgId = profile.org_id;
    console.log(`\n👤 Profile: ${profile.username}`);
    console.log(`📧 Email: ${profile.email}`);
    console.log(`🏢 Org ID: ${orgId}`);
    console.log(`🌐 Public: ${profile.is_portfolio_public}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 CONTENT ANALYSIS\n');
    
    // 1. Story Section
    console.log('1️⃣  MY STORY SECTION:');
    const { data: story } = await supabase
        .from('story_sections')
        .select('*')
        .eq('org_id', orgId)
        .single();
    
    if (story) {
        console.log(`   ✅ Title: "${story.title}"`);
        console.log(`   ✅ Subtitle: "${story.subtitle}"`);
        console.log(`   📷 Image: ${story.image_asset_id ? 'Has image' : 'No image'}`);
        
        // Get paragraphs
        const { data: paragraphs } = await supabase
            .from('story_paragraphs')
            .select('content')
            .eq('story_id', story.story_id)
            .order('order_key');
        
        console.log(`   📝 Paragraphs: ${paragraphs?.length || 0}`);
        if (paragraphs && paragraphs.length > 0) {
            paragraphs.forEach((p, i) => {
                const preview = p.content.substring(0, 50) + '...';
                console.log(`      ${i + 1}. ${preview}`);
            });
        }
    } else {
        console.log('   ❌ No story section found');
    }
    
    // 2. Magic Toolbox
    console.log('\n2️⃣  MAGIC TOOLBOX:');
    const { data: categories } = await supabase
        .from('skill_categories')
        .select(`
            *,
            skills (*)
        `)
        .eq('org_id', orgId)
        .order('order_key');
    
    if (categories && categories.length > 0) {
        console.log(`   ✅ Categories: ${categories.length}`);
        categories.forEach(cat => {
            console.log(`      📂 ${cat.title}: ${cat.skills?.length || 0} skills`);
            if (cat.skills && cat.skills.length > 0) {
                cat.skills.forEach(skill => {
                    console.log(`         - ${skill.name} (${skill.level}%)`);
                });
            }
        });
    } else {
        console.log('   ❌ No skill categories found');
    }
    
    // 3. Tools
    console.log('\n3️⃣  TOOLS:');
    const { data: tools } = await supabase
        .from('tools')
        .select('*')
        .eq('org_id', orgId)
        .order('order_key');
    
    if (tools && tools.length > 0) {
        console.log(`   ✅ Tools: ${tools.length}`);
        tools.forEach(tool => {
            console.log(`      🔧 ${tool.name} (${tool.color})`);
        });
    } else {
        console.log('   ❌ No tools found');
    }
    
    // 4. Journey
    console.log('\n4️⃣  MY JOURNEY:');
    const { data: journey } = await supabase
        .from('journey_timelines')
        .select(`
            *,
            journey_milestones (*)
        `)
        .eq('org_id', orgId)
        .single();
    
    if (journey) {
        console.log(`   ✅ Timeline: "${journey.title}"`);
        console.log(`   📍 Milestones: ${journey.journey_milestones?.length || 0}`);
        if (journey.journey_milestones && journey.journey_milestones.length > 0) {
            journey.journey_milestones.forEach(milestone => {
                console.log(`      🏢 ${milestone.title} at ${milestone.company}`);
                console.log(`         📅 ${milestone.period}`);
                console.log(`         📝 ${milestone.description.substring(0, 50)}...`);
            });
        }
    } else {
        console.log('   ❌ No journey timeline found');
    }
    
    // 5. Contact
    console.log('\n5️⃣  CONTACT SECTION:');
    const { data: contact } = await supabase
        .from('contact_sections')
        .select(`
            *,
            social_links (*)
        `)
        .eq('org_id', orgId)
        .single();
    
    if (contact) {
        console.log(`   ✅ Title: "${contact.title}"`);
        console.log(`   📧 Email: ${contact.email || 'Not set'}`);
        console.log(`   📍 Location: ${contact.location || 'Not set'}`);
        console.log(`   🔗 Social Links: ${contact.social_links?.length || 0}`);
        if (contact.social_links && contact.social_links.length > 0) {
            contact.social_links.forEach(link => {
                console.log(`      ${link.name}: ${link.url}`);
            });
        }
    } else {
        console.log('   ❌ No contact section found');
    }
    
    // 6. CV Section
    console.log('\n6️⃣  CV SECTION:');
    const { data: cv } = await supabase
        .from('cv_sections')
        .select(`
            *,
            cv_versions (*)
        `)
        .eq('org_id', orgId)
        .single();
    
    if (cv) {
        console.log(`   ✅ Title: "${cv.title}"`);
        console.log(`   📄 Versions: ${cv.cv_versions?.length || 0}`);
        if (cv.cv_versions && cv.cv_versions.length > 0) {
            cv.cv_versions.forEach(version => {
                console.log(`      📋 ${version.name} (${version.type})`);
                console.log(`         🔗 ${version.google_drive_url ? 'Has URL' : 'No URL'}`);
                console.log(`         ✅ Active: ${version.is_active}`);
            });
        }
    } else {
        console.log('   ❌ No CV section found');
    }
    
    // 7. Carousel
    console.log('\n7️⃣  CAROUSEL:');
    const { data: carousel } = await supabase
        .from('carousels')
        .select(`
            *,
            carousel_slides (*)
        `)
        .eq('org_id', orgId)
        .single();
    
    if (carousel) {
        console.log(`   ✅ Carousel: "${carousel.name}"`);
        console.log(`   🖼️  Slides: ${carousel.carousel_slides?.length || 0}`);
        if (carousel.carousel_slides && carousel.carousel_slides.length > 0) {
            carousel.carousel_slides.forEach((slide, i) => {
                console.log(`      ${i + 1}. ${slide.title || 'Untitled'}`);
            });
        }
    } else {
        console.log('   ❌ No carousel found');
    }
    
    // 8. Case Studies
    console.log('\n8️⃣  CASE STUDIES:');
    const { data: caseStudies } = await supabase
        .from('case_studies')
        .select('*')
        .eq('org_id', orgId);
    
    if (caseStudies && caseStudies.length > 0) {
        console.log(`   ✅ Case Studies: ${caseStudies.length}`);
        caseStudies.forEach(cs => {
            console.log(`      📚 ${cs.title} (${cs.is_published ? 'Published' : 'Draft'})`);
        });
    } else {
        console.log('   ❌ No case studies found');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY\n');
    
    const sections = [
        { name: 'Story', exists: !!story },
        { name: 'Magic Toolbox', exists: categories && categories.length > 0 },
        { name: 'Tools', exists: tools && tools.length > 0 },
        { name: 'Journey', exists: !!journey },
        { name: 'Contact', exists: !!contact },
        { name: 'CV', exists: !!cv },
        { name: 'Carousel', exists: !!carousel },
        { name: 'Case Studies', exists: caseStudies && caseStudies.length > 0 }
    ];
    
    const workingSections = sections.filter(s => s.exists).length;
    const totalSections = sections.length;
    
    console.log(`📈 Content Coverage: ${workingSections}/${totalSections} sections`);
    console.log('\nSection Status:');
    sections.forEach(section => {
        console.log(`   ${section.exists ? '✅' : '❌'} ${section.name}`);
    });
    
    const missingSections = sections.filter(s => !s.exists);
    if (missingSections.length > 0) {
        console.log('\n💡 TO IMPROVE CONTENT:');
        console.log('   Missing sections can be added via admin panel:');
        missingSections.forEach(section => {
            console.log(`   - Add ${section.name} content`);
        });
    } else {
        console.log('\n🎉 ALL SECTIONS HAVE CONTENT!');
    }
}

analyzeContent().catch(console.error);