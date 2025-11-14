import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple ULID generator
function ulid() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return (timestamp + randomPart).toUpperCase();
}

async function setupDefaultData() {
  console.log('🔧 Setting up default data for all sections\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@arpanportfolio.com',
      password: 'ArpanAdmin2024!'
    });
    
    if (authError) {
      console.log('❌ Login failed:', authError.message);
      return;
    }
    console.log('✅ Login successful');
    
    const orgId = 'arpan-portfolio';
    
    // Step 2: Setup Journey Timeline
    console.log('\n2️⃣ Setting up Journey Timeline...');
    
    // Check if journey timeline exists
    const { data: existingTimeline } = await supabase
      .from('journey_timelines')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    let timelineId;
    if (!existingTimeline) {
      timelineId = ulid();
      const { error: timelineError } = await supabase
        .from('journey_timelines')
        .insert({
          timeline_id: timelineId,
          org_id: orgId,
          title: 'My Journey',
          subtitle: 'A timeline of my professional growth'
        });
      
      if (timelineError) {
        console.log('❌ Timeline creation failed:', timelineError.message);
      } else {
        console.log('✅ Journey timeline created');
        
        // Add sample milestones
        const milestones = [
          {
            milestone_id: ulid(),
            timeline_id: timelineId,
            title: 'Senior Developer',
            company: 'Tech Company',
            period: '2023 - Present',
            description: 'Leading development of innovative web applications and mentoring junior developers.',
            is_active: true,
            order_key: '000001'
          },
          {
            milestone_id: ulid(),
            timeline_id: timelineId,
            title: 'Full Stack Developer',
            company: 'Startup Inc',
            period: '2021 - 2023',
            description: 'Built scalable applications from ground up using modern technologies.',
            is_active: false,
            order_key: '000002'
          },
          {
            milestone_id: ulid(),
            timeline_id: timelineId,
            title: 'Junior Developer',
            company: 'First Company',
            period: '2020 - 2021',
            description: 'Started my career learning best practices and contributing to team projects.',
            is_active: false,
            order_key: '000003'
          }
        ];
        
        const { error: milestonesError } = await supabase
          .from('journey_milestones')
          .insert(milestones);
        
        if (milestonesError) {
          console.log('❌ Milestones creation failed:', milestonesError.message);
        } else {
          console.log('✅ Journey milestones created');
        }
      }
    } else {
      console.log('✅ Journey timeline already exists');
    }
    
    // Step 3: Setup Contact Section
    console.log('\n3️⃣ Setting up Contact Section...');
    
    const { data: existingContact } = await supabase
      .from('contact_sections')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    let contactId;
    if (!existingContact) {
      contactId = ulid();
      const { error: contactError } = await supabase
        .from('contact_sections')
        .insert({
          contact_id: contactId,
          org_id: orgId,
          title: 'Contact Me',
          subtitle: 'Let\'s connect and create something amazing together',
          description: 'Ready to bring your ideas to life? Let\'s chat about your next project!',
          email: 'arpanguria68@gmail.com',
          location: 'Remote',
          resume_button_text: 'Download Resume'
        });
      
      if (contactError) {
        console.log('❌ Contact section creation failed:', contactError.message);
      } else {
        console.log('✅ Contact section created');
        
        // Add sample social links
        const socialLinks = [
          {
            link_id: ulid(),
            contact_id: contactId,
            name: 'LinkedIn',
            url: 'https://linkedin.com/in/arpanguria',
            icon: '💼',
            color: 'blue',
            order_key: '000001'
          },
          {
            link_id: ulid(),
            contact_id: contactId,
            name: 'GitHub',
            url: 'https://github.com/arpanguria',
            icon: '🐙',
            color: 'gray',
            order_key: '000002'
          },
          {
            link_id: ulid(),
            contact_id: contactId,
            name: 'Twitter',
            url: 'https://twitter.com/arpanguria',
            icon: '🐦',
            color: 'blue',
            order_key: '000003'
          }
        ];
        
        const { error: linksError } = await supabase
          .from('social_links')
          .insert(socialLinks);
        
        if (linksError) {
          console.log('❌ Social links creation failed:', linksError.message);
        } else {
          console.log('✅ Social links created');
        }
      }
    } else {
      console.log('✅ Contact section already exists');
    }
    
    // Step 4: Setup CV Section
    console.log('\n4️⃣ Setting up CV Section...');
    
    const { data: existingCV } = await supabase
      .from('cv_sections')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    let cvSectionId;
    if (!existingCV) {
      cvSectionId = ulid();
      const { error: cvError } = await supabase
        .from('cv_sections')
        .insert({
          cv_section_id: cvSectionId,
          org_id: orgId,
          title: 'Download CV',
          subtitle: 'Choose your preferred format',
          description: 'Available in multiple formats tailored for different regions and opportunities.'
        });
      
      if (cvError) {
        console.log('❌ CV section creation failed:', cvError.message);
      } else {
        console.log('✅ CV section created');
        
        // Add sample CV versions
        const cvVersions = [
          {
            cv_version_id: ulid(),
            cv_section_id: cvSectionId,
            name: 'Indian CV',
            type: 'indian',
            is_active: true,
            order_key: '000001'
          },
          {
            cv_version_id: ulid(),
            cv_section_id: cvSectionId,
            name: 'Europass CV',
            type: 'europass',
            is_active: true,
            order_key: '000002'
          },
          {
            cv_version_id: ulid(),
            cv_section_id: cvSectionId,
            name: 'Global CV',
            type: 'global',
            is_active: true,
            order_key: '000003'
          }
        ];
        
        const { error: versionsError } = await supabase
          .from('cv_versions')
          .insert(cvVersions);
        
        if (versionsError) {
          console.log('❌ CV versions creation failed:', versionsError.message);
        } else {
          console.log('✅ CV versions created');
        }
      }
    } else {
      console.log('✅ CV section already exists');
    }
    
    // Step 5: Setup AI Configuration
    console.log('\n5️⃣ Setting up AI Configuration...');
    
    const { data: existingAI } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    if (!existingAI) {
      const { error: aiError } = await supabase
        .from('ai_configurations')
        .insert({
          config_id: ulid(),
          org_id: orgId,
          provider: 'gemini',
          selected_model: 'gemini-2.0-flash-exp',
          is_configured: false
        });
      
      if (aiError) {
        console.log('❌ AI configuration creation failed:', aiError.message);
      } else {
        console.log('✅ AI configuration created');
      }
    } else {
      console.log('✅ AI configuration already exists');
    }
    
    // Step 6: Setup Skills Categories
    console.log('\n6️⃣ Setting up Skills Categories...');
    
    const { data: existingCategories } = await supabase
      .from('skill_categories')
      .select('*')
      .eq('org_id', orgId);
    
    if (existingCategories.length === 0) {
      const categories = [
        {
          category_id: ulid(),
          org_id: orgId,
          title: 'Frontend Development',
          icon: '⚛️',
          color: 'blue',
          order_key: '000001'
        },
        {
          category_id: ulid(),
          org_id: orgId,
          title: 'Backend Development',
          icon: '🚀',
          color: 'green',
          order_key: '000002'
        },
        {
          category_id: ulid(),
          org_id: orgId,
          title: 'Tools & Technologies',
          icon: '🛠️',
          color: 'purple',
          order_key: '000003'
        }
      ];
      
      const { error: categoriesError } = await supabase
        .from('skill_categories')
        .insert(categories);
      
      if (categoriesError) {
        console.log('❌ Skill categories creation failed:', categoriesError.message);
      } else {
        console.log('✅ Skill categories created');
        
        // Add sample skills
        const skills = [
          // Frontend skills
          { skill_id: ulid(), category_id: categories[0].category_id, name: 'React', level: 90, order_key: '000001' },
          { skill_id: ulid(), category_id: categories[0].category_id, name: 'TypeScript', level: 85, order_key: '000002' },
          { skill_id: ulid(), category_id: categories[0].category_id, name: 'Tailwind CSS', level: 80, order_key: '000003' },
          
          // Backend skills
          { skill_id: ulid(), category_id: categories[1].category_id, name: 'Node.js', level: 85, order_key: '000001' },
          { skill_id: ulid(), category_id: categories[1].category_id, name: 'PostgreSQL', level: 80, order_key: '000002' },
          { skill_id: ulid(), category_id: categories[1].category_id, name: 'Supabase', level: 75, order_key: '000003' },
          
          // Tools
          { skill_id: ulid(), category_id: categories[2].category_id, name: 'Git', level: 90, order_key: '000001' },
          { skill_id: ulid(), category_id: categories[2].category_id, name: 'Docker', level: 70, order_key: '000002' },
          { skill_id: ulid(), category_id: categories[2].category_id, name: 'AWS', level: 65, order_key: '000003' }
        ];
        
        const { error: skillsError } = await supabase
          .from('skills')
          .insert(skills);
        
        if (skillsError) {
          console.log('❌ Skills creation failed:', skillsError.message);
        } else {
          console.log('✅ Skills created');
        }
      }
    } else {
      console.log('✅ Skill categories already exist');
    }
    
    // Step 7: Setup Tools
    console.log('\n7️⃣ Setting up Tools...');
    
    const { data: existingTools } = await supabase
      .from('tools')
      .select('*')
      .eq('org_id', orgId);
    
    if (existingTools.length === 0) {
      const tools = [
        { tool_id: ulid(), org_id: orgId, name: 'VS Code', icon: '💻', color: 'blue', order_key: '000001' },
        { tool_id: ulid(), org_id: orgId, name: 'Figma', icon: '🎨', color: 'purple', order_key: '000002' },
        { tool_id: ulid(), org_id: orgId, name: 'Postman', icon: '📮', color: 'orange', order_key: '000003' },
        { tool_id: ulid(), org_id: orgId, name: 'Slack', icon: '💬', color: 'green', order_key: '000004' }
      ];
      
      const { error: toolsError } = await supabase
        .from('tools')
        .insert(tools);
      
      if (toolsError) {
        console.log('❌ Tools creation failed:', toolsError.message);
      } else {
        console.log('✅ Tools created');
      }
    } else {
      console.log('✅ Tools already exist');
    }
    
    console.log('\n🎉 Default data setup complete!');
    console.log('All admin sections should now load properly.');
    console.log('Refresh your admin dashboard to see the changes.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDefaultData().catch(console.error);