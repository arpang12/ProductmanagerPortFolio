/**
 * Create a Test Case Study with ALL Sections Filled
 * 
 * This script creates a complete case study with Gallery, Document, Video,
 * Figma, Miro, and Links sections all enabled and filled with sample data.
 */

import { createClient } from '@supabase/supabase-js';
import { ulid } from 'ulid';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🚀 Creating Test Case Study with All Sections\n');
console.log('='.repeat(80));

async function createTestCaseStudy() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Not authenticated. Please log in first.');
      return;
    }
    
    console.log(`✅ Authenticated as: ${user.email}`);
    
    // Get user's org
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single();
    
    if (!profile?.org_id) {
      console.error('❌ No organization found for user.');
      return;
    }
    
    console.log(`✅ Organization ID: ${profile.org_id}`);
    
    // Create case study
    const caseStudyId = ulid();
    const now = new Date().toISOString();
    
    console.log('\n📝 Creating case study...');
    
    const { error: csError } = await supabase
      .from('case_studies')
      .insert({
        case_study_id: caseStudyId,
        org_id: profile.org_id,
        title: 'Complete Test Project - All Sections',
        template: 'default',
        is_published: true,
        published_at: now,
        created_at: now,
        updated_at: now
      });
    
    if (csError) {
      console.error('❌ Error creating case study:', csError);
      return;
    }
    
    console.log(`✅ Case study created: ${caseStudyId}`);
    
    // Define all sections with sample data
    const sections = [
      {
        section_type: 'hero',
        enabled: true,
        content: {
          enabled: true,
          headline: 'Revolutionary Product Design',
          subheading: 'Transforming user experiences through innovative design',
          text: 'A comprehensive case study showcasing modern design principles and user-centered approach.',
          imageUrl: 'https://picsum.photos/seed/hero-test/1200/800'
        }
      },
      {
        section_type: 'overview',
        enabled: true,
        content: {
          enabled: true,
          title: 'Project Overview',
          summary: 'This project demonstrates a complete product design process from research to implementation, focusing on user needs and business goals.',
          metrics: 'Users: 10,000+\nSatisfaction: 95%\nConversion: +45%\nTime Saved: 60%'
        }
      },
      {
        section_type: 'problem',
        enabled: true,
        content: {
          enabled: true,
          title: 'The Challenge',
          description: 'Users were struggling with complex workflows and outdated interfaces, leading to frustration and decreased productivity.'
        }
      },
      {
        section_type: 'process',
        enabled: true,
        content: {
          enabled: true,
          title: 'Design Process',
          description: 'Our systematic approach to solving the problem',
          steps: 'User Research & Interviews\nCompetitive Analysis\nWireframing & Prototyping\nUsability Testing\nIterative Design\nFinal Implementation'
        }
      },
      {
        section_type: 'showcase',
        enabled: true,
        content: {
          enabled: true,
          title: 'Key Features',
          description: 'Innovative solutions that made a difference',
          features: 'Intuitive Dashboard\nReal-time Collaboration\nAdvanced Analytics\nMobile-First Design\nAccessibility Compliant\nDark Mode Support'
        }
      },
      {
        section_type: 'gallery',
        enabled: true,
        content: {
          enabled: true,
          images: [
            'https://picsum.photos/seed/gallery1/800/600',
            'https://picsum.photos/seed/gallery2/800/600',
            'https://picsum.photos/seed/gallery3/800/600',
            'https://picsum.photos/seed/gallery4/800/600',
            'https://picsum.photos/seed/gallery5/800/600',
            'https://picsum.photos/seed/gallery6/800/600'
          ]
        }
      },
      {
        section_type: 'video',
        enabled: true,
        content: {
          enabled: true,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          caption: 'Product demo walkthrough showing key features and user interactions'
        }
      },
      {
        section_type: 'figma',
        enabled: true,
        content: {
          enabled: true,
          url: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/example',
          caption: 'Interactive Figma prototype - explore the design system and user flows'
        }
      },
      {
        section_type: 'miro',
        enabled: true,
        content: {
          enabled: true,
          url: 'https://miro.com/app/live-embed/example-board-id',
          caption: 'Brainstorming and ideation board showing our design thinking process'
        }
      },
      {
        section_type: 'document',
        enabled: true,
        content: {
          enabled: true,
          url: 'https://docs.google.com/document/d/example/edit'
        }
      },
      {
        section_type: 'links',
        enabled: true,
        content: {
          enabled: true,
          title: 'Related Resources',
          items: 'GitHub Repository|https://github.com/example/project\nLive Demo|https://demo.example.com\nDesign System|https://design.example.com\nAPI Documentation|https://api.example.com/docs\nUser Guide|https://help.example.com\nBlog Post|https://blog.example.com/case-study'
        }
      },
      {
        section_type: 'reflection',
        enabled: true,
        content: {
          enabled: true,
          title: 'Reflections & Learnings',
          content: 'This project taught us the importance of continuous user feedback and iterative design. By staying close to our users throughout the process, we were able to create a solution that truly meets their needs.',
          learnings: 'User research is invaluable - never skip it\nPrototype early and often\nAccessibility should be built in, not bolted on\nData-driven decisions lead to better outcomes\nCollaboration across teams is essential\nIteration is key to refinement'
        }
      }
    ];
    
    console.log('\n📋 Creating sections...');
    
    for (const section of sections) {
      const { error: sectionError } = await supabase
        .from('case_study_sections')
        .insert({
          section_id: ulid(),
          case_study_id: caseStudyId,
          section_type: section.section_type,
          enabled: section.enabled,
          content: section.content,
          order_key: sections.indexOf(section),
          created_at: now,
          updated_at: now
        });
      
      if (sectionError) {
        console.error(`❌ Error creating ${section.section_type} section:`, sectionError);
      } else {
        console.log(`✅ Created ${section.section_type} section`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 SUCCESS! Test case study created with all sections!');
    console.log('='.repeat(80));
    
    console.log('\n📊 Summary:');
    console.log(`   Case Study ID: ${caseStudyId}`);
    console.log(`   Title: Complete Test Project - All Sections`);
    console.log(`   Template: default`);
    console.log(`   Published: ✅ YES`);
    console.log(`   Sections: ${sections.length}`);
    
    console.log('\n🎯 Target Sections Included:');
    console.log('   ✅ Gallery (6 images)');
    console.log('   ✅ Video (YouTube embed)');
    console.log('   ✅ Figma (prototype embed)');
    console.log('   ✅ Miro (board embed)');
    console.log('   ✅ Document (Google Doc link)');
    console.log('   ✅ Links (6 related links)');
    
    console.log('\n🔍 Next Steps:');
    console.log('1. Run: node scripts/check-all-case-studies.js');
    console.log('2. Go to your homepage and verify the project card appears');
    console.log('3. Click on the project card to view the full case study');
    console.log('4. Verify all sections render correctly');
    
    console.log('\n💡 Note:');
    console.log('- The homepage shows PROJECT CARDS (title, description, image)');
    console.log('- Full case study with ALL sections shows when you CLICK the card');
    console.log('- This is the expected behavior!');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  }
}

createTestCaseStudy();
