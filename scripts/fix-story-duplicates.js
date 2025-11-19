import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceCleanup() {
    console.log('🧹 Force cleaning all story sections...');
    
    // Delete all story paragraphs first
    const { error: paragraphError } = await supabase
        .from('story_paragraphs')
        .delete()
        .neq('paragraph_id', 'impossible-id');
    
    if (paragraphError) {
        console.error('Error deleting paragraphs:', paragraphError);
    } else {
        console.log('✅ Deleted all story paragraphs');
    }
    
    // Delete all story sections
    const { error: sectionError } = await supabase
        .from('story_sections')
        .delete()
        .eq('org_id', 'arpan-portfolio');
    
    if (sectionError) {
        console.error('Error deleting sections:', sectionError);
    } else {
        console.log('✅ Deleted all story sections');
    }
    
    // Create a single new story section
    const { data: newSection, error: createError } = await supabase
        .from('story_sections')
        .insert({
            org_id: 'arpan-portfolio',
            title: 'My Story',
            subtitle: 'Once upon a time...'
        })
        .select()
        .single();
    
    if (createError) {
        console.error('Error creating new section:', createError);
        return;
    }
    
    console.log('✅ Created new story section:', newSection.story_id);
    
    // Add paragraphs
    const paragraphs = [
        'In the ever-shifting landscape of business, a Management Consultant set forth on a mission: to turn complexity into clarity, data into direction, and strategy into success.',
        'Armed with strategic problem-solving, data analysis, and actionable insights, I navigate the intricate pathways of decision-making, helping leaders and organizations find their way through uncertainty.',
        'Each project is a new chapter, each challenge a new adventure. Let\'s embark on this journey together—where data meets strategy, and insights lead to success.'
    ];
    
    for (let i = 0; i < paragraphs.length; i++) {
        const { error: paragraphError } = await supabase
            .from('story_paragraphs')
            .insert({
                story_id: newSection.story_id,
                content: paragraphs[i],
                order_index: i
            });
        
        if (paragraphError) {
            console.error('Error creating paragraph:', paragraphError);
        }
    }
    
    console.log('✅ Added', paragraphs.length, 'paragraphs');
    console.log('🎉 Story section recreated successfully!');
}

forceCleanup().catch(console.error);